/**
 * Application settings and configuration
 */
export interface DatabaseConfig {
    path: string;
    walMode: boolean;
    memoryMapping: boolean;
    connectionTimeout: number;
    queryTimeout: number;
}
export interface ServerConfig {
    port: number;
    apiPrefix: string;
    enableCors: boolean;
    maxRequestSize: string;
}
export interface MCPConfig {
    serverName: string;
    serverVersion: string;
    maxTools: number;
    maxResources: number;
}
export interface SearchConfig {
    resultsLimit: number;
    maxQueryLength: number;
    enableFuzzySearch: boolean;
}
export interface LoggingConfig {
    level: string;
    enableConsole: boolean;
    enableFile: boolean;
    maxFileSize: number;
    maxFiles: number;
}
export interface DashboardConfig {
    defaultPort: number;
    autoOpenBrowser: boolean;
    staticPath: string;
}
export interface WebSocketConfig {
    enabled: boolean;
    pingInterval: number;
    maxConnections: number;
    heartbeatTimeout: number;
}
export interface AppSettings {
    database: DatabaseConfig;
    server: ServerConfig;
    mcp: MCPConfig;
    search: SearchConfig;
    logging: LoggingConfig;
    dashboard: DashboardConfig;
    websocket: WebSocketConfig;
    maxSpecSize: number;
}
export declare function getAppSettings(): AppSettings;
//# sourceMappingURL=settings.d.ts.map