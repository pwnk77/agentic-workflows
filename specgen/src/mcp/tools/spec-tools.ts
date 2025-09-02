// Using any type for compatibility
import { SpecService, CreateSpecData, UpdateSpecData } from '../../services/spec.service.js';
import { ImportService } from '../../services/import.service.js';
import { SpecGroupingService } from '../../services/grouping.service.js';
import { RelationshipService } from '../../services/relationship.service.js';

// Simple validation functions
function validateCreateSpec(args: any): { 
  title: string; 
  body_md: string; 
  status?: string; 
  feature_group?: string; 
  theme_category?: string; 
  priority?: string; 
  related_specs?: number[]; 
  parent_spec_id?: number; 
  created_via?: string; 
} {
  if (!args.title || typeof args.title !== 'string') {
    throw new Error('title is required and must be a string');
  }
  if (!args.body_md || typeof args.body_md !== 'string') {
    throw new Error('body_md is required and must be a string');
  }
  return args;
}

function validateUpdateSpec(args: any): { 
  spec_id: number; 
  title?: string; 
  body_md?: string; 
  status?: string; 
  feature_group?: string; 
  theme_category?: string; 
  priority?: string; 
  related_specs?: number[]; 
  parent_spec_id?: number; 
  last_command?: string; 
} {
  if (!args.spec_id || typeof args.spec_id !== 'number') {
    throw new Error('spec_id is required and must be a number');
  }
  return args;
}

function validateGetSpec(args: any): { spec_id: number; include_relations?: boolean } {
  if (!args.spec_id || typeof args.spec_id !== 'number') {
    throw new Error('spec_id is required and must be a number');
  }
  return args;
}

function validateSearchRelatedSpecs(args: any): { 
  query: string; 
  current_spec_id?: number; 
  feature_group?: string; 
  limit?: number; 
  offset?: number; 
} {
  if (!args.query || typeof args.query !== 'string') {
    throw new Error('query is required and must be a string');
  }
  return args;
}

function validateUpdateSpecRelationships(args: any): { 
  spec_id: number; 
  related_specs: number[]; 
  parent_spec_id?: number; 
} {
  if (!args.spec_id || typeof args.spec_id !== 'number') {
    throw new Error('spec_id is required and must be a number');
  }
  if (!Array.isArray(args.related_specs)) {
    throw new Error('related_specs is required and must be an array');
  }
  return args;
}

/**
 * MCP tool for creating a new specification
 */
