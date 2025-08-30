/**
 * Full-text search utilities and management
 */
import { logger } from '../services/logging.service.js';
export async function rebuildFTSIndex(dataSource, options = {}) {
    try {
        logger.info('Rebuilding FTS index for specs table');
        // Clear existing FTS data
        await dataSource.query('DELETE FROM specs_fts');
        // Repopulate FTS table from current specs data
        const result = await dataSource.query(`
      INSERT INTO specs_fts(rowid, title, body_md)
      SELECT id, title, body_md FROM specs
    `);
        if (options.verbose) {
            const count = await dataSource.query('SELECT COUNT(*) as count FROM specs_fts');
            logger.info(`FTS index rebuilt with ${count[0].count} documents`);
        }
        else {
            logger.info('FTS index rebuild completed');
        }
    }
    catch (error) {
        logger.error('Failed to rebuild FTS index:', error);
        throw error;
    }
}
export async function optimizeFTSIndex(dataSource) {
    try {
        logger.info('Optimizing FTS index');
        await dataSource.query("INSERT INTO specs_fts(specs_fts) VALUES('optimize')");
        logger.info('FTS index optimization completed');
    }
    catch (error) {
        logger.error('Failed to optimize FTS index:', error);
        throw error;
    }
}
export async function getFTSStatus(dataSource) {
    try {
        const stats = await dataSource.query(`
      SELECT 
        (SELECT COUNT(*) FROM specs) as total_specs,
        (SELECT COUNT(*) FROM specs_fts) as fts_docs,
        (SELECT COUNT(*) FROM sqlite_master WHERE type='trigger' AND name LIKE 'specs_fts_%') as fts_triggers
    `);
        return {
            totalSpecs: stats[0].total_specs,
            ftsDocuments: stats[0].fts_docs,
            ftsTriggers: stats[0].fts_triggers,
            isHealthy: stats[0].total_specs === stats[0].fts_docs && stats[0].fts_triggers === 3
        };
    }
    catch (error) {
        logger.error('Failed to get FTS status:', error);
        throw error;
    }
}
export async function validateFTSIntegrity(dataSource) {
    try {
        const status = await getFTSStatus(dataSource);
        if (!status.isHealthy) {
            logger.warn('FTS integrity check failed:', status);
            return false;
        }
        // Test a simple FTS query to ensure it's working
        await dataSource.query("SELECT * FROM specs_fts WHERE specs_fts MATCH 'test' LIMIT 1");
        logger.info('FTS integrity check passed');
        return true;
    }
    catch (error) {
        logger.error('FTS integrity validation failed:', error);
        return false;
    }
}
//# sourceMappingURL=fts-setup.js.map