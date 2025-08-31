#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { initializeDatabase } from './database/data-source.js';
import { specTools } from './mcp/tools/spec-tools.js';
import { specResources, dashboardResource } from './mcp/resources/index.js';
import { logger } from './services/logging.service.js';
/**
 * SpecGen MCP Server - Specification management with SQLite backend
 * Uses stdio transport following the proven gridgen pattern
 */
class SpecGenServer {
    server;
    constructor() {
        this.server = new Server({
            name: "specgen-mcp",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
                resources: {},
            },
        });
        this.setupToolHandlers();
        this.setupResourceHandlers();
    }
    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            logger.debug('MCP: Listing available tools');
            return {
                tools: specTools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema
                }))
            };
        });
        // Handle tool execution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            logger.debug('MCP: Executing tool', { tool: name, args });
            try {
                // Find and execute the requested tool
                const tool = specTools.find((t) => t.name === name);
                if (!tool) {
                    throw new Error(`Unknown tool: ${name}`);
                }
                const result = await tool.handler(args || {});
                logger.debug('MCP: Tool execution completed', { tool: name });
                return {
                    content: result.content,
                    isError: result.isError || false
                };
            }
            catch (error) {
                logger.error('MCP: Tool execution failed', error, { tool: name });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
    }
    setupResourceHandlers() {
        // List available resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            logger.debug('MCP: Listing available resources');
            try {
                const specResourcesList = await specResources.list();
                return {
                    resources: [
                        dashboardResource,
                        ...specResourcesList
                    ]
                };
            }
            catch (error) {
                logger.error('MCP: Failed to list resources', error);
                return { resources: [] };
            }
        });
        // Handle resource reading
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            logger.debug('MCP: Reading resource', { uri });
            try {
                // Handle different resource types
                if (uri === 'dashboard.html://index') {
                    return await dashboardResource.read();
                }
                else if (uri.startsWith('spec://')) {
                    return await specResources.read(uri);
                }
                else {
                    throw new Error(`Unknown resource URI: ${uri}`);
                }
            }
            catch (error) {
                logger.error('MCP: Resource reading failed', error, { uri });
                throw error;
            }
        });
    }
    async run() {
        try {
            // Initialize database first - log to stderr to avoid stdout interference
            console.error('Initializing database...');
            await initializeDatabase('/Users/pawanraviee/Documents/GitHub/agentic-workflows/specgen/specgen.sqlite');
            console.error('Database initialized successfully');
            // Connect to stdio transport
            const transport = new StdioServerTransport();
            // Handle client disconnection - exit gracefully when transport closes
            transport.onclose = async () => {
                console.error('Client disconnected, shutting down...');
                process.exit(0);
            };
            await this.server.connect(transport);
            // Monitor stdin for client disconnection (additional safety net)
            process.stdin.on('end', async () => {
                console.error('stdin ended, shutting down...');
                process.exit(0);
            });
            // Handle stdin errors
            process.stdin.on('error', async (error) => {
                console.error('stdin error:', error);
                process.exit(1);
            });
            // Log to stderr so it doesn't interfere with MCP protocol on stdout
            console.error("SpecGen MCP server running on stdio");
        }
        catch (error) {
            console.error('Failed to start MCP server:', error);
            process.exit(1);
        }
    }
}
// Start the server
const server = new SpecGenServer();
server.run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map