/**
 * MCP tools for spec management with Zod validation
 */

import { 
  createSpecToolSchema,
  updateSpecToolSchema,
  listSpecsToolSchema,
  getSpecToolSchema,
  deleteSpecToolSchema,
  searchSpecsToolSchema,
  getSpecStatsToolSchema,
  CreateSpecToolInput,
  UpdateSpecToolInput,
  ListSpecsToolInput,
  GetSpecToolInput,
  DeleteSpecToolInput,
  SearchSpecsToolInput,
  GetSpecStatsToolInput
} from '../schemas/tool-schemas.js';
import { SpecService, SearchService } from '../../services/index.js';
import { MCPToolResult } from '../types.js';
import { logger } from '../../services/logging.service.js';

// Initialize services
const specService = new SpecService();
const searchService = new SearchService();

// Helper function to create tool result
function createToolResult(data: any, isError = false): MCPToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }
    ],
    isError
  };
}

// Helper function to handle tool errors
function handleToolError(error: unknown, toolName: string): MCPToolResult {
  logger.error(`MCP tool ${toolName} failed`, error as Error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          error: errorMessage,
          tool: toolName,
          timestamp: new Date().toISOString()
        }, null, 2)
      }
    ],
    isError: true
  };
}

// MCP Tool definitions
export const specTools = [
  {
    name: 'create_spec',
    description: 'Create a new specification document',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 255 },
        body_md: { type: 'string', minLength: 1 },
        status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'], default: 'draft' }
      },
      required: ['title', 'body_md'],
      additionalProperties: false
    },
    handler: async (args: CreateSpecToolInput): Promise<MCPToolResult> => {
      try {
        const validation = createSpecToolSchema.safeParse(args);
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }

        const spec = await specService.createSpec({
          title: validation.data.title,
          bodyMd: validation.data.body_md,
          status: validation.data.status
        });

        return createToolResult({
          success: true,
          spec: {
            id: spec.id,
            title: spec.title,
            status: spec.status,
            created_at: spec.createdAt.toISOString(),
            version: spec.version
          }
        });
      } catch (error) {
        return handleToolError(error, 'create_spec');
      }
    }
  },

  {
    name: 'update_spec',
    description: 'Update an existing specification document',
    inputSchema: {
      type: 'object',
      properties: {
        spec_id: { type: 'number' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        body_md: { type: 'string', minLength: 1 },
        status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'] }
      },
      required: ['spec_id'],
      additionalProperties: false
    },
    handler: async (args: UpdateSpecToolInput): Promise<MCPToolResult> => {
      try {
        const validation = updateSpecToolSchema.safeParse(args);
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }

        const { spec_id, ...updateData } = validation.data;
        const updateFields: any = {};
        
        if (updateData.title) updateFields.title = updateData.title;
        if (updateData.body_md) updateFields.bodyMd = updateData.body_md;
        if (updateData.status) updateFields.status = updateData.status;

        const spec = await specService.updateSpec(spec_id, updateFields);

        return createToolResult({
          success: true,
          spec: {
            id: spec.id,
            title: spec.title,
            status: spec.status,
            updated_at: spec.updatedAt.toISOString(),
            version: spec.version
          }
        });
      } catch (error) {
        return handleToolError(error, 'update_spec');
      }
    }
  },

  {
    name: 'get_spec',
    description: 'Retrieve a specific specification by ID',
    inputSchema: {
      type: 'object',
      properties: {
        spec_id: { type: 'number' },
        include_relations: { type: 'boolean', default: false }
      },
      required: ['spec_id'],
      additionalProperties: false
    },
    handler: async (args: GetSpecToolInput): Promise<MCPToolResult> => {
      try {
        const validation = getSpecToolSchema.safeParse(args);
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }

        const spec = await specService.getSpec(
          validation.data.spec_id,
          validation.data.include_relations
        );

        const result: any = {
          id: spec.id,
          title: spec.title,
          body_md: spec.bodyMd,
          status: spec.status,
          created_at: spec.createdAt.toISOString(),
          updated_at: spec.updatedAt.toISOString(),
          version: spec.version
        };

        // Include relations if requested
        if (validation.data.include_relations) {
          result.todos = spec.todos || [];
          result.exec_logs = spec.execLogs || [];
          result.issue_logs = spec.issueLogs || [];
        }

        return createToolResult({
          success: true,
          spec: result
        });
      } catch (error) {
        return handleToolError(error, 'get_spec');
      }
    }
  },

  {
    name: 'list_specs',
    description: 'List specifications with pagination and filtering',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', minimum: 1, maximum: 1000, default: 50 },
        offset: { type: 'number', minimum: 0, default: 0 },
        status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'] },
        sort_by: { type: 'string', enum: ['id', 'title', 'created_at', 'updated_at'], default: 'created_at' },
        sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
      },
      required: [],
      additionalProperties: false
    },
    handler: async (args: ListSpecsToolInput): Promise<MCPToolResult> => {
      try {
        const validation = listSpecsToolSchema.safeParse(args);
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }

        const query = {
          limit: validation.data.limit,
          offset: validation.data.offset,
          status: validation.data.status,
          sortBy: validation.data.sort_by,
          sortOrder: validation.data.sort_order.toUpperCase() as 'ASC' | 'DESC'
        };

        const result = await specService.listSpecs(query);

        return createToolResult({
          success: true,
          specs: result.specs.map(spec => ({
            id: spec.id,
            title: spec.title,
            status: spec.status,
            created_at: spec.createdAt.toISOString(),
            updated_at: spec.updatedAt.toISOString(),
            version: spec.version
          })),
          pagination: {
            total: result.total,
            limit: result.limit,
            offset: result.offset,
            has_more: result.hasMore
          }
        });
      } catch (error) {
        return handleToolError(error, 'list_specs');
      }
    }
  },

  {
    name: 'delete_spec',
    description: 'Delete a specification by ID',
    inputSchema: {
      type: 'object',
      properties: {
        spec_id: { type: 'number' }
      },
      required: ['spec_id'],
      additionalProperties: false
    },
    handler: async (args: DeleteSpecToolInput): Promise<MCPToolResult> => {
      try {
        const validation = deleteSpecToolSchema.safeParse(args);
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }

        await specService.deleteSpec(validation.data.spec_id);

        return createToolResult({
          success: true,
          message: `Specification ${validation.data.spec_id} deleted successfully`,
          spec_id: validation.data.spec_id
        });
      } catch (error) {
        return handleToolError(error, 'delete_spec');
      }
    }
  },

  {
    name: 'search_specs',
    description: 'Search specifications using full-text search',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1 },
        limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
        offset: { type: 'number', minimum: 0, default: 0 },
        min_score: { type: 'number', minimum: 0, maximum: 1, default: 0.1 }
      },
      required: ['query'],
      additionalProperties: false
    },
    handler: async (args: SearchSpecsToolInput): Promise<MCPToolResult> => {
      try {
        const validation = searchSpecsToolSchema.safeParse(args);
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }

        const searchResult = await searchService.searchSpecs({
          query: validation.data.query,
          limit: validation.data.limit,
          offset: validation.data.offset,
          minScore: validation.data.min_score
        });

        return createToolResult({
          success: true,
          query: searchResult.query,
          results: searchResult.results.map(result => ({
            id: result.id,
            title: result.title,
            status: result.status,
            score: result.score,
            snippet: result.snippet,
            created_at: result.createdAt.toISOString(),
            updated_at: result.updatedAt.toISOString()
          })),
          pagination: {
            total: searchResult.total,
            limit: searchResult.limit,
            offset: searchResult.offset,
            has_more: searchResult.hasMore
          },
          search_time_ms: searchResult.searchTime
        });
      } catch (error) {
        return handleToolError(error, 'search_specs');
      }
    }
  },

  {
    name: 'get_spec_stats',
    description: 'Get specification statistics and counts',
    inputSchema: {
      type: 'object',
      properties: {
        include_details: { type: 'boolean', default: false }
      },
      required: [],
      additionalProperties: false
    },
    handler: async (args: GetSpecStatsToolInput): Promise<MCPToolResult> => {
      try {
        const validation = getSpecStatsToolSchema.safeParse(args);
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }

        const [specStats, searchStats] = await Promise.all([
          specService.getSpecStats(),
          validation.data.include_details ? searchService.getSearchStats() : null
        ]);

        const result: any = {
          success: true,
          specs: {
            total: specStats.total,
            by_status: specStats.byStatus
          }
        };

        if (searchStats) {
          result.search = {
            total_documents: searchStats.totalDocuments,
            avg_document_length: searchStats.avgDocumentLength,
            index_size_bytes: searchStats.indexSize
          };
        }

        return createToolResult(result);
      } catch (error) {
        return handleToolError(error, 'get_spec_stats');
      }
    }
  }
];