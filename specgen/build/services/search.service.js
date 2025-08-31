/**
 * Full-text search service using SQLite FTS5
 */
import { z } from 'zod';
import { getDataSource } from '../database/data-source.js';
import { SearchValidationError } from '../types/search.types.js';
import { logger } from './logging.service.js';
import { getAppSettings } from '../config/settings.js';
// Validation schema
const searchQuerySchema = z.object({
    query: z.string().min(1).max(1000).trim(),
    limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0),
    minScore: z.coerce.number().min(0).max(1).optional().default(0)
});
export class SearchService {
    settings;
    constructor() {
        this.settings = getAppSettings();
    }
    async searchSpecs(query) {
        const startTime = Date.now();
        logger.debug('Performing full-text search', { query: query.query });
        // Validate input
        const validationResult = searchQuerySchema.safeParse(query);
        if (!validationResult.success) {
            throw new SearchValidationError(`Invalid search query: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
        }
        const validatedQuery = validationResult.data;
        try {
            const dataSource = await getDataSource();
            // Prepare FTS5 query - escape special characters
            const ftsQuery = this.prepareFTSQuery(validatedQuery.query);
            // Execute search query with ranking
            const searchSql = `
        SELECT 
          s.id,
          s.title,
          s.body_md,
          s.status,
          s.created_at,
          s.updated_at,
          bm25(specs_fts) as score,
          snippet(specs_fts, 1, '<mark>', '</mark>', '...', 32) as snippet
        FROM specs_fts
        JOIN specs s ON s.id = specs_fts.rowid
        WHERE specs_fts MATCH ?
        AND bm25(specs_fts) >= ?
        ORDER BY bm25(specs_fts)
        LIMIT ? OFFSET ?
      `;
            const results = await dataSource.query(searchSql, [
                ftsQuery,
                validatedQuery.minScore,
                validatedQuery.limit,
                validatedQuery.offset
            ]);
            // Get total count for pagination
            const countSql = `
        SELECT COUNT(*) as total
        FROM specs_fts
        WHERE specs_fts MATCH ?
        AND bm25(specs_fts) >= ?
      `;
            const countResult = await dataSource.query(countSql, [
                ftsQuery,
                validatedQuery.minScore
            ]);
            const total = countResult[0]?.total || 0;
            const searchTime = Date.now() - startTime;
            const searchResults = results.map((row) => ({
                id: row.id,
                title: row.title,
                bodyMd: row.body_md,
                status: row.status,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
                score: Math.abs(row.score), // BM25 scores are negative, make them positive
                snippet: row.snippet
            }));
            const response = {
                results: searchResults,
                total,
                query: validatedQuery.query,
                limit: validatedQuery.limit,
                offset: validatedQuery.offset,
                hasMore: validatedQuery.offset + searchResults.length < total,
                searchTime
            };
            logger.debug('Search completed', {
                query: validatedQuery.query,
                resultCount: searchResults.length,
                total,
                searchTime: `${searchTime}ms`
            });
            return response;
        }
        catch (error) {
            logger.error('Search failed', error, { query: query.query });
            throw error;
        }
    }
    async suggestTerms(partialQuery, limit = 10) {
        if (!partialQuery.trim()) {
            return [];
        }
        logger.debug('Getting search suggestions', { partialQuery });
        try {
            const dataSource = await getDataSource();
            // Simple suggestion based on existing spec titles
            const suggestionSql = `
        SELECT DISTINCT
          SUBSTR(title, 1, INSTR(title || ' ', ' ') - 1) as term,
          COUNT(*) as frequency
        FROM specs
        WHERE title LIKE ? COLLATE NOCASE
        GROUP BY LOWER(term)
        ORDER BY frequency DESC, term
        LIMIT ?
      `;
            const results = await dataSource.query(suggestionSql, [
                `${partialQuery}%`,
                limit
            ]);
            return results.map((row) => ({
                term: row.term,
                frequency: row.frequency
            }));
        }
        catch (error) {
            logger.error('Failed to get search suggestions', error, { partialQuery });
            return [];
        }
    }
    async getSearchStats() {
        logger.debug('Getting FTS statistics');
        try {
            const dataSource = await getDataSource();
            // Get basic stats from FTS table
            const statsSql = `
        SELECT 
          COUNT(*) as total_documents,
          AVG(LENGTH(title) + LENGTH(body_md)) as avg_doc_length
        FROM specs_fts
      `;
            const statsResult = await dataSource.query(statsSql);
            const stats = statsResult[0] || { total_documents: 0, avg_doc_length: 0 };
            // Get approximate index size (SQLite pages used by FTS)
            let indexSize = 0;
            try {
                const sizeSql = `
          SELECT SUM(pgsize) as size 
          FROM dbstat 
          WHERE name LIKE 'specs_fts%'
        `;
                const sizeResult = await dataSource.query(sizeSql);
                indexSize = sizeResult[0]?.size || 0;
            }
            catch {
                // dbstat might not be available, use approximation
                indexSize = stats.total_documents * stats.avg_doc_length * 0.3; // rough estimate
            }
            const ftsStats = {
                totalDocuments: stats.total_documents,
                avgDocumentLength: Math.round(stats.avg_doc_length),
                indexSize: Math.round(indexSize)
            };
            logger.debug('FTS statistics retrieved', ftsStats);
            return ftsStats;
        }
        catch (error) {
            logger.error('Failed to get FTS statistics', error);
            throw error;
        }
    }
    async optimizeIndex() {
        logger.info('Optimizing FTS index');
        try {
            const dataSource = await getDataSource();
            await dataSource.query("INSERT INTO specs_fts(specs_fts) VALUES('optimize')");
            logger.info('FTS index optimization completed');
        }
        catch (error) {
            logger.error('Failed to optimize FTS index', error);
            throw error;
        }
    }
    prepareFTSQuery(query) {
        // Clean and prepare query for FTS5
        let cleanQuery = query.trim();
        // Remove or escape special FTS5 characters
        cleanQuery = cleanQuery.replace(/["`*]/g, '');
        // Split into words and add prefix matching for partial words
        const words = cleanQuery.split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) {
            return '""'; // Empty query
        }
        // For single word queries, add prefix matching
        if (words.length === 1) {
            const word = words[0];
            if (word.length >= 3) {
                return `"${word}"*`; // Prefix search for words >= 3 chars
            }
            else {
                return `"${word}"`; // Exact match for short words
            }
        }
        // For multiple words, use phrase search with some flexibility
        if (words.length <= 3) {
            return `"${words.join(' ')}"`; // Phrase search
        }
        // For longer queries, use individual word search
        return words.map(word => `"${word}"`).join(' AND ');
    }
    async validateFTSIntegrity() {
        try {
            const dataSource = await getDataSource();
            // Check if FTS table exists and has correct structure
            const tableCheck = await dataSource.query(`
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name='specs_fts'
      `);
            if (tableCheck.length === 0) {
                logger.warn('FTS table specs_fts does not exist');
                return false;
            }
            // Test basic search functionality
            await dataSource.query(`
        SELECT COUNT(*) FROM specs_fts WHERE specs_fts MATCH 'test'
      `);
            // Check document count consistency
            const [specsCount, ftsCount] = await Promise.all([
                dataSource.query('SELECT COUNT(*) as count FROM specs'),
                dataSource.query('SELECT COUNT(*) as count FROM specs_fts')
            ]);
            if (specsCount[0].count !== ftsCount[0].count) {
                logger.warn('FTS document count mismatch', {
                    specs: specsCount[0].count,
                    fts: ftsCount[0].count
                });
                return false;
            }
            logger.debug('FTS integrity validation passed');
            return true;
        }
        catch (error) {
            logger.error('FTS integrity validation failed', error);
            return false;
        }
    }
}
//# sourceMappingURL=search.service.js.map