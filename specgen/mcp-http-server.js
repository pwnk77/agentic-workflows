#!/usr/bin/env node

/**
 * MCP HTTP Streaming Transport Server
 * Uses the modern Streamable HTTP transport with SSE support
 */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema, 
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { initializeDatabase } from './dist/database/data-source.js';
import { getAppSettings } from './dist/config/settings.js';
import { logger } from './dist/services/logging.service.js';
import { specTools } from './dist/mcp/tools/spec-tools.js';
import { specResources, dashboardResource } from './dist/mcp/resources/index.js';

class MCPHttpServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.mcpServer = null;
    this.settings = getAppSettings();
    this.sessions = new Map(); // Session storage
    
    this.setupMiddleware();
    this.setupMCPServer();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:3000', 'https://claude.ai', 'https://client.claude.ai'],
      methods: ['GET', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'MCP-Protocol-Version', 'Mcp-Session-Id', 'Origin'],
      exposedHeaders: ['Mcp-Session-Id']
    }));
    
    this.app.use(express.json());
  }

  setupMCPServer() {
    this.mcpServer = new Server(
      {
        name: this.settings.mcp.serverName,
        version: this.settings.mcp.serverVersion,
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        },
      }
    );

    this.setupMCPHandlers();
  }

  setupMCPHandlers() {
    // List available tools
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('MCP HTTP: Listing available tools');
      
      return {
        tools: [
          ...specTools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          }))
        ]
      };
    });

    // Handle tool execution
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      logger.debug('MCP HTTP: Executing tool', { tool: name, args });

      try {
        const tool = specTools.find(t => t.name === name);
        if (!tool) {
          throw new Error(`Unknown tool: ${name}`);
        }

        const result = await tool.handler(args || {});
        
        logger.debug('MCP HTTP: Tool execution completed', { tool: name });
        return {
          content: result.content,
          isError: false
        };
      } catch (error) {
        logger.error('MCP HTTP: Tool execution failed', error, { tool: name });
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    });

    // List available resources
    this.mcpServer.setRequestHandler(ListResourcesRequestSchema, async () => {
      logger.debug('MCP HTTP: Listing available resources');
      
      try {
        const specResourcesList = await specResources.list();
        
        return {
          resources: [
            dashboardResource,
            ...specResourcesList
          ]
        };
      } catch (error) {
        logger.error('MCP HTTP: Failed to list resources', error);
        return { resources: [] };
      }
    });

    // Handle resource reading
    this.mcpServer.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      logger.debug('MCP HTTP: Reading resource', { uri });

      try {
        if (uri === 'dashboard.html://index') {
          return await dashboardResource.read();
        } else if (uri.startsWith('spec://')) {
          return await specResources.read(uri);
        } else {
          throw new Error(`Unknown resource URI: ${uri}`);
        }
      } catch (error) {
        logger.error('MCP HTTP: Resource reading failed', error, { uri });
        throw error;
      }
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', transport: 'http-sse' });
    });

    // Main MCP endpoint - Streamable HTTP transport
    this.app.post('/mcp', async (req, res) => {
      try {
        // Validate required headers
        const protocolVersion = req.headers['mcp-protocol-version'];
        if (!protocolVersion) {
          return res.status(400).json({ error: 'MCP-Protocol-Version header required' });
        }

        // Validate origin for security (DNS rebinding protection)
        const origin = req.headers.origin;
        const allowedOrigins = ['http://localhost:3000', 'https://claude.ai', 'https://client.claude.ai'];
        if (origin && !allowedOrigins.includes(origin)) {
          return res.status(403).json({ error: 'Origin not allowed' });
        }

        // Handle session management
        let sessionId = req.headers['mcp-session-id'];
        if (req.body.method === 'initialize') {
          sessionId = this.generateSessionId();
          this.sessions.set(sessionId, { created: new Date() });
          res.setHeader('Mcp-Session-Id', sessionId);
          logger.info('MCP HTTP: New session created', { sessionId });
        }

        // Process the MCP request
        const response = await this.handleMCPRequest(req.body, sessionId);
        
        // Check if response needs streaming (for large responses or notifications)
        if (this.needsStreaming(response)) {
          // Set up SSE stream
          res.writeHead(202, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': origin || '*'
          });

          // Send response as SSE event
          res.write(`data: ${JSON.stringify(response)}\n\n`);
          
          // Keep connection alive for potential follow-up messages
          const keepAlive = setInterval(() => {
            res.write(': heartbeat\n\n');
          }, 30000);

          // Clean up on client disconnect
          req.on('close', () => {
            clearInterval(keepAlive);
            res.end();
          });

        } else {
          // Send regular HTTP response
          res.status(200).json(response);
        }

      } catch (error) {
        logger.error('MCP HTTP: Request handling failed', error);
        res.status(500).json({ 
          error: 'Internal server error',
          message: error.message 
        });
      }
    });

    // GET endpoint for SSE connection establishment
    this.app.get('/mcp', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': req.headers.origin || '*'
      });

      res.write('data: {"type": "connection_established"}\n\n');

      const keepAlive = setInterval(() => {
        res.write(': heartbeat\n\n');
      }, 30000);

      req.on('close', () => {
        clearInterval(keepAlive);
        res.end();
      });
    });
  }

  async handleMCPRequest(request, sessionId) {
    // Validate the request format
    if (!request.jsonrpc || request.jsonrpc !== '2.0') {
      throw new Error('Invalid JSON-RPC format');
    }

    // Process the request through the MCP server
    return await this.mcpServer.request(request, {
      sessionId: sessionId
    });
  }

  needsStreaming(response) {
    // Determine if response needs SSE streaming
    // For now, keep it simple - use streaming for large responses
    const responseSize = JSON.stringify(response).length;
    return responseSize > 10000 || response.type === 'streaming';
  }

  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
  }

  async start(port = 3001) {
    try {
      // Initialize database
      logger.info('Initializing database...');
      await initializeDatabase('./specgen.sqlite');
      logger.info('Database initialized successfully');

      // Start HTTP server
      this.server = this.app.listen(port, 'localhost', () => {
        logger.info(`MCP HTTP server started on http://localhost:${port}`);
        logger.info('Available endpoints:');
        logger.info('  POST /mcp - Main MCP endpoint');
        logger.info('  GET  /mcp - SSE connection');
        logger.info('  GET  /health - Health check');
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => this.shutdown('SIGINT'));
      process.on('SIGTERM', () => this.shutdown('SIGTERM'));

    } catch (error) {
      logger.error('Failed to start MCP HTTP server:', error);
      process.exit(1);
    }
  }

  async shutdown(signal) {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    
    if (this.server) {
      this.server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    }
  }
}

// Start the server
const mcpHttpServer = new MCPHttpServer();
const port = process.env.PORT || 3001;
mcpHttpServer.start(port);