import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ProjectService } from '../services/project.service.js';
import { SpecService } from '../services/spec.service.js';

// Define Zod schemas for our tools
const listSpecsSchema = z.object({
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional(),
  feature_group: z.string().optional(),
  theme_category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  created_via: z.string().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  sort_by: z.enum(['id', 'title', 'created_at', 'updated_at', 'priority']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  group_by: z.enum(['feature_group', 'status', 'priority']).optional(),
  include_counts: z.boolean().optional(),
});

const createSpecSchema = z.object({
  title: z.string(),
  body_md: z.string(),
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional(),
  feature_group: z.string().optional(),
  theme_category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  related_specs: z.array(z.number()).optional(),
  parent_spec_id: z.number().optional(),
  created_via: z.string().optional(),
});

const getSpecSchema = z.object({
  spec_id: z.number(),
  include_relations: z.boolean().optional(),
});

const searchSpecsSchema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  min_score: z.number().min(0).max(1).optional(),
});

// Create the MCP server
const server = new McpServer({
  name: 'specgen-mcp',
  version: '1.0.0',
  description: 'Project-scoped specification management for Claude Code with MCP integration',
});

// Register list_specs tool
server.tool(
  'list_specs',
  'List specifications with optional filtering, pagination, and grouping',
  listSpecsSchema._def.shape(),
  async (params) => {
    try {
      if (!ProjectService.isInInitializedProject()) {
        throw new Error('Project not initialized. Run "specgen init" first.');
      }
      
      const validated = listSpecsSchema.parse(params);
      const result = SpecService.listSpecs(validated);
      
      // Add grouping functionality if requested
      if (validated.group_by) {
        const groupBy = validated.group_by;
        const grouped = result.specs.reduce((acc: any, spec: any) => {
          const key = spec[groupBy] || 'uncategorized';
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(spec);
          return acc;
        }, {});

        const groupCounts = Object.keys(grouped).reduce((acc: any, key) => {
          acc[key] = grouped[key].length;
          return acc;
        }, {});

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              specs: result.specs,
              pagination: result.pagination,
              grouped_specs: grouped,
              group_counts: groupCounts,
              group_by: groupBy
            }, null, 2)
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register create_spec tool
server.tool(
  'create_spec',
  'Create a new specification with auto-category detection',
  createSpecSchema._def.shape(),
  async (params) => {
    try {
      if (!ProjectService.isInInitializedProject()) {
        throw new Error('Project not initialized. Run "specgen init" first.');
      }
      
      const validated = createSpecSchema.parse(params);
      const result = await SpecService.createSpec(validated);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register get_spec tool
server.tool(
  'get_spec',
  'Get a specific specification by ID with optional relations',
  getSpecSchema._def.shape(),
  async (params) => {
    try {
      if (!ProjectService.isInInitializedProject()) {
        throw new Error('Project not initialized. Run "specgen init" first.');
      }
      
      const validated = getSpecSchema.parse(params);
      const result = SpecService.getSpecById(validated.spec_id);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register search_specs tool
server.tool(
  'search_specs',
  'Search specifications with category boosting support',
  searchSpecsSchema._def.shape(),
  async (params) => {
    try {
      if (!ProjectService.isInInitializedProject()) {
        throw new Error('Project not initialized. Run "specgen init" first.');
      }
      
      const validated = searchSpecsSchema.parse(params);
      const result = SpecService.searchSpecs(validated.query, {
        limit: validated.limit,
        offset: validated.offset,
        min_score: validated.min_score
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Setup error handling
process.on('SIGINT', async () => {
  console.error('Shutting down SpecGen MCP Server...');
  process.exit(0);
});

/**
 * Start the MCP server with stdio transport
 */
export async function startMCPServer(): Promise<void> {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('SpecGen MCP Server started successfully'); // Use stderr for logging
  } catch (error) {
    console.error('Failed to start SpecGen MCP Server:', error);
    process.exit(1);
  }
}

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('SpecGen MCP Server running...');
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// If run directly, start the server
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}