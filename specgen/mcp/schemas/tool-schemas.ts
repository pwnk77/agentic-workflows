/**
 * Zod validation schemas for MCP tools
 */

import { z } from 'zod';

// Base schemas
export const specIdSchema = z.coerce.number().int().positive();
export const specStatusSchema = z.enum(['draft', 'todo', 'in-progress', 'done']);

// Create spec tool schema
export const createSpecToolSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  body_md: z.string().min(1),
  status: specStatusSchema.optional().default('draft')
});

// Update spec tool schema
export const updateSpecToolSchema = z.object({
  spec_id: specIdSchema,
  title: z.string().min(1).max(255).trim().optional(),
  body_md: z.string().min(1).optional(),
  status: specStatusSchema.optional()
}).refine(data => {
  const { spec_id, ...updateFields } = data;
  return Object.keys(updateFields).length > 0;
}, {
  message: "At least one field (title, body_md, or status) must be provided for update"
});

// List specs tool schema
export const listSpecsToolSchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  status: specStatusSchema.optional(),
  sort_by: z.enum(['id', 'title', 'created_at', 'updated_at']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

// Get spec tool schema
export const getSpecToolSchema = z.object({
  spec_id: specIdSchema,
  include_relations: z.coerce.boolean().optional().default(false)
});

// Delete spec tool schema
export const deleteSpecToolSchema = z.object({
  spec_id: specIdSchema
});

// Search specs tool schema
export const searchSpecsToolSchema = z.object({
  query: z.string().min(1).max(1000).trim(),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  min_score: z.coerce.number().min(0).max(1).optional().default(0)
});

// Get spec stats tool schema
export const getSpecStatsToolSchema = z.object({
  include_details: z.coerce.boolean().optional().default(false)
});

// Launch dashboard tool schema
export const launchDashboardToolSchema = z.object({
  port: z.coerce.number().int().min(1024).max(65535).optional().default(3001),
  open_browser: z.coerce.boolean().optional().default(true)
});

export type CreateSpecToolInput = z.infer<typeof createSpecToolSchema>;
export type UpdateSpecToolInput = z.infer<typeof updateSpecToolSchema>;
export type ListSpecsToolInput = z.infer<typeof listSpecsToolSchema>;
export type GetSpecToolInput = z.infer<typeof getSpecToolSchema>;
export type DeleteSpecToolInput = z.infer<typeof deleteSpecToolSchema>;
export type SearchSpecsToolInput = z.infer<typeof searchSpecsToolSchema>;
export type GetSpecStatsToolInput = z.infer<typeof getSpecStatsToolSchema>;
export type LaunchDashboardToolInput = z.infer<typeof launchDashboardToolSchema>;