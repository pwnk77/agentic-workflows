"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specTools = exports.getSpecStatsTool = exports.deleteSpecTool = exports.importSpecsTool = exports.searchSpecsTool = exports.listSpecsTool = exports.getSpecTool = exports.updateSpecTool = exports.createSpecTool = void 0;
const spec_service_1 = require("../../services/spec.service");
const import_service_1 = require("../../services/import.service");
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
exports.createSpecTool = {
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
            feature_group: { type: 'string' }
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
    description: 'Get a specification by ID',
    inputSchema: {
        type: 'object',
        properties: {
            spec_id: { type: 'number' }
        },
        required: ['spec_id']
    },
    handler: async (args) => {
        const { spec_id } = validateGetSpec(args);
        try {
            const spec = spec_service_1.SpecService.getSpecById(spec_id);
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
            limit: { type: 'number', minimum: 1, maximum: 1000 },
            offset: { type: 'number', minimum: 0 },
            sort_by: { type: 'string', enum: ['id', 'title', 'created_at', 'updated_at'] },
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
exports.specTools = [
    exports.createSpecTool,
    exports.updateSpecTool,
    exports.getSpecTool,
    exports.listSpecsTool,
    exports.searchSpecsTool,
    exports.importSpecsTool,
    exports.deleteSpecTool,
    exports.getSpecStatsTool
];
//# sourceMappingURL=spec-tools.js.map