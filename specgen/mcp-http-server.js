#!/usr/bin/env node

/**
 * MCP HTTP Streaming Transport Server
 * Uses the modern Streamable HTTP transport with SSE support
 */

import express from 'express';
import cors from 'cors';
// Direct MCP protocol implementation - no SDK transport needed
import { initializeDatabase } from './dist/database/data-source.js';
import { getAppSettings } from './dist/config/settings.js';
import { logger } from './dist/services/logging.service.js';
import { specTools } from './dist/mcp/tools/spec-tools.js';
import { specResources, dashboardResource } from './dist/mcp/resources/index.js';

class MCPHttpServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.settings = getAppSettings();
    this.sessions = new Map(); // Session storage
    
    this.setupMiddleware();
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

    // Handle MCP methods directly
    try {
      switch (request.method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
                resources: {}
              },
              serverInfo: {
                name: this.settings.mcp.serverName,
                version: this.settings.mcp.serverVersion
              }
            }
          };

        case 'tools/list':
          const tools = specTools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          }));
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: { tools }
          };

        case 'tools/call':
          const { name, arguments: args } = request.params;
          const tool = specTools.find(t => t.name === name);
          if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
          }
          const result = await tool.handler(args || {});
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: result.content,
              isError: false
            }
          };

        case 'resources/list':
          const specResourcesList = await specResources.list();
          const resources = [dashboardResource, ...specResourcesList];
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: { resources }
          };

        case 'resources/read':
          const { uri } = request.params;
          let resourceResult;
          if (uri === 'dashboard.html://index') {
            resourceResult = await dashboardResource.read();
          } else if (uri.startsWith('spec://')) {
            resourceResult = await specResources.read(uri);
          } else {
            throw new Error(`Unknown resource URI: ${uri}`);
          }
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: resourceResult
          };

        default:
          throw new Error(`Unknown method: ${request.method}`);
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
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