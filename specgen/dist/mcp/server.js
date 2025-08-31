"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMCPServer = startMCPServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const spec_tools_1 = require("./tools/spec-tools");
const project_service_1 = require("../services/project.service");
const spec_resource_1 = require("./resources/spec-resource");
class SpecGenMCPServer {
    server;
    constructor() {
        this.server = new index_js_1.Server({
            name: 'specgen-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
                resources: {}
            }
        });
        this.setupToolHandlers();
        this.setupResourceHandlers();
        this.setupErrorHandling();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: spec_tools_1.specTools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema
                }))
            };
        });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            if (!project_service_1.ProjectService.isInInitializedProject()) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, 'Project not initialized. Run "specgen init" first.');
            }
            const tool = spec_tools_1.specTools.find(t => t.name === name);
            if (!tool) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
            try {
                const result = await tool.handler(args || {});
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }]
                };
            }
            catch (error) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    setupResourceHandlers() {
        this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => {
            try {
                if (!project_service_1.ProjectService.isInInitializedProject()) {
                    return { resources: [] };
                }
                const resources = await spec_resource_1.SpecGenResourceHandler.listAllResources();
                return { resources };
            }
            catch (error) {
                return { resources: [] };
            }
        });
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            if (!project_service_1.ProjectService.isInInitializedProject()) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, 'Project not initialized');
            }
            try {
                const resource = await spec_resource_1.SpecGenResourceHandler.readResource(uri);
                return {
                    contents: [resource]
                };
            }
            catch (error) {
                if (error instanceof types_js_1.McpError) {
                    throw error;
                }
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to read resource: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[SpecGen MCP Server Error]', error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    async connect(transport) {
        await this.server.connect(transport);
    }
    async close() {
        await this.server.close();
    }
}
async function startMCPServer() {
    const server = new SpecGenMCPServer();
    const transport = new stdio_js_1.StdioServerTransport();
    try {
        await server.connect(transport);
        console.error('SpecGen MCP Server started successfully');
    }
    catch (error) {
        console.error('Failed to start SpecGen MCP Server:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    startMCPServer().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map