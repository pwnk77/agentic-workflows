import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ErrorCode, 
  ListResourcesRequestSchema, 
  ListToolsRequestSchema, 
  McpError, 
  ReadResourceRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { specTools } from './tools/spec-tools';
import { ProjectService } from '../services/project.service';
import { SpecGenResourceHandler } from './resources/spec-resource';

/**
 * SpecGen MCP Server
 * Provides Claude Code integration for project-scoped specification management
 */
class SpecGenMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'specgen-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupErrorHandling();
  }

  /**
   * Setup tool request handlers
   */
  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: specTools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // Verify project is initialized before processing tool calls
      if (!ProjectService.isInInitializedProject()) {
        throw new McpError(
          ErrorCode.InvalidRequest, 
          'Project not initialized. Run "specgen init" first.'
        );
      }

      // Find and execute the requested tool
      const tool = specTools.find(t => t.name === name);
      
      if (!tool) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
      }

      try {
        const result = await (tool.handler as any)(args || {});
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  /**
   * Setup resource request handlers
   */
  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      try {
        // Check if project is initialized
        if (!ProjectService.isInInitializedProject()) {
          return { resources: [] };
        }

        const resources = await SpecGenResourceHandler.listAllResources();
        return { resources };
      } catch (error) {
        // Return empty resources on error to avoid breaking the connection
        return { resources: [] };
      }
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (!ProjectService.isInInitializedProject()) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Project not initialized'
        );
      }

      try {
        const resource = await SpecGenResourceHandler.readResource(uri);
        
        return {
          contents: [resource]
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to read resource: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[SpecGen MCP Server Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Connect to transport and start server
   */
  async connect(transport: any): Promise<void> {
    await this.server.connect(transport);
  }

  /**
   * Close server connection
   */
  async close(): Promise<void> {
    await this.server.close();
  }
}

/**
 * Start the MCP server with stdio transport
 */
export async function startMCPServer(): Promise<void> {
  const server = new SpecGenMCPServer();
  const transport = new StdioServerTransport();
  
  try {
    await server.connect(transport);
    console.error('SpecGen MCP Server started successfully'); // Use stderr for logging
  } catch (error) {
    console.error('Failed to start SpecGen MCP Server:', error);
    process.exit(1);
  }
}

// If run directly, start the server
if (require.main === module) {
  startMCPServer().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}