export const createSpecTool: any = {
  name: 'create_spec',
  description: 'Create a new specification in the current project',
  inputSchema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      body_md: { type: 'string' },
      status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'] },
      feature_group: { type: 'string' },
      theme_category: { type: 'string' },
      priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      related_specs: { type: 'array', items: { type: 'number' } },
      parent_spec_id: { type: 'number' },
      created_via: { type: 'string' }
    },
    required: ['title', 'body_md']
  },
  handler: async (args: any) => {
    const data = validateCreateSpec(args);
    
    try {
      // Ensure feature_group is always set by using auto-detection if not provided
      if (!data.feature_group) {
        // Import the grouping service for better detection
        const { SpecGroupingService } = await import('../../services/grouping.service.js');
        data.feature_group = SpecGroupingService.detectFeatureGroup(data.title, data.body_md);
      }
      
      const spec = SpecService.createSpec(data as CreateSpecData);
      return {
        success: true,
        spec,
        message: `Created specification "${spec.title}" with ID ${spec.id} in category "${spec.feature_group}"`
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
export const updateSpecTool: any = {
  name: 'update_spec',
  description: 'Update an existing specification',
  inputSchema: {
    type: 'object',
    properties: {
      spec_id: { type: 'number' },
      title: { type: 'string' },
      body_md: { type: 'string' },
      status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'] },
      feature_group: { type: 'string' },
      theme_category: { type: 'string' },
      priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      related_specs: { type: 'array', items: { type: 'number' } },
      parent_spec_id: { type: 'number' },
      last_command: { type: 'string' }
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
 * MCP tool for getting a specification by ID with optional relationships
 */
export const getSpecTool: any = {
  name: 'get_spec',
  description: 'Get a specification by ID with optional relationship information',
  inputSchema: {
    type: 'object',
    properties: {
      spec_id: { type: 'number' },
      include_relations: { type: 'boolean', default: false }
    },
    required: ['spec_id']
  },
  handler: async (args: any) => {
    const { spec_id, include_relations } = validateGetSpec(args);
    
    try {
      const spec = SpecService.getSpecById(spec_id);
      
      if (!spec) {
        return {
          success: false,
          error: `Specification with ID ${spec_id} not found`
        };
      }

      let result: any = { success: true, spec };

      if (include_relations && spec.related_specs) {
        try {
          const relatedSpecIds = JSON.parse(spec.related_specs);
          const relatedSpecs = relatedSpecIds.map((id: number) => SpecService.getSpecById(id)).filter(Boolean);
          result.related_specs = relatedSpecs;
        } catch (e) {
          // Related specs JSON parsing failed, continue without relations
        }
      }
      
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
 * MCP tool for listing specifications with filtering and pagination
 */
export const listSpecsTool: any = {
  name: 'list_specs',
  description: 'List specifications with optional filtering, pagination, and grouping',
  inputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'] },
      feature_group: { type: 'string' },
      theme_category: { type: 'string' },
      priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      created_via: { type: 'string' },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      offset: { type: 'number', minimum: 0 },
      sort_by: { type: 'string', enum: ['id', 'title', 'created_at', 'updated_at', 'priority', 'feature_group'] },
      sort_order: { type: 'string', enum: ['asc', 'desc'] },
      group_by: { type: 'string', enum: ['feature_group', 'status', 'priority'] },
      include_counts: { type: 'boolean', description: 'Include count statistics by group' }
    }
  },
  handler: async (args: any) => {
    try {
      const result = SpecService.listSpecs(args || {});
      
      // Add grouping functionality if requested
      if (args?.group_by) {
        const groupedResult = groupSpecsByField(result.specs, args.group_by);
        
        return {
          success: true,
          specs: result.specs,
          pagination: result.pagination,
          grouped_specs: groupedResult.groups,
          group_counts: groupedResult.counts,
          group_by: args.group_by
        };
      }

      // Add category counts if requested
      if (args?.include_counts) {
        const categoryCounts = result.specs.reduce((acc, spec) => {
          const category = spec.feature_group || 'uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          success: true,
          ...result,
          category_counts: categoryCounts
        };
      }
      
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
export const searchSpecsTool: any = {
  name: 'search_specs',
  description: 'Search specifications using full-text search with category boosting',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      limit: { type: 'number', minimum: 1, maximum: 100 },
      offset: { type: 'number', minimum: 0 },
      min_score: { type: 'number', minimum: 0, maximum: 1 },
      boost_category: { type: 'string', description: 'Boost results from this feature_group category' },
      category_boost_factor: { type: 'number', minimum: 1, maximum: 5, default: 1.5, description: 'Multiplier for boosting category results' }
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
      
      // Apply category boosting if specified
      if (args.boost_category) {
        const boostFactor = args.category_boost_factor || 1.5;
        
        // Boost scores for specs in the specified category
        result.results = result.results.map(spec => {
          if (spec.feature_group === args.boost_category) {
            return {
              ...spec,
              score: spec.score * boostFactor,
              boosted: true
            };
          }
          return spec;
        });
        
        // Re-sort by the new scores
        result.results.sort((a, b) => b.score - a.score);
        
        // Group by category for better organization
        const groupedResults = groupSearchResultsByCategory(result.results);
        
        return {
          success: true,
          ...result,
          boost_category: args.boost_category,
          boost_factor: boostFactor,
          grouped_results: groupedResults
        };
      }
      
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
export const importSpecsTool: any = {
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
export const deleteSpecTool: any = {
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
export const getSpecStatsTool: any = {
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

/**
 * MCP tool for creating a specification with intelligent grouping
 */
export const createSpecWithGroupingTool: any = {
  name: 'create_spec_with_grouping',
  description: 'Create a new specification with automatic feature detection and relationship mapping',
  inputSchema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      body_md: { type: 'string' },
      status: { type: 'string', enum: ['draft', 'todo', 'in-progress', 'done'] },
      feature_group: { type: 'string' },
      theme_category: { type: 'string' },
      priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      related_specs: { type: 'array', items: { type: 'number' } },
      parent_spec_id: { type: 'number' },
      created_via: { type: 'string' }
    },
    required: ['title', 'body_md']
  },
  handler: async (args: any) => {
    const data = validateCreateSpec(args);
    
    try {
      // Auto-detect grouping using intelligent services
      const detectedFeatureGroup = data.feature_group || SpecGroupingService.detectFeatureGroup(data.title, data.body_md);
      const detectedThemeCategory = data.theme_category || SpecGroupingService.detectThemeCategory(detectedFeatureGroup, data.body_md);
      const detectedPriority = data.priority || SpecGroupingService.detectPriority(data.title, data.body_md);
      
      const spec = SpecService.createSpec({
        ...data,
        feature_group: detectedFeatureGroup,
        theme_category: detectedThemeCategory,
        priority: detectedPriority
      } as CreateSpecData);

      // Auto-detect relationships for the new spec
      const relationshipSuggestions = RelationshipService.autoDetectRelationships(spec);
      
      return {
        success: true,
        spec,
        spec_id: spec.id,
        spec_url: `spec://${spec.id}`,
        detected_grouping: {
          feature_group: detectedFeatureGroup,
          theme_category: detectedThemeCategory,
          priority: detectedPriority
        },
        suggested_relationships: relationshipSuggestions,
        message: `Created specification "${spec.title}" with auto-detected group: ${detectedFeatureGroup} (${detectedThemeCategory})`
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
 * MCP tool for searching related specifications
 */
export const searchRelatedSpecsTool: any = {
  name: 'search_related_specs',
  description: 'Search for specifications related to a query with context-aware ranking',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      current_spec_id: { type: 'number' },
      feature_group: { type: 'string' },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      offset: { type: 'number', minimum: 0, default: 0 }
    },
    required: ['query']
  },
  handler: async (args: any) => {
    const { query, current_spec_id, feature_group, limit, offset } = validateSearchRelatedSpecs(args);
    
    try {
      if (current_spec_id) {
        // Use relationship service for context-aware search
        const currentSpec = SpecService.getSpecById(current_spec_id);
        if (!currentSpec) {
          return {
            success: false,
            error: `Specification with ID ${current_spec_id} not found`
          };
        }
        
        // Find related specs using intelligent relationship detection
        const relatedSpecs = RelationshipService.findRelatedSpecs(currentSpec, {
          limit: limit || 10,
          minScore: 0.2,
          sameGroupOnly: feature_group === currentSpec.feature_group
        });

        return {
          success: true,
          specs: relatedSpecs.map(rel => {
            const spec = SpecService.getSpecById(rel.spec_id)!;
            return { ...spec, relationship_score: rel.score, relationship_reason: rel.reason };
          }),
          query,
          relationship_suggestions: relatedSpecs,
          pagination: {
            offset: 0,
            limit: limit || 10,
            total: relatedSpecs.length,
            has_more: false
          }
        };
      } else {
        // Fallback to regular search with query
        let searchOptions: any = { limit: limit || 10, offset: offset || 0 };
        
        let result = SpecService.searchSpecs(query, searchOptions);
        
        if (feature_group) {
          // Filter or boost results from the same feature group
          const grouped = result.results.filter(spec => spec.feature_group === feature_group);
          const others = result.results.filter(spec => spec.feature_group !== feature_group);
          result.results = [...grouped, ...others];
        }
        
        return {
          success: true,
          specs: result.results,
          query: result.query,
          pagination: result.pagination,
          relationship_scores: result.results.map(spec => spec.score)
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * MCP tool for updating specification relationships
 */
export const updateSpecRelationshipsTool: any = {
  name: 'update_spec_relationships',
  description: 'Update the relationships and hierarchy of a specification',
  inputSchema: {
    type: 'object',
    properties: {
      spec_id: { type: 'number' },
      related_specs: { type: 'array', items: { type: 'number' } },
      parent_spec_id: { type: 'number' }
    },
    required: ['spec_id', 'related_specs']
  },
  handler: async (args: any) => {
    const { spec_id, related_specs, parent_spec_id } = validateUpdateSpecRelationships(args);
    
    try {
      // Use relationship service for validation and update
      const success = RelationshipService.updateSpecRelationships(spec_id, related_specs, parent_spec_id);
      
      if (!success) {
        return {
          success: false,
          error: `Failed to update relationships for specification with ID ${spec_id}`
        };
      }
      
      const spec = SpecService.getSpecById(spec_id);
      if (!spec) {
        return {
          success: false,
          error: `Specification with ID ${spec_id} not found`
        };
      }

      // Get updated hierarchy information
      const hierarchy = RelationshipService.getSpecHierarchy(spec_id);
      
      return {
        success: true,
        spec,
        hierarchy,
        message: `Updated relationships for specification "${spec.title}"`
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
 * Helper function to group search results by category
 */
function groupSearchResultsByCategory(results: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  results.forEach(result => {
    const category = result.feature_group || 'uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(result);
  });
  
  return grouped;
}

/**
 * Helper function to group specifications by a field
 */
function groupSpecsByField(specs: any[], field: string): { groups: any; counts: Record<string, number> } {
  const groups: Record<string, any[]> = {};
  const counts: Record<string, number> = {};
  
  specs.forEach(spec => {
    let groupKey: string;
    
    switch (field) {
      case 'feature_group':
        groupKey = spec.feature_group || 'uncategorized';
        break;
      case 'status':
        groupKey = spec.status || 'unknown';
        break;
      case 'priority':
        groupKey = spec.priority || 'medium';
        break;
      default:
        groupKey = 'unknown';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
      counts[groupKey] = 0;
    }
    
    groups[groupKey].push(spec);
    counts[groupKey]++;
  });
  
  // Sort specs within each group by updated_at descending
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  });
  
  return { groups, counts };
}

// Export all tools as an array
export const specTools: any[] = [
  createSpecTool,
  updateSpecTool,
  getSpecTool,
  listSpecsTool,
  searchSpecsTool,
  importSpecsTool,
  deleteSpecTool,
  getSpecStatsTool,
  // New tools for MCP commands integration
  createSpecWithGroupingTool,
  searchRelatedSpecsTool,
  updateSpecRelationshipsTool
];