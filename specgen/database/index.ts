/**
 * Database module exports
 */

export { getDataSource, initializeDatabase, closeDatabase } from './data-source.js';
export { createDatabaseConfig } from './config.js';
export { rebuildFTSIndex, optimizeFTSIndex, getFTSStatus, validateFTSIntegrity } from './fts-setup.js';
export type { FTSRebuildOptions } from './fts-setup.js';