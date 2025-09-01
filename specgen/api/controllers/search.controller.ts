/**
 * Search controller with type-safe request handlers
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { SearchService } from '../../services/search.service.js';
import { logger } from '../../services/logging.service.js';

// Request schemas
const searchQuerySchema = z.object({
  q: z.string().min(1).max(1000).trim(),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  min_score: z.coerce.number().min(0).max(1).optional().default(0)
});

const suggestionsQuerySchema = z.object({
  q: z.string().min(1).max(100).trim(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10)
});

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  async searchSpecs(req: Request, res: Response): Promise<void> {
    const query = searchQuerySchema.parse(req.query);
    
    logger.debug('Searching specs via API', { query: query.q });

    const result = await this.searchService.searchSpecs({
      query: query.q,
      limit: query.limit,
      offset: query.offset,
      minScore: query.min_score
    });

    res.json({
      success: true,
      data: {
        query: result.query,
        results: result.results.map(result => ({
          id: result.id,
          title: result.title,
          status: result.status,
          score: result.score,
          snippet: result.snippet,
          created_at: result.createdAt.toISOString(),
          updated_at: result.updatedAt.toISOString()
        })),
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          has_more: result.hasMore
        },
        search_time_ms: result.searchTime
      },
      timestamp: new Date().toISOString()
    });
  }

  async getSuggestions(req: Request, res: Response): Promise<void> {
    const query = suggestionsQuerySchema.parse(req.query);
    
    logger.debug('Getting search suggestions via API', { query: query.q });

    const suggestions = await this.searchService.suggestTerms(query.q, query.limit);

    res.json({
      success: true,
      data: {
        query: query.q,
        suggestions: suggestions.map(suggestion => ({
          term: suggestion.term,
          frequency: suggestion.frequency
        }))
      },
      timestamp: new Date().toISOString()
    });
  }

  async getSearchStats(req: Request, res: Response): Promise<void> {
    logger.debug('Getting search stats via API');

    const stats = await this.searchService.getSearchStats();

    res.json({
      success: true,
      data: {
        total_documents: stats.totalDocuments,
        avg_document_length: stats.avgDocumentLength,
        index_size_bytes: stats.indexSize,
        last_optimized: stats.lastOptimized?.toISOString() || null
      },
      timestamp: new Date().toISOString()
    });
  }

  async optimizeIndex(req: Request, res: Response): Promise<void> {
    logger.info('Optimizing search index via API');

    await this.searchService.optimizeIndex();

    res.json({
      success: true,
      message: 'Search index optimization completed',
      timestamp: new Date().toISOString()
    });
  }

  async validateIntegrity(req: Request, res: Response): Promise<void> {
    logger.debug('Validating FTS integrity via API');

    const isHealthy = await this.searchService.validateFTSIntegrity();

    res.json({
      success: true,
      data: {
        is_healthy: isHealthy,
        message: isHealthy ? 'FTS integrity is valid' : 'FTS integrity check failed'
      },
      timestamp: new Date().toISOString()
    });
  }
}