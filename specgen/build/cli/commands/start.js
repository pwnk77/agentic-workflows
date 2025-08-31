/**
 * Start command for the MCP server
 */
import { Command } from 'commander';
import { logger } from '../../services/logging.service.js';
import { IntegratedSpecGenServer } from '../../src/integrated-server.js';
import { getAppSettings } from '../../config/settings.js';
export const startCommand = new Command('start')
    .description('Start the MCP server and HTTP API')
    .option('-p, --port <number>', 'HTTP API port (overrides config)', parseInt)
    .option('--db-path <path>', 'SQLite database path (overrides config)')
    .option('--log-level <level>', 'Log level (error|warn|info|debug)', /^(error|warn|info|debug)$/)
    .option('--no-api', 'Disable HTTP API server')
    .option('--api-only', 'Run only HTTP API (no MCP server)')
    .option('--dashboard', 'Launch in dashboard mode with browser auto-open')
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
        // Determine server mode
        let mode = 'integrated';
        if (options.noApi) {
            mode = 'mcp';
        }
        else if (options.apiOnly) {
            mode = 'dashboard';
        }
        else if (options.dashboard) {
            mode = 'dashboard';
        }
        logger.info('Starting SpecGen Server', {
            mode,
            port: settings.server.port,
            dbPath: settings.database.path,
            logLevel: settings.logging.level,
            autoOpenBrowser: options.dashboard
        });
        // Create and start integrated server
        const server = new IntegratedSpecGenServer();
        await server.start({
            mode,
            port: options.port,
            dbPath: options.dbPath,
            autoOpenBrowser: options.dashboard
        });
        logger.info('Server started successfully', {
            status: server.getStatus()
        });
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
});
//# sourceMappingURL=start.js.map