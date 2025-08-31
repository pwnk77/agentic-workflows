/**
 * MCP server using @modelcontextprotocol/sdk
 */
import { MCPServerConfig } from './types.js';
export declare class MCPServerManager {
    private server;
    private config;
    private initialized;
    constructor();
    private setupHandlers;
    start(): Promise<void>;
    close(): Promise<void>;
    isRunning(): boolean;
    getConfig(): MCPServerConfig;
}
export declare function createMCPServer(): MCPServerManager;
//# sourceMappingURL=server.d.ts.map