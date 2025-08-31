/**
 * MCP tools for spec management with Zod validation
 */
import { CreateSpecToolInput, UpdateSpecToolInput, ListSpecsToolInput, GetSpecToolInput, DeleteSpecToolInput, SearchSpecsToolInput, GetSpecStatsToolInput, LaunchDashboardToolInput } from '../schemas/tool-schemas.js';
import { MCPToolResult } from '../types.js';
export declare const specTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            title: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            body_md: {
                type: string;
                minLength: number;
            };
            status: {
                type: string;
                enum: string[];
                default: string;
            };
            spec_id?: undefined;
            include_relations?: undefined;
            limit?: undefined;
            offset?: undefined;
            sort_by?: undefined;
            sort_order?: undefined;
            query?: undefined;
            min_score?: undefined;
            include_details?: undefined;
            port?: undefined;
            open_browser?: undefined;
        };
        required: string[];
        additionalProperties: boolean;
    };
    handler: (args: CreateSpecToolInput) => Promise<MCPToolResult>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            spec_id: {
                type: string;
            };
            title: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            body_md: {
                type: string;
                minLength: number;
            };
            status: {
                type: string;
                enum: string[];
                default?: undefined;
            };
            include_relations?: undefined;
            limit?: undefined;
            offset?: undefined;
            sort_by?: undefined;
            sort_order?: undefined;
            query?: undefined;
            min_score?: undefined;
            include_details?: undefined;
            port?: undefined;
            open_browser?: undefined;
        };
        required: string[];
        additionalProperties: boolean;
    };
    handler: (args: UpdateSpecToolInput) => Promise<MCPToolResult>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            spec_id: {
                type: string;
            };
            include_relations: {
                type: string;
                default: boolean;
            };
            title?: undefined;
            body_md?: undefined;
            status?: undefined;
            limit?: undefined;
            offset?: undefined;
            sort_by?: undefined;
            sort_order?: undefined;
            query?: undefined;
            min_score?: undefined;
            include_details?: undefined;
            port?: undefined;
            open_browser?: undefined;
        };
        required: string[];
        additionalProperties: boolean;
    };
    handler: (args: GetSpecToolInput) => Promise<MCPToolResult>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            limit: {
                type: string;
                minimum: number;
                maximum: number;
                default: number;
            };
            offset: {
                type: string;
                minimum: number;
                default: number;
            };
            status: {
                type: string;
                enum: string[];
                default?: undefined;
            };
            sort_by: {
                type: string;
                enum: string[];
                default: string;
            };
            sort_order: {
                type: string;
                enum: string[];
                default: string;
            };
            title?: undefined;
            body_md?: undefined;
            spec_id?: undefined;
            include_relations?: undefined;
            query?: undefined;
            min_score?: undefined;
            include_details?: undefined;
            port?: undefined;
            open_browser?: undefined;
        };
        required: never[];
        additionalProperties: boolean;
    };
    handler: (args: ListSpecsToolInput) => Promise<MCPToolResult>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            spec_id: {
                type: string;
            };
            title?: undefined;
            body_md?: undefined;
            status?: undefined;
            include_relations?: undefined;
            limit?: undefined;
            offset?: undefined;
            sort_by?: undefined;
            sort_order?: undefined;
            query?: undefined;
            min_score?: undefined;
            include_details?: undefined;
            port?: undefined;
            open_browser?: undefined;
        };
        required: string[];
        additionalProperties: boolean;
    };
    handler: (args: DeleteSpecToolInput) => Promise<MCPToolResult>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            query: {
                type: string;
                minLength: number;
            };
            limit: {
                type: string;
                minimum: number;
                maximum: number;
                default: number;
            };
            offset: {
                type: string;
                minimum: number;
                default: number;
            };
            min_score: {
                type: string;
                minimum: number;
                maximum: number;
                default: number;
            };
            title?: undefined;
            body_md?: undefined;
            status?: undefined;
            spec_id?: undefined;
            include_relations?: undefined;
            sort_by?: undefined;
            sort_order?: undefined;
            include_details?: undefined;
            port?: undefined;
            open_browser?: undefined;
        };
        required: string[];
        additionalProperties: boolean;
    };
    handler: (args: SearchSpecsToolInput) => Promise<MCPToolResult>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            include_details: {
                type: string;
                default: boolean;
            };
            title?: undefined;
            body_md?: undefined;
            status?: undefined;
            spec_id?: undefined;
            include_relations?: undefined;
            limit?: undefined;
            offset?: undefined;
            sort_by?: undefined;
            sort_order?: undefined;
            query?: undefined;
            min_score?: undefined;
            port?: undefined;
            open_browser?: undefined;
        };
        required: never[];
        additionalProperties: boolean;
    };
    handler: (args: GetSpecStatsToolInput) => Promise<MCPToolResult>;
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            port: {
                type: string;
                minimum: number;
                maximum: number;
                default: number;
            };
            open_browser: {
                type: string;
                default: boolean;
            };
            title?: undefined;
            body_md?: undefined;
            status?: undefined;
            spec_id?: undefined;
            include_relations?: undefined;
            limit?: undefined;
            offset?: undefined;
            sort_by?: undefined;
            sort_order?: undefined;
            query?: undefined;
            min_score?: undefined;
            include_details?: undefined;
        };
        required: never[];
        additionalProperties: boolean;
    };
    handler: (args: LaunchDashboardToolInput) => Promise<MCPToolResult>;
})[];
//# sourceMappingURL=spec-tools.d.ts.map