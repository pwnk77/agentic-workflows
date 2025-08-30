/**
 * Start command for the MCP server
 */
import { Command } from 'commander';
import { logger } from '../../services/logging.service.js';
import { initializeDatabase } from '../../database/data-source.js';
import { createMCPServer } from '../../mcp/server.js';
import { createAPIServer } from '../../api/server.js';
import { getAppSettings } from '../../config/settings.js';
export const startCommand = new Command('start')
    .description('Start the MCP server and HTTP API')
    .option('-p, --port <number>', 'HTTP API port (overrides config)', parseInt)
    .option('--db-path <path>', 'SQLite database path (overrides config)')
    .option('--log-level <level>', 'Log level (error|warn|info|debug)', /^(error|warn|info|debug)$/)
    .option('--no-api', 'Disable HTTP API server')
    .option('--api-only', 'Run only HTTP API (no MCP server)')
    .action(async (options) => {
    try {
        const settings = getAppSettings();
        // Override settings with CLI options
        if (options.port)
            settings.server.port = options.port;
        if (options.dbPath)
            settings.database.path = options.dbPath;
        if (options.logLevel)
            settings.logging.level = options.logLevel;
        logger.info('Starting SpecGen MCP Server', {
            port: settings.server.port,
            dbPath: settings.database.path,
            logLevel: settings.logging.level,
            apiDisabled: options.noApi,
            apiOnly: options.apiOnly
        });
        // Initialize database
        logger.info('Initializing database...');
        await initializeDatabase(settings.database.path);
        logger.info('Database initialized successfully');
        // Start MCP server (unless API-only mode)
        let mcpServer = null;
        if (!options.apiOnly) {
            logger.info('Starting MCP server...');
            mcpServer = createMCPServer();
            logger.info('MCP server started successfully');
        }
        // Start HTTP API server (unless disabled)
        let httpServer = null;
        if (!options.noApi) {
            logger.info('Starting HTTP API server...');
            const apiServer = createAPIServer();
            httpServer = apiServer.listen(settings.server.port, () => {
                logger.info(`HTTP API server listening on port ${settings.server.port}`);
            });
        }
        // Handle graceful shutdown
        const shutdown = async (signal) => {
            logger.info(`Received ${signal}, shutting down gracefully...`);
            try {
                if (httpServer) {
                    httpServer.close();
                    logger.info('HTTP server closed');
                }
                if (mcpServer) {
                    await mcpServer.close?.();
                    logger.info('MCP server closed');
                }
                logger.info('Shutdown complete');
                process.exit(0);
            }
            catch (error) {
                logger.error('Error during shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
});
//# sourceMappingURL=start.js.map