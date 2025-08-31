/**
 * TypeORM DataSource configuration and management
 */
import { DataSource } from 'typeorm';
import { createDatabaseConfig } from './config.js';
import { logger } from '../services/logging.service.js';
let dataSource = null;
export async function getDataSource(dbPath) {
    const effectiveDbPath = dbPath || './specgen.sqlite';
    if (dataSource && dataSource.isInitialized) {
        return dataSource;
    }
    const config = createDatabaseConfig(effectiveDbPath);
    dataSource = new DataSource(config);
    if (!dataSource.isInitialized) {
        logger.info(`Connecting to SQLite database: ${effectiveDbPath}`);
        await dataSource.initialize();
        logger.info('Database connection established');
    }
    return dataSource;
}
export async function initializeDatabase(dbPath, force = false) {
    try {
        const ds = await getDataSource(dbPath);
        if (force) {
            logger.warn('Force mode: Dropping existing schema');
            await ds.dropDatabase();
            await ds.synchronize();
        }
        else {
            // Run pending migrations
            const pendingMigrations = await ds.showMigrations();
            if (pendingMigrations) {
                logger.info('Running pending database migrations');
                await ds.runMigrations();
                logger.info('Database migrations completed');
            }
            else {
                logger.info('Database schema is up to date');
            }
        }
        // Verify database structure
        await verifyDatabaseStructure(ds);
        return ds;
    }
    catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
}
async function verifyDatabaseStructure(ds) {
    try {
        // Check if essential tables exist
        const tables = await ds.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('specs', 'todos', 'exec_logs', 'issue_logs')
    `);
        const expectedTables = ['specs', 'todos', 'exec_logs', 'issue_logs'];
        const existingTables = tables.map((t) => t.name);
        for (const table of expectedTables) {
            if (!existingTables.includes(table)) {
                throw new Error(`Required table '${table}' not found in database`);
            }
        }
        logger.info('Database structure verification passed');
    }
    catch (error) {
        logger.error('Database structure verification failed:', error);
        throw error;
    }
}
export async function closeDatabase() {
    if (dataSource && dataSource.isInitialized) {
        logger.info('Closing database connection');
        await dataSource.destroy();
        dataSource = null;
        logger.info('Database connection closed');
    }
}
// Graceful shutdown handling - DISABLED to prevent SQLite crashes in MCP server
// process.on('SIGINT', closeDatabase);
// process.on('SIGTERM', closeDatabase);  
// process.on('exit', closeDatabase);
//# sourceMappingURL=data-source.js.map