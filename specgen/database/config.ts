/**
 * Database configuration utilities
 */

import { DataSourceOptions } from 'typeorm';
import { Spec, Todo, ExecLog, IssueLog } from '../entities/index.js';
import { getAppSettings } from '../config/settings.js';

export function createDatabaseConfig(dbPath: string): DataSourceOptions {
  const settings = getAppSettings();
  
  return {
    type: 'sqlite',
    database: dbPath,
    entities: [Spec, Todo, ExecLog, IssueLog],
    synchronize: false, // Use migrations instead
    migrations: ['dist/database/migrations/*.js'],
    migrationsTableName: 'typeorm_migrations',
    logging: settings.logging.level === 'debug' ? ['query', 'error'] : ['error'],
    
    // SQLite-specific optimizations
    extra: {
      // Enable WAL mode for better concurrency
      pragma: [
        'PRAGMA journal_mode = WAL',
        'PRAGMA synchronous = NORMAL', 
        'PRAGMA cache_size = 1000',
        'PRAGMA temp_store = memory',
        'PRAGMA mmap_size = 268435456', // 256MB memory mapping
      ].join('; ')
    },

    // Connection pool settings
    maxQueryExecutionTime: settings.database.queryTimeout,
    
    // TypeORM specific settings for better performance
    dropSchema: false,
    cache: {
      duration: 30000, // 30 seconds cache
    }
  };
}