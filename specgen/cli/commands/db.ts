/**
 * Database management commands
 */

import { Command } from 'commander';
import { logger } from '../../services/logging.service.js';
import { initializeDatabase, getDataSource } from '../../database/data-source.js';
import { getAppSettings } from '../../config/settings.js';

export const dbCommand = new Command('db')
  .description('Database management commands');

dbCommand
  .command('init')
  .description('Initialize database with tables and indexes')
  .option('--db-path <path>', 'SQLite database path (overrides config)')
  .option('--force', 'Force recreate database (drops existing tables)')
  .action(async (options) => {
    try {
      const settings = getAppSettings();
      const dbPath = options.dbPath || settings.database.path;
      
      logger.info(`Initializing database at: ${dbPath}`, {
        force: options.force
      });

      if (options.force) {
        logger.warn('Force mode: existing database will be dropped!');
      }

      await initializeDatabase(dbPath, options.force);
      logger.info('Database initialization completed successfully');
      
    } catch (error) {
      logger.error('Database initialization failed:', error as Error);
      process.exit(1);
    }
  });

dbCommand
  .command('migrate')
  .description('Run database migrations')
  .option('--db-path <path>', 'SQLite database path (overrides config)')
  .option('--dry-run', 'Show pending migrations without executing')
  .action(async (options) => {
    try {
      const settings = getAppSettings();
      const dbPath = options.dbPath || settings.database.path;
      
      logger.info(`Running migrations for database: ${dbPath}`, {
        dryRun: options.dryRun
      });

      const dataSource = await getDataSource(dbPath);
      
      if (options.dryRun) {
        const pendingMigrations = await dataSource.showMigrations();
        if (pendingMigrations) {
          logger.info('Pending migrations found');
        } else {
          logger.info('No pending migrations');
        }
      } else {
        await dataSource.runMigrations();
        logger.info('Migrations completed successfully');
      }
      
      await dataSource.destroy();
      
    } catch (error) {
      logger.error('Migration failed:', error as Error);
      process.exit(1);
    }
  });

dbCommand
  .command('status')
  .description('Show database status and migration info')
  .option('--db-path <path>', 'SQLite database path (overrides config)')
  .action(async (options) => {
    try {
      const settings = getAppSettings();
      const dbPath = options.dbPath || settings.database.path;
      
      logger.info(`Database status for: ${dbPath}`);

      const dataSource = await getDataSource(dbPath);
      const isInitialized = dataSource.isInitialized;
      const hasMetadata = await dataSource.query("SELECT name FROM sqlite_master WHERE type='table' AND name='typeorm_metadata'").catch(() => null);
      const hasMigrations = await dataSource.showMigrations();
      
      logger.info('Database Status:', {
        path: dbPath,
        initialized: isInitialized,
        hasMetadata: !!hasMetadata,
        pendingMigrations: !!hasMigrations
      });
      
      await dataSource.destroy();
      
    } catch (error) {
      logger.error('Failed to get database status:', error as Error);
      process.exit(1);
    }
  });