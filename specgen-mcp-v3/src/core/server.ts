import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// Import existing tools (preserved functionality)
import { listSpecs } from '../tools/existing/list-specs.js';
import { getSpec } from '../tools/existing/get-spec.js';
import { searchSpecs } from '../tools/existing/search-specs.js';
import { refreshMetadata } from '../tools/existing/refresh-metadata.js';
import { launchDashboard } from '../tools/existing/launch-dashboard.js';

// Import new JSON tools (v3.1)
import { updateSpecSection } from '../tools/json/update-spec-section.js';
import { getSpecJSON } from '../tools/json/get-spec-json.js';
import { syncSpecFormats } from '../tools/json/sync-spec-formats.js';
import { createSpecJSON } from '../tools/json/create-spec-json.js';

export class SpecGenServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'specgen-mcp-v3',
        version: '3.0.0',
        description: 'Advanced SpecGen MCP Server with tree-sitter analysis and self-sustained workflows'
      },
      { capabilities: { tools: {} } }
    );

    this.setupTools();
  }

  private setupTools() {
    // Register all tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Legacy tools (preserved with mcp__specgen-mcp__ prefix for backward compatibility)
        {
          name: 'mcp__specgen-mcp__list_specs',
          description: 'List all specification files with metadata from shared JSON',
          inputSchema: {
            type: 'object',
            properties: {
              status: { type: 'string', description: 'Filter by status (draft, todo, in-progress, done)' },
              category: { type: 'string', description: 'Filter by category' },
              limit: { type: 'number', description: 'Limit results' }
            },
            required: []
          }
        },
        {
          name: 'mcp__specgen-mcp__get_spec',
          description: 'Get specification content by filename or title',
          inputSchema: {
            type: 'object',
            properties: {
              feature: { type: 'string', description: 'Filename (SPEC-*.md) or title to search for' },
              format: { type: 'string', enum: ['markdown', 'json', 'auto'], description: 'Output format (default: auto)' }
            },
            required: ['feature']
          }
        },
        {
          name: 'mcp__specgen-mcp__search_specs',
          description: 'Search specifications by text query using shared JSON metadata',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              limit: { type: 'number', description: 'Limit results (default: 100)' }
            },
            required: ['query']
          }
        },
        {
          name: 'mcp__specgen-mcp__refresh_metadata',
          description: 'Scan docs folder and refresh shared JSON metadata',
          inputSchema: {
            type: 'object',
            properties: {
              reason: { type: 'string', description: 'Reason for refresh (optional)' }
            },
            required: []
          }
        },
        {
          name: 'mcp__specgen-mcp__launch_dashboard',
          description: 'Launch web dashboard for visual spec management',
          inputSchema: {
            type: 'object',
            properties: {
              port: { type: 'number', description: 'Port number (default: 3000)' }
            },
            required: []
          }
        },

        // New JSON tools (v3.1)
        {
          name: 'mcp__specgen-mcp__update_spec_section',
          description: 'Update a specific section of a JSON spec (solves token limits)',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Spec ID' },
              section: { type: 'string', enum: ['summary', 'requirements', 'architecture', 'implementation', 'execution_logs', 'debug_logs'], description: 'Section to update' },
              content: { type: 'string', description: 'New content for the section' },
              sync_to_markdown: { type: 'boolean', description: 'Sync to markdown after update (default: true)' }
            },
            required: ['id', 'section', 'content']
          }
        },
        {
          name: 'mcp__specgen-mcp__get_spec_json',
          description: 'Get spec in JSON format for LLM operations',
          inputSchema: {
            type: 'object',
            properties: {
              feature: { type: 'string', description: 'Filename or title to search for' },
              format: { type: 'string', enum: ['pretty', 'compact'], description: 'JSON formatting (default: pretty)' }
            },
            required: ['feature']
          }
        },
        {
          name: 'mcp__specgen-mcp__sync_spec_formats',
          description: 'Manual sync trigger between JSON and Markdown formats',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Spec ID to sync (required if all=false)' },
              direction: { type: 'string', enum: ['json-to-md', 'md-to-json', 'auto'], description: 'Sync direction (default: auto)' },
              all: { type: 'boolean', description: 'Sync all specs (default: false)' }
            },
            required: []
          }
        },
        {
          name: 'mcp__specgen-mcp__create_spec_json',
          description: 'Create a new spec in JSON format',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Spec title' },
              category: { type: 'string', description: 'Spec category (default: General)' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priority level (default: medium)' },
              summary: { type: 'string', description: 'Executive summary' },
              requirements: { type: 'string', description: 'Requirements section' },
              architecture: { type: 'string', description: 'Architecture section' },
              sync_to_markdown: { type: 'boolean', description: 'Sync to markdown after creation (default: true)' }
            },
            required: ['title']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Legacy tools
          case 'mcp__specgen-mcp__list_specs':
            return await listSpecs(args);
          case 'mcp__specgen-mcp__get_spec':
            return await getSpec(args as any || {});
          case 'mcp__specgen-mcp__search_specs':
            return await searchSpecs(args as any || {});
          case 'mcp__specgen-mcp__refresh_metadata':
            return await refreshMetadata(args);
          case 'mcp__specgen-mcp__launch_dashboard':
            return await launchDashboard(args);

          // New v3.1 JSON tools
          case 'mcp__specgen-mcp__update_spec_section':
            return await updateSpecSection(args as any);
          case 'mcp__specgen-mcp__get_spec_json':
            return await getSpecJSON(args as any);
          case 'mcp__specgen-mcp__sync_spec_formats':
            return await syncSpecFormats(args as any);
          case 'mcp__specgen-mcp__create_spec_json':
            return await createSpecJSON(args as any);

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Tool ${name} failed:`, error);
        throw new McpError(ErrorCode.InternalError, `Tool ${name} failed: ${error}`);
      }
    });
  }

  async start(transport: StdioServerTransport) {
    await this.server.connect(transport);
  }
}