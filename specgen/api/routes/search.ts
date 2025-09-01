/**
 * Search REST API routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { SearchController } from '../controllers/search.controller.js';

export const searchRouter = Router();
const searchController = new SearchController();

// Validation schemas
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

// Routes

// GET /api/search - Search specifications
searchRouter.get('/',
  validate({ query: searchQuerySchema }),
  asyncHandler(async (req, res) => {
    await searchController.searchSpecs(req, res);
  })
);

// GET /api/search/suggestions - Get search suggestions
searchRouter.get('/suggestions',
  validate({ query: suggestionsQuerySchema }),
  asyncHandler(async (req, res) => {
    await searchController.getSuggestions(req, res);
  })
);

// GET /api/search/stats - Get search statistics
searchRouter.get('/stats',
  asyncHandler(async (req, res) => {
    await searchController.getSearchStats(req, res);
  })
);

// POST /api/search/optimize - Optimize search index
searchRouter.post('/optimize',
  asyncHandler(async (req, res) => {
    await searchController.optimizeIndex(req, res);
  })
);

// GET /api/search/integrity - Validate FTS integrity
searchRouter.get('/integrity',
  asyncHandler(async (req, res) => {
    await searchController.validateIntegrity(req, res);
  })
);