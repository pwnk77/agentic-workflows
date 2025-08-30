/**
 * Application settings and configuration
 */
import { getEnvironment } from './environment.js';
export function getAppSettings() {
    const env = getEnvironment();
    return {
        database: {
            path: env.DATABASE_PATH,
            walMode: env.DATABASE_WAL_MODE,
            memoryMapping: env.DATABASE_MEMORY_MAPPING,
            connectionTimeout: 30000,
            queryTimeout: 10000
        },
        server: {
            port: env.PORT,
            apiPrefix: env.API_PREFIX,
            enableCors: env.ENABLE_CORS,
            maxRequestSize: '10mb'
        },
        mcp: {
            serverName: env.MCP_SERVER_NAME,
            serverVersion: '1.0.0',
            maxTools: 10,
            maxResources: 1000
        },
        search: {
            resultsLimit: env.SEARCH_RESULTS_LIMIT,
            maxQueryLength: 1000,
            enableFuzzySearch: true
        },
        logging: {
            level: env.LOG_LEVEL,
            enableConsole: true,
            enableFile: !env.NODE_ENV || env.NODE_ENV === 'development',
            maxFileSize: 5242880, // 5MB
            maxFiles: 5
        },
        maxSpecSize: env.MAX_SPEC_SIZE
    };
}
//# sourceMappingURL=settings.js.map