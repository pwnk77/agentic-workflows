/**
 * Specifications REST API routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { validate, idParamSchema } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { SpecController } from '../controllers/spec.controller.js';

export const specsRouter = Router();
const specController = new SpecController();

// Validation schemas
const createSpecBodySchema = z.object({
  title: z.string().min(1).max(255).trim(),
  body_md: z.string().min(1),
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional().default('draft')
});

const updateSpecBodySchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  body_md: z.string().min(1).optional(),
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

const listSpecsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional(),
  sort_by: z.enum(['id', 'title', 'created_at', 'updated_at']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

const getSpecQuerySchema = z.object({
  include_relations: z.enum(['true', 'false']).optional().default('false')
});

// Routes

// GET /api/specs - List specifications
specsRouter.get('/',
  validate({ query: listSpecsQuerySchema }),
  asyncHandler(async (req, res) => {
    await specController.listSpecs(req, res);
  })
);

// GET /api/specs/stats - Get specification statistics
specsRouter.get('/stats',
  asyncHandler(async (req, res) => {
    await specController.getSpecStats(req, res);
  })
);

// GET /api/specs/:id - Get specification by ID
specsRouter.get('/:id',
  validate({ 
    params: idParamSchema,
    query: getSpecQuerySchema
  }),
  asyncHandler(async (req, res) => {
    await specController.getSpec(req, res);
  })
);

// POST /api/specs - Create new specification
specsRouter.post('/',
  validate({ body: createSpecBodySchema }),
  asyncHandler(async (req, res) => {
    await specController.createSpec(req, res);
  })
);

// PUT /api/specs/:id - Update specification
specsRouter.put('/:id',
  validate({ 
    params: idParamSchema,
    body: updateSpecBodySchema
  }),
  asyncHandler(async (req, res) => {
    await specController.updateSpec(req, res);
  })
);

// DELETE /api/specs/:id - Delete specification
specsRouter.delete('/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    await specController.deleteSpec(req, res);
  })
);