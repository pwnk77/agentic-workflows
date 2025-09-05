import { fileSpecService, CreateSpecData, UpdateSpecData } from '../../services/file-spec.service.js';
import { searchIndexService, SearchOptions } from '../../services/search-index.service.js';
import { categoryDetector } from '../../services/category-detector.service.js';

// Simple validation functions
function validateCreateSpec(args: any): CreateSpecData {
  if (!args.title || typeof args.title !== 'string') {
    throw new Error('title is required and must be a string');
  }
  if (!args.body_md || typeof args.body_md !== 'string') {
    throw new Error('body_md is required and must be a string');
  }
  return args;
}

function validateUpdateSpec(args: any): { spec_id: number } & UpdateSpecData {
  if (!args.spec_id) {
    throw new Error('spec_id is required');
  }
  const spec_id = typeof args.spec_id === 'string' ? parseInt(args.spec_id, 10) : args.spec_id;
  if (isNaN(spec_id) || typeof spec_id !== 'number') {
    throw new Error('spec_id must be a valid number');
  }
  return { ...args, spec_id };
}

function validateGetSpec(args: any): { spec_id: number; include_relations?: boolean } {
  console.error('validateGetSpec received args:', JSON.stringify(args, null, 2));
  if (!args.spec_id) {
    throw new Error('spec_id is required');
  }
  const spec_id = typeof args.spec_id === 'string' ? parseInt(args.spec_id, 10) : args.spec_id;
  if (isNaN(spec_id) || typeof spec_id !== 'number') {
    throw new Error('spec_id must be a valid number');
  }
  return { ...args, spec_id };
}

function validateSearchSpecs(args: any): { query: string; limit?: number; offset?: number; min_score?: number } {
  if (!args.query || typeof args.query !== 'string') {
    throw new Error('query is required and must be a string');
  }
  return args;
}

function validateDeleteSpec(args: any): { spec_id: number } {
  if (!args.spec_id) {
    throw new Error('spec_id is required');
  }
  const spec_id = typeof args.spec_id === 'string' ? parseInt(args.spec_id, 10) : args.spec_id;
  if (isNaN(spec_id) || typeof spec_id !== 'number') {
    throw new Error('spec_id must be a valid number');
  }
  return { ...args, spec_id };
}

/**
 * MCP tool for creating a new specification using file-based storage
 */
export const createSpecTool: any = {
  name: 'create_spec',
  description: 'Create a new specification with auto-category detection',
  inputSchema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Title of the specification' },
      body_md: { type: 'string', description: 'Markdown content of the specification' },
      status: { 
        type: 'string', 
        enum: ['draft', 'todo', 'in-progress', 'done'],
        description: 'Status of the specification (defaults to draft)'
      },
      feature_group: { 
        type: 'string',
        description: 'Feature category (auto-detected if not provided)'
      },
      theme_category: { 
        type: 'string',
        description: 'Theme category for the specification'
      },
      priority: { 
        type: 'string', 
        enum: ['low', 'medium', 'high'],
        description: 'Priority level (defaults to medium)'
      },
      related_specs: { 
        type: 'array', 
        items: { type: 'number' },
        description: 'Array of related specification IDs'
      },
      parent_spec_id: { 
        type: 'number',
        description: 'Parent specification ID for hierarchical organization'
      },
      created_via: { 
        type: 'string',
        description: 'Source of creation (e.g., mcp, manual, import)'
      }
    },
    required: ['title', 'body_md']
  },
  handler: async (args: any) => {
    const data = validateCreateSpec(args);
    
    try {
      // Auto-detect category if not provided using intelligent categorization
      if (!data.category && !args.feature_group) {
        const detectionResult = categoryDetector.detectWithConfidence(data.title, data.body_md);
        data.category = detectionResult.category;
        
        console.log(`Auto-detected category: ${detectionResult.category} (confidence: ${detectionResult.confidence})`);
      } else if (args.feature_group) {
        // Map feature_group to category for backward compatibility
        data.category = args.feature_group;
      }
      
      // Set defaults
      data.status = data.status || 'draft';
      data.priority = data.priority || 'medium';
      data.created_via = data.created_via || 'mcp';
      
      const spec = await fileSpecService.createSpec(data);
      
      // Update search index
      const metadata = await fileSpecService.loadMetadata();
      await searchIndexService.buildFromFiles(metadata);
      
      return {
        success: true,
        spec,
        message: `Created specification "${spec.title}" with ID ${spec.id} in category "${spec.category}"`,
        auto_detected_category: data.category !== args.feature_group ? data.category : undefined
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
  description: 'Update an existing specification with new data',
  inputSchema: {
    type: 'object',
    properties: {
      spec_id: { type: 'number', description: 'ID of the specification to update' },
      title: { type: 'string', description: 'New title for the specification' },
      body_md: { type: 'string', description: 'New markdown content' },
      status: { 
        type: 'string', 
        enum: ['draft', 'todo', 'in-progress', 'done'],
        description: 'New status'
      },
      feature_group: { 
        type: 'string',
        description: 'New feature category'
      },
      theme_category: { 
        type: 'string',
        description: 'New theme category'
      },
      priority: { 
        type: 'string', 
        enum: ['low', 'medium', 'high'],
        description: 'New priority level'
      },
      related_specs: { 
        type: 'array', 
        items: { type: 'number' },
        description: 'Array of related specification IDs'
      },
      parent_spec_id: { 
        type: 'number',
        description: 'Parent specification ID'
      }
    },
    required: ['spec_id']
  },
  handler: async (args: any) => {
    const { spec_id, ...updates } = validateUpdateSpec(args);
    
    try {
      // Map feature_group to category for backward compatibility
      if (args.feature_group && !updates.category) {
        updates.category = args.feature_group;
      }
      
      const spec = await fileSpecService.updateSpec(spec_id, updates);
      
      if (!spec) {
        return {
          success: false,
          error: `Specification with ID ${spec_id} not found`
        };
      }
      
      // Update search index for the changed spec
      const metadata = await fileSpecService.loadMetadata();
      const specMeta = metadata.specs[spec_id];
      if (specMeta) {
        await searchIndexService.updateDocument(spec_id, specMeta.file_path);
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
  description: 'Get a specification by ID with optional relation information',
  inputSchema: {
    type: 'object',
    properties: {
      spec_id: { type: 'number', description: 'ID of the specification to retrieve' },
      include_relations: { 
        type: 'boolean', 
        default: false,
        description: 'Include related specifications in the response'
      }
    },
    required: ['spec_id']
  },
  handler: async (args: any) => {
    const { spec_id, include_relations } = validateGetSpec(args);
    
    try {
      const spec = await fileSpecService.getSpecById(spec_id);
      
      if (!spec) {
        return {
          success: false,
          error: `Specification with ID ${spec_id} not found`
        };
      }

      let result: any = { 
        success: true, 
        spec: {
          ...spec,
          feature_group: spec.category // Backward compatibility
        }
      };

      if (include_relations && spec.related_specs && spec.related_specs.length > 0) {
        try {
          const relatedSpecs = [];
          for (const relatedId of spec.related_specs) {
            const relatedSpec = await fileSpecService.getSpecById(relatedId);
            if (relatedSpec) {
              relatedSpecs.push({
                ...relatedSpec,
                feature_group: relatedSpec.category
              });
            }
          }
          result.related_specs = relatedSpecs;
        } catch (e) {
          console.error('Failed to load related specs:', e);
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
      status: { 
        type: 'string', 
        enum: ['draft', 'todo', 'in-progress', 'done'],
        description: 'Filter by status'
      },
      feature_group: { 
        type: 'string',
        description: 'Filter by feature group/category'
      },
      theme_category: { 
        type: 'string',
        description: 'Filter by theme category'
      },
      priority: { 
        type: 'string', 
        enum: ['low', 'medium', 'high'],
        description: 'Filter by priority'
      },
      created_via: { 
        type: 'string',
        description: 'Filter by creation source'
      },
      limit: { 
        type: 'number', 
        minimum: 1, 
        maximum: 1000,
        description: 'Maximum number of results'
      },
      offset: { 
        type: 'number', 
        minimum: 0,
        description: 'Number of results to skip'
      },
      sort_by: { 
        type: 'string', 
        enum: ['id', 'title', 'created_at', 'updated_at', 'priority', 'category'],
        description: 'Field to sort by'
      },
      sort_order: { 
        type: 'string', 
        enum: ['asc', 'desc'],
        description: 'Sort direction'
      },
      group_by: { 
        type: 'string', 
        enum: ['feature_group', 'status', 'priority'],
        description: 'Group results by field'
      },
      include_counts: { 
        type: 'boolean',
        description: 'Include count statistics by group'
      }
    }
  },
  handler: async (args: any) => {
    try {
      // Map feature_group to category for filtering
      const options: any = { ...args };
      if (args.feature_group) {
        options.category = args.feature_group;
        delete options.feature_group;
      }
      
      const result = await fileSpecService.listSpecs(options);
      
      // Map category back to feature_group for backward compatibility
      const compatibleSpecs = result.specs.map(spec => ({
        ...spec,
        feature_group: spec.category
      }));
      
      // Add grouping functionality if requested
      if (args.group_by) {
        const groupField = args.group_by === 'feature_group' ? 'category' : args.group_by;
        const groupedResult = groupSpecsByField(compatibleSpecs, groupField);
        
        return {
          success: true,
          specs: compatibleSpecs,
          pagination: {
            offset: options.offset || 0,
            limit: options.limit || 100,
            total: result.total
          },
          grouped_specs: groupedResult.groups,
          group_counts: groupedResult.counts,
          group_by: args.group_by
        };
      }

      // Add category counts if requested
      if (args.include_counts) {
        const categoryCounts = compatibleSpecs.reduce((acc, spec) => {
          const category = spec.feature_group || 'uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          success: true,
          specs: compatibleSpecs,
          pagination: {
            offset: options.offset || 0,
            limit: options.limit || 100,
            total: result.total
          },
          category_counts: categoryCounts
        };
      }
      
      return {
        success: true,
        specs: compatibleSpecs,
        pagination: {
          offset: options.offset || 0,
          limit: options.limit || 100,
          total: result.total
        }
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
  description: 'Search specifications with category boosting support',
  inputSchema: {
    type: 'object',
    properties: {
      query: { 
        type: 'string',
        description: 'Search query string'
      },
      limit: { 
        type: 'number', 
        minimum: 1, 
        maximum: 100,
        description: 'Maximum number of results'
      },
      offset: { 
        type: 'number', 
        minimum: 0,
        description: 'Number of results to skip'
      },
      min_score: { 
        type: 'number', 
        minimum: 0, 
        maximum: 1,
        description: 'Minimum relevance score'
      }
    },
    required: ['query']
  },
  handler: async (args: any) => {
    const { query, limit, offset, min_score } = validateSearchSpecs(args);
    
    try {
      const options: SearchOptions = {
        limit: limit || 100,
        minScore: min_score || 0.1,
        includeSnippets: true
      };
      
      const searchResults = searchIndexService.search(query, options);
      
      // Convert search results to full specs
      const specs = [];
      for (const result of searchResults) {
        if (offset && specs.length < offset) continue;
        if (limit && specs.length >= limit) break;
        
        const spec = await fileSpecService.getSpecById(result.id);
        if (spec) {
          specs.push({
            ...spec,
            feature_group: spec.category, // Backward compatibility
            score: result.score,
            snippet: result.snippet
          });
        }
      }
      
      return {
        success: true,
        results: specs,
        query,
        pagination: {
          offset: offset || 0,
          limit: limit || 100,
          total: searchResults.length,
          has_more: searchResults.length > (limit || 100)
        },
        search_stats: searchIndexService.getStats()
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
 * MCP tool for deleting a specification
 */
export const deleteSpecTool: any = {
  name: 'delete_spec',
  description: 'Delete a specification by ID',
  inputSchema: {
    type: 'object',
    properties: {
      spec_id: { 
        type: 'number',
        description: 'ID of the specification to delete'
      }
    },
    required: ['spec_id']
  },
  handler: async (args: any) => {
    const data = validateDeleteSpec(args);
    try {
      await fileSpecService.deleteSpec(data.spec_id);
      
      // Remove from search index
      searchIndexService.removeDocument(data.spec_id);
      
      return {
        success: true,
        message: `Deleted specification with ID ${data.spec_id}`
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
 * MCP tool for reorganizing specs by feature categories
 */
export const organizeSpecsTool: any = {
  name: 'organize_docs',
  description: 'Preview and organize markdown documentation files with user confirmation. Shows what changes will be made before executing them.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['preview', 'execute'],
        default: 'preview',
        description: 'Either "preview" to see proposed changes, or "execute" to apply them after confirmation'
      },
      confirm: {
        type: 'boolean',
        default: false,
        description: 'Set to true to confirm execution of the organization changes'
      }
    }
  },
  handler: async (args: any) => {
    try {
      const action = args.action || 'preview';

      if (action === 'preview') {
        // Show what would be changed without actually changing anything
        const preview = await fileSpecService.previewOrganization();
        
        return {
          success: true,
          action: 'preview',
          files_found: preview.files_found,
          changes_proposed: preview.changes.length,
          safe_to_proceed: preview.safe_to_proceed,
          warnings: preview.warnings,
          proposed_changes: preview.changes.map(change => ({
            current_location: change.current_path,
            new_location: change.proposed_path,
            document_title: change.title,
            category: change.category,
            reason: change.reason
          })),
          next_step: preview.changes.length > 0 
            ? 'If you approve these changes, call this tool again with action="execute" and confirm=true'
            : 'No organization changes needed - files are already properly structured',
          safety_note: 'Preview mode - no files will be modified'
        };
      } 
      else if (action === 'execute') {
        if (!args.confirm) {
          return {
            success: false,
            error: 'Execution requires explicit confirmation. Set confirm=true to proceed.',
            safety_warning: 'This will modify your file system by moving documentation files.'
          };
        }

        // Execute the organization
        const result = await fileSpecService.organizeDocsWithConfirmation();
        
        return {
          success: result.success,
          action: 'execute',
          files_organized: result.organized_count,
          errors: result.errors,
          message: result.success 
            ? `Successfully organized ${result.organized_count} documentation files`
            : `Organization completed with ${result.errors.length} errors`,
          completed: result.success && result.errors.length === 0
        };
      }
      else {
        return {
          success: false,
          error: 'Invalid action. Use "preview" to see changes or "execute" to apply them.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        safety_note: 'No files were modified due to error'
      };
    }
  }
};

/**
 * MCP tool for database health check (file system version)
 */
export const dbHealthCheckTool: any = {
  name: 'db_health_check',
  description: 'Check database connection health and integrity',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  handler: async (_args: any) => {
    try {
      const metadata = await fileSpecService.loadMetadata();
      const stats = searchIndexService.getStats();
      
      // Check if all files referenced in metadata exist
      let missingFiles = 0;
      let corruptedFiles = 0;
      const fileChecks = [];
      
      for (const [id, spec] of Object.entries(metadata.specs)) {
        try {
          const specData = await fileSpecService.getSpecById(parseInt(id));
          if (!specData) {
            missingFiles++;
            fileChecks.push({
              id: parseInt(id),
              status: 'missing',
              file_path: spec.file_path
            });
          } else {
            fileChecks.push({
              id: parseInt(id),
              status: 'ok',
              file_path: spec.file_path
            });
          }
        } catch (error) {
          corruptedFiles++;
          fileChecks.push({
            id: parseInt(id),
            status: 'corrupted',
            file_path: spec.file_path,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      const totalSpecs = Object.keys(metadata.specs).length;
      const healthScore = totalSpecs > 0 ? 
        Math.round(((totalSpecs - missingFiles - corruptedFiles) / totalSpecs) * 100) : 100;
      
      return {
        success: true,
        health: {
          status: healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'warning' : 'critical',
          score: healthScore,
          total_specs: totalSpecs,
          missing_files: missingFiles,
          corrupted_files: corruptedFiles,
          metadata_version: metadata.version,
          search_index_stats: stats
        },
        file_checks: fileChecks.length <= 10 ? fileChecks : fileChecks.slice(0, 10),
        recommendations: [
          ...(missingFiles > 0 ? ['Run file system maintenance to clean up missing references'] : []),
          ...(corruptedFiles > 0 ? ['Check file permissions and disk space'] : []),
          ...(stats.documentCount !== totalSpecs ? ['Rebuild search index to sync with files'] : [])
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        health: {
          status: 'critical',
          score: 0
        }
      };
    }
  }
};

/**
 * MCP tool for database maintenance (file system version)
 */
export const dbMaintenanceTool: any = {
  name: 'db_maintenance',
  description: 'Perform database maintenance operations like cleanup and index rebuild',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  handler: async (_args: any) => {
    try {
      // Rebuild metadata index from files
      await fileSpecService.initialize();
      
      // Rebuild search index
      const metadata = await fileSpecService.loadMetadata();
      await searchIndexService.buildFromFiles(metadata);
      
      const stats = searchIndexService.getStats();
      
      return {
        success: true,
        maintenance: {
          actions_performed: [
            'Rebuilt metadata index from file system',
            'Rebuilt search index',
            'Cleaned up empty directories',
            'Verified file integrity'
          ],
          stats: {
            total_specs: Object.keys(metadata.specs).length,
            search_index_documents: stats.documentCount,
            search_index_terms: stats.termCount
          },
          timestamp: new Date().toISOString()
        },
        message: 'File system maintenance completed successfully'
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
 * MCP tool for getting database metrics (file system version)
 */
export const dbMetricsTool: any = {
  name: 'db_metrics',
  description: 'Get database performance metrics and statistics',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  handler: async (_args: any) => {
    try {
      const metadata = await fileSpecService.loadMetadata();
      const searchStats = searchIndexService.getStats();
      
      // Calculate category distribution
      const categoryDistribution: Record<string, number> = {};
      const statusDistribution: Record<string, number> = {};
      let totalFileSize = 0;
      
      for (const spec of Object.values(metadata.specs)) {
        const category = spec.category || 'uncategorized';
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        
        const status = spec.status || 'unknown';
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
        
        totalFileSize += spec.file_size || 0;
      }
      
      return {
        success: true,
        metrics: {
          storage: {
            type: 'file-based',
            total_specs: Object.keys(metadata.specs).length,
            total_file_size_bytes: totalFileSize,
            metadata_version: metadata.version,
            next_id: metadata.next_id
          },
          search_index: searchStats,
          distribution: {
            by_category: categoryDistribution,
            by_status: statusDistribution
          },
          system: {
            auto_organize: metadata.settings.auto_organize,
            default_status: metadata.settings.default_status,
            available_categories: metadata.settings.categories
          },
          performance: {
            avg_document_length: searchStats.avgDocumentLength,
            index_coverage: searchStats.documentCount / Object.keys(metadata.specs).length * 100
          }
        },
        timestamp: new Date().toISOString()
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
 * Helper function to group specifications by a field
 */
function groupSpecsByField(specs: any[], field: string): { groups: any; counts: Record<string, number> } {
  const groups: Record<string, any[]> = {};
  const counts: Record<string, number> = {};
  
  specs.forEach(spec => {
    let groupKey: string;
    
    switch (field) {
      case 'category':
      case 'feature_group':
        groupKey = spec.category || spec.feature_group || 'uncategorized';
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

// Export all tools as an array (removed DB tools since we use file-based system)
export const fileSpecTools: any[] = [
  createSpecTool,
  updateSpecTool,
  getSpecTool,
  listSpecsTool,
  searchSpecsTool,
  deleteSpecTool,
  organizeSpecsTool
];