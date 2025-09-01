"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specTools = exports.updateSpecRelationshipsTool = exports.searchRelatedSpecsTool = exports.createSpecWithGroupingTool = exports.getSpecStatsTool = exports.deleteSpecTool = exports.importSpecsTool = exports.searchSpecsTool = exports.listSpecsTool = exports.getSpecTool = exports.updateSpecTool = exports.createSpecTool = void 0;
const spec_service_1 = require("../../services/spec.service");
const import_service_1 = require("../../services/import.service");
const grouping_service_1 = require("../../services/grouping.service");
const relationship_service_1 = require("../../services/relationship.service");
function validateCreateSpec(args) {
    if (!args.title || typeof args.title !== 'string') {
        throw new Error('title is required and must be a string');
    }
    if (!args.body_md || typeof args.body_md !== 'string') {
        throw new Error('body_md is required and must be a string');
    }
    return args;
}
function validateUpdateSpec(args) {
    if (!args.spec_id || typeof args.spec_id !== 'number') {
        throw new Error('spec_id is required and must be a number');
    }
    return args;
}
function validateGetSpec(args) {
    if (!args.spec_id || typeof args.spec_id !== 'number') {
        throw new Error('spec_id is required and must be a number');
    }
    return args;
}
function validateSearchRelatedSpecs(args) {
    if (!args.query || typeof args.query !== 'string') {
        throw new Error('query is required and must be a string');
    }
    return args;
}
function validateUpdateSpecRelationships(args) {
    if (!args.spec_id || typeof args.spec_id !== 'number') {
        throw new Error('spec_id is required and must be a number');
    }
    if (!Array.isArray(args.related_specs)) {
        throw new Error('related_specs is required and must be an array');
    }
    return args;
}
exports.createSpecTool = {
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
    handler: async (args) => {
        const data = validateCreateSpec(args);
        try {
            const spec = spec_service_1.SpecService.createSpec(data);
            return {
                success: true,
                spec,
                message: `Created specification "${spec.title}" with ID ${spec.id}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.updateSpecTool = {
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
    handler: async (args) => {
        const { spec_id, ...updates } = validateUpdateSpec(args);
        try {
            const spec = spec_service_1.SpecService.updateSpec(spec_id, updates);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.getSpecTool = {
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
    handler: async (args) => {
        const { spec_id, include_relations } = validateGetSpec(args);
        try {
            const spec = spec_service_1.SpecService.getSpecById(spec_id);
            if (!spec) {
                return {
                    success: false,
                    error: `Specification with ID ${spec_id} not found`
                };
            }
            let result = { success: true, spec };
            if (include_relations && spec.related_specs) {
                try {
                    const relatedSpecIds = JSON.parse(spec.related_specs);
                    const relatedSpecs = relatedSpecIds.map((id) => spec_service_1.SpecService.getSpecById(id)).filter(Boolean);
                    result.related_specs = relatedSpecs;
                }
                catch (e) {
                }
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.listSpecsTool = {
    name: 'list_specs',
    description: 'List specifications with optional filtering and pagination',
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
            sort_by: { type: 'string', enum: ['id', 'title', 'created_at', 'updated_at', 'priority'] },
            sort_order: { type: 'string', enum: ['asc', 'desc'] }
        }
    },
    handler: async (args) => {
        try {
            const result = spec_service_1.SpecService.listSpecs(args || {});
            return {
                success: true,
                ...result
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.searchSpecsTool = {
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
    handler: async (args) => {
        try {
            const result = spec_service_1.SpecService.searchSpecs(args.query, {
                limit: args.limit,
                offset: args.offset,
                min_score: args.min_score
            });
            return {
                success: true,
                ...result
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.importSpecsTool = {
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
    handler: async (args) => {
        try {
            const result = await import_service_1.ImportService.importFromDirectory(args.directory_path, args.pattern, {
                overwrite: args.overwrite || false
            });
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.deleteSpecTool = {
    name: 'delete_spec',
    description: 'Delete a specification by ID',
    inputSchema: {
        type: 'object',
        properties: {
            spec_id: { type: 'number' }
        },
        required: ['spec_id']
    },
    handler: async (args) => {
        try {
            const success = spec_service_1.SpecService.deleteSpec(args.spec_id);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.getSpecStatsTool = {
    name: 'get_spec_stats',
    description: 'Get specification statistics for the current project',
    inputSchema: {
        type: 'object',
        properties: {
            include_details: { type: 'boolean' }
        }
    },
    handler: async (args) => {
        try {
            const stats = spec_service_1.SpecService.getStats(args?.include_details || false);
            return {
                success: true,
                stats
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.createSpecWithGroupingTool = {
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
    handler: async (args) => {
        const data = validateCreateSpec(args);
        try {
            const detectedFeatureGroup = data.feature_group || grouping_service_1.SpecGroupingService.detectFeatureGroup(data.title, data.body_md);
            const detectedThemeCategory = data.theme_category || grouping_service_1.SpecGroupingService.detectThemeCategory(detectedFeatureGroup, data.body_md);
            const detectedPriority = data.priority || grouping_service_1.SpecGroupingService.detectPriority(data.title, data.body_md);
            const spec = spec_service_1.SpecService.createSpec({
                ...data,
                feature_group: detectedFeatureGroup,
                theme_category: detectedThemeCategory,
                priority: detectedPriority
            });
            const relationshipSuggestions = relationship_service_1.RelationshipService.autoDetectRelationships(spec);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.searchRelatedSpecsTool = {
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
    handler: async (args) => {
        const { query, current_spec_id, feature_group, limit, offset } = validateSearchRelatedSpecs(args);
        try {
            if (current_spec_id) {
                const currentSpec = spec_service_1.SpecService.getSpecById(current_spec_id);
                if (!currentSpec) {
                    return {
                        success: false,
                        error: `Specification with ID ${current_spec_id} not found`
                    };
                }
                const relatedSpecs = relationship_service_1.RelationshipService.findRelatedSpecs(currentSpec, {
                    limit: limit || 10,
                    minScore: 0.2,
                    sameGroupOnly: feature_group === currentSpec.feature_group
                });
                return {
                    success: true,
                    specs: relatedSpecs.map(rel => {
                        const spec = spec_service_1.SpecService.getSpecById(rel.spec_id);
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
            }
            else {
                let searchOptions = { limit: limit || 10, offset: offset || 0 };
                let result = spec_service_1.SpecService.searchSpecs(query, searchOptions);
                if (feature_group) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.updateSpecRelationshipsTool = {
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
    handler: async (args) => {
        const { spec_id, related_specs, parent_spec_id } = validateUpdateSpecRelationships(args);
        try {
            const success = relationship_service_1.RelationshipService.updateSpecRelationships(spec_id, related_specs, parent_spec_id);
            if (!success) {
                return {
                    success: false,
                    error: `Failed to update relationships for specification with ID ${spec_id}`
                };
            }
            const spec = spec_service_1.SpecService.getSpecById(spec_id);
            if (!spec) {
                return {
                    success: false,
                    error: `Specification with ID ${spec_id} not found`
                };
            }
            const hierarchy = relationship_service_1.RelationshipService.getSpecHierarchy(spec_id);
            return {
                success: true,
                spec,
                hierarchy,
                message: `Updated relationships for specification "${spec.title}"`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.specTools = [
    exports.createSpecTool,
    exports.updateSpecTool,
    exports.getSpecTool,
    exports.listSpecsTool,
    exports.searchSpecsTool,
    exports.importSpecsTool,
    exports.deleteSpecTool,
    exports.getSpecStatsTool,
    exports.createSpecWithGroupingTool,
    exports.searchRelatedSpecsTool,
    exports.updateSpecRelationshipsTool
];
//# sourceMappingURL=spec-tools.js.map