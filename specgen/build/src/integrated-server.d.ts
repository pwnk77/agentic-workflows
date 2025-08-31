/**
 * Integrated server architecture combining MCP stdio and Express HTTP servers
 * Implements the dual-server pattern for dashboard functionality
 */
import { getAppSettings } from '../config/settings.js';
export type ServerMode = 'mcp' | 'dashboard' | 'integrated';
export interface IntegratedServerOptions {
    mode?: ServerMode;
    port?: number;
    dbPath?: string;
    autoOpenBrowser?: boolean;
}
/**
 * Integrated SpecGen Server managing both MCP stdio and HTTP web servers
 */
export declare class IntegratedSpecGenServer {
    private mcpServer;
    private httpServer;
    private apiApp;
    private settings;
    private initialized;
    constructor();
    /**
     * Start the integrated server in specified mode
     */
    start(options?: IntegratedServerOptions): Promise<void>;
    /**
     * Start the Express HTTP web server
     */
    private startWebServer;
    /**
     * Open browser to dashboard (for dashboard mode)
     */
    private openBrowserToDashboard;
    /**
     * Setup graceful shutdown handlers
     */
    private setupGracefulShutdown;
    /**
     * Stop the integrated server
     */
    stop(): Promise<void>;
    /**
     * Cleanup resources
     */
    private cleanup;
    /**
     * Check if server is running
     */
    isRunning(): boolean;
    /**
     * Get server status
     */
    getStatus(): {
        running: boolean;
        mcpRunning: boolean;
        httpRunning: boolean;
        wsConnectedClients: number;
        port?: number;
    };
    /**
     * Get configuration
     */
    getConfig(): ReturnType<typeof getAppSettings>;
}
/**
 * Factory function to create and start integrated server
 */
export declare function createIntegratedServer(options?: IntegratedServerOptions): Promise<IntegratedSpecGenServer>;
//# sourceMappingURL=integrated-server.d.ts.map