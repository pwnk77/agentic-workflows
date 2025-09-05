/**
 * Spec controller with type-safe request handlers
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { SpecService } from '../../services/spec.service.js';
import { logger } from '../../services/logging.service.js';
import { websocketHandler } from '../../src/dashboard/websocket-handler.js';

// Request/Response schemas
const createSpecSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  body_md: z.string().min(1),
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional().default('draft')
});

const updateSpecSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  body_md: z.string().min(1).optional(),
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional()
});

const listSpecsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional(),
  sort_by: z.enum(['id', 'title', 'created_at', 'updated_at']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

export class SpecController {
  private specService: SpecService;

  constructor() {
    this.specService = new SpecService();
  }

  async listSpecs(req: Request, res: Response): Promise<void> {
    const query = listSpecsQuerySchema.parse(req.query);
    
    logger.debug('Listing specs via API', query);

    const result = await this.specService.listSpecs({
      limit: query.limit,
      offset: query.offset,
      status: query.status,
      sortBy: query.sort_by,
      sortOrder: query.sort_order.toUpperCase() as 'ASC' | 'DESC'
    });

    res.json({
      success: true,
      data: {
        specs: result.specs.map(spec => ({
          id: spec.id,
          title: spec.title,
          body_md: spec.bodyMd,
          status: spec.status,
          version: spec.version,
          created_at: spec.createdAt.toISOString(),
          updated_at: spec.updatedAt.toISOString()
        })),
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          has_more: result.hasMore
        }
      },
      timestamp: new Date().toISOString()
    });
  }

  async getSpec(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const includeRelations = req.query.include_relations === 'true';
    
    logger.debug('Getting spec via API', { id, includeRelations });

    const spec = await this.specService.getSpec(id, includeRelations);

    const responseData: any = {
      id: spec.id,
      title: spec.title,
      body_md: spec.bodyMd,
      status: spec.status,
      version: spec.version,
      created_at: spec.createdAt.toISOString(),
      updated_at: spec.updatedAt.toISOString()
    };

    if (includeRelations) {
      responseData.todos = spec.todos || [];
      responseData.exec_logs = spec.execLogs || [];
      responseData.issue_logs = spec.issueLogs || [];
    }

    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });
  }

  async createSpec(req: Request, res: Response): Promise<void> {
    const data = createSpecSchema.parse(req.body);
    
    logger.debug('Creating spec via API', { title: data.title });

    const spec = await this.specService.createSpec({
      title: data.title,
      bodyMd: data.body_md,
      status: data.status
    });

    // Broadcast spec creation to WebSocket clients
    websocketHandler.broadcastSpecCreated({
      id: spec.id,
      title: spec.title,
      bodyMd: spec.bodyMd,
      status: spec.status,
      version: spec.version,
      createdAt: spec.createdAt.toISOString(),
      updatedAt: spec.updatedAt.toISOString()
    });

    res.status(201).json({
      success: true,
      data: {
        id: spec.id,
        title: spec.title,
        status: spec.status,
        version: spec.version,
        created_at: spec.createdAt.toISOString(),
        updated_at: spec.updatedAt.toISOString()
      },
      message: 'Specification created successfully',
      timestamp: new Date().toISOString()
    });
  }

  async updateSpec(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const data = updateSpecSchema.parse(req.body);
    
    logger.debug('Updating spec via API', { id, ...data });

    // Get the current spec to check for status changes
    const currentSpec = await this.specService.getSpec(id);
    const oldStatus = currentSpec.status;

    const updateFields: any = {};
    if (data.title) updateFields.title = data.title;
    if (data.body_md) updateFields.bodyMd = data.body_md;
    if (data.status) updateFields.status = data.status;

    const spec = await this.specService.updateSpec(id, updateFields);

    // Broadcast spec update to WebSocket clients
    websocketHandler.broadcastSpecUpdate(spec.id, {
      id: spec.id,
      title: spec.title,
      bodyMd: spec.bodyMd,
      status: spec.status,
      version: spec.version,
      createdAt: spec.createdAt.toISOString(),
      updatedAt: spec.updatedAt.toISOString()
    });

    // If status changed, also broadcast status change
    if (data.status && oldStatus !== spec.status) {
      websocketHandler.broadcastSpecStatusChanged(spec.id, oldStatus, spec.status);
    }

    res.json({
      success: true,
      data: {
        id: spec.id,
        title: spec.title,
        status: spec.status,
        version: spec.version,
        created_at: spec.createdAt.toISOString(),
        updated_at: spec.updatedAt.toISOString()
      },
      message: 'Specification updated successfully',
      timestamp: new Date().toISOString()
    });
  }

  async deleteSpec(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    
    logger.debug('Deleting spec via API', { id });

    await this.specService.deleteSpec(id);

    // Broadcast spec deletion to WebSocket clients
    websocketHandler.broadcastSpecDeleted(id);

    res.json({
      success: true,
      message: `Specification ${id} deleted successfully`,
      timestamp: new Date().toISOString()
    });
  }

  async getSpecStats(req: Request, res: Response): Promise<void> {
    logger.debug('Getting spec stats via API');

    const stats = await this.specService.getSpecStats();

    // Broadcast stats update to WebSocket clients
    websocketHandler.broadcastStatsUpdate({
      total: stats.total,
      by_status: stats.byStatus
    });

    res.json({
      success: true,
      data: {
        total: stats.total,
        by_status: stats.byStatus
      },
      timestamp: new Date().toISOString()
    });
  }
}