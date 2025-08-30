/**
 * MCP server using @modelcontextprotocol/sdk
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getAppSettings } from '../config/settings.js';
import { logger } from '../services/logging.service.js';
import { MCPServerConfig } from './types.js';

// Import MCP tools and resources
import { specTools } from './tools/spec-tools.js';
import { specResources, dashboardResource } from './resources/index.js';

export class MCPServerManager {
  private server: Server;
  private config: MCPServerConfig;
  private initialized = false;

  constructor() {
    const settings = getAppSettings();
    
    this.config = {
      name: settings.mcp.serverName,
      version: settings.mcp.serverVersion,
      maxTools: settings.mcp.maxTools,
      maxResources: settings.mcp.maxResources
    };

    this.server = new Server(
      {
        name: this.config.name,
        version: this.config.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('MCP: Listing available tools');
      
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
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      logger.debug('MCP: Executing tool', { tool: name, args });

      try {
        // Find and execute the requested tool
        const tool = specTools.find(t => t.name === name);
        if (!tool) {
          throw new Error(`Unknown tool: ${name}`);
        }

        const result = await tool.handler(args as any || {});
        
        logger.debug('MCP: Tool execution completed', { tool: name });
        return {
          content: result.content,
          isError: false
        };
      } catch (error) {
        logger.error('MCP: Tool execution failed', error as Error, { tool: name });
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
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      logger.debug('MCP: Listing available resources');
      
      try {
        const specResourcesList = await specResources.list();
        
        return {
          resources: [
            dashboardResource,
            ...specResourcesList
          ]
        };
      } catch (error) {
        logger.error('MCP: Failed to list resources', error as Error);
        return { resources: [] };
      }
    });

    // Handle resource reading
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      logger.debug('MCP: Reading resource', { uri });

      try {
        // Handle different resource types
        if (uri === 'dashboard.html://index') {
          return await dashboardResource.read();
        } else if (uri.startsWith('spec://')) {
          return await specResources.read(uri);
        } else {
          throw new Error(`Unknown resource URI: ${uri}`);
        }
      } catch (error) {
        logger.error('MCP: Resource reading failed', error as Error, { uri });
        throw error;
      }
    });
  }

  async start(): Promise<void> {
    if (this.initialized) {
      logger.warn('MCP server already initialized');
      return;
    }

    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      this.initialized = true;
      logger.info('MCP server started successfully', {
        name: this.config.name,
        version: this.config.version
      });
    } catch (error) {
      logger.error('Failed to start MCP server', error as Error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      await this.server.close();
      this.initialized = false;
      logger.info('MCP server closed successfully');
    } catch (error) {
      logger.error('Error closing MCP server', error as Error);
      throw error;
    }
  }

  isRunning(): boolean {
    return this.initialized;
  }

  getConfig(): MCPServerConfig {
    return { ...this.config };
  }
}

// Factory function to create and start MCP server
export function createMCPServer(): MCPServerManager {
  const mcpServer = new MCPServerManager();
  
  // Start the server immediately in stdio mode
  mcpServer.start().catch((error) => {
    logger.error('Failed to start MCP server', error);
    process.exit(1);
  });

  return mcpServer;
}