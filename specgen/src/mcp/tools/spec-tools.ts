import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SpecService, CreateSpecData, UpdateSpecData } from '../../services/spec.service';
import { ImportService } from '../../services/import.service';

// Simple validation functions
function validateCreateSpec(args: any): { title: string; body_md: string; status?: string; feature_group?: string } {
  if (!args.title || typeof args.title !== 'string') {
    throw new Error('title is required and must be a string');
  }
  if (!args.body_md || typeof args.body_md !== 'string') {
    throw new Error('body_md is required and must be a string');
  }
  return args;
}

function validateUpdateSpec(args: any): { spec_id: number; title?: string; body_md?: string; status?: string; feature_group?: string } {
  if (!args.spec_id || typeof args.spec_id !== 'number') {
    throw new Error('spec_id is required and must be a number');
  }
  return args;
}

function validateGetSpec(args: any): { spec_id: number } {
  if (!args.spec_id || typeof args.spec_id !== 'number') {
    throw new Error('spec_id is required and must be a number');
  }
  return args;
}

/**
 * MCP tool for creating a new specification
 */
export const createSpecTool: Tool = {
  name: 'create_spec',
  description: 'Create a new specification in the current project',
  inputSchema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      body_md: { type: 'string' },
      status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'] },
      feature_group: { type: 'string' }
    },
    required: ['title', 'body_md']
  },
  handler: async (args: any) => {
    const data = validateCreateSpec(args);
    
    try {
      const spec = SpecService.createSpec(data as CreateSpecData);
      return {
        success: true,
        spec,
        message: `Created specification "${spec.title}" with ID ${spec.id}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * MCP tool for updating an existing specification
 */
export const updateSpecTool: Tool = {
  name: 'update_spec',
  description: 'Update an existing specification',
  inputSchema: {
    type: 'object',
    properties: {
      spec_id: { type: 'number' },
      title: { type: 'string' },
      body_md: { type: 'string' },
      status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'] },
      feature_group: { type: 'string' }
    },
    required: ['spec_id']
  },
  handler: async (args: any) => {
    const { spec_id, ...updates } = validateUpdateSpec(args);
    
    try {
      const spec = SpecService.updateSpec(spec_id, updates as UpdateSpecData);
      
      if (!spec) {
        return {
          success: false,
          error: `Specification with ID ${spec_id} not found`
        };
      }
      
      return {
        success: true,
        spec,
        message: `Updated specification "${spec.title}"`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * MCP tool for getting a specification by ID
 */
export const getSpecTool: Tool = {
  name: 'get_spec',
  description: 'Get a specification by ID',
  inputSchema: {
    type: 'object',
    properties: {
      spec_id: { type: 'number' }
    },
    required: ['spec_id']
  },
  handler: async (args: any) => {
    const { spec_id } = validateGetSpec(args);
    
    try {
      const spec = SpecService.getSpecById(spec_id);
      
      if (!spec) {
        return {
          success: false,
          error: `Specification with ID ${spec_id} not found`
        };
      }
      
      return {
        success: true,
        spec
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * MCP tool for listing specifications with filtering and pagination
 */
export const listSpecsTool: Tool = {
  name: 'list_specs',
  description: 'List specifications with optional filtering and pagination',
  inputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'] },
      feature_group: { type: 'string' },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      offset: { type: 'number', minimum: 0 },
      sort_by: { type: 'string', enum: ['id', 'title', 'created_at', 'updated_at'] },
      sort_order: { type: 'string', enum: ['asc', 'desc'] }
    }
  },
  handler: async (args: any) => {
    try {
      const result = SpecService.listSpecs(args || {});
      
      return {
        success: true,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * MCP tool for searching specifications using full-text search
 */
export const searchSpecsTool: Tool = {
  name: 'search_specs',
  description: 'Search specifications using full-text search',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      limit: { type: 'number', minimum: 1, maximum: 100 },
      offset: { type: 'number', minimum: 0 },
      min_score: { type: 'number', minimum: 0, maximum: 1 }
    },
    required: ['query']
  },
  handler: async (args: any) => {
    try {
      const result = SpecService.searchSpecs(args.query, {
        limit: args.limit,
        offset: args.offset,
        min_score: args.min_score
      });
      
      return {
        success: true,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * MCP tool for importing SPEC files from a directory
 */
export const importSpecsTool: Tool = {
  name: 'import_specs',
  description: 'Import SPEC files from a directory into the current project',
  inputSchema: {
    type: 'object',
    properties: {
      directory_path: { type: 'string' },
      pattern: { type: 'string' },
      overwrite: { type: 'boolean' }
    },
    required: ['directory_path']
  },
  handler: async (args: any) => {
    try {
      const result = await ImportService.importFromDirectory(args.directory_path, args.pattern, {
        overwrite: args.overwrite || false
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * MCP tool for deleting a specification
 */
export const deleteSpecTool: Tool = {
  name: 'delete_spec',
  description: 'Delete a specification by ID',
  inputSchema: {
    type: 'object',
    properties: {
      spec_id: { type: 'number' }
    },
    required: ['spec_id']
  },
  handler: async (args: any) => {
    try {
      const success = SpecService.deleteSpec(args.spec_id);
      
      if (!success) {
        return {
          success: false,
          error: `Specification with ID ${args.spec_id} not found`
        };
      }
      
      return {
        success: true,
        message: `Deleted specification with ID ${args.spec_id}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * MCP tool for getting project statistics
 */
export const getSpecStatsTool: Tool = {
  name: 'get_spec_stats',
  description: 'Get specification statistics for the current project',
  inputSchema: {
    type: 'object',
    properties: {
      include_details: { type: 'boolean' }
    }
  },
  handler: async (args: any) => {
    try {
      const stats = SpecService.getStats(args?.include_details || false);
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

// Export all tools as an array
export const specTools: Tool[] = [
  createSpecTool,
  updateSpecTool,
  getSpecTool,
  listSpecsTool,
  searchSpecsTool,
  importSpecsTool,
  deleteSpecTool,
  getSpecStatsTool
];