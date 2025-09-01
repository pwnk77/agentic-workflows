/**
 * Dashboard routes for serving HTML interface
 */

import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { asyncHandler } from '../middleware/async-handler.js';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const dashboardRouter = Router();
const dashboardController = new DashboardController();

// Validation schemas
const recentActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20)
});

// API routes

// GET /dashboard/api/stats - Get comprehensive dashboard statistics
dashboardRouter.get('/api/stats',
  asyncHandler(async (req, res) => {
    await dashboardController.getDashboardStats(req, res);
  })
);

// GET /dashboard/api/health - Get system health status
dashboardRouter.get('/api/health',
  asyncHandler(async (req, res) => {
    await dashboardController.getSystemHealth(req, res);
  })
);

// GET /dashboard/api/activity - Get recent activity
dashboardRouter.get('/api/activity',
  validate({ query: recentActivityQuerySchema }),
  asyncHandler(async (req, res) => {
    await dashboardController.getRecentActivity(req, res);
  })
);

// GET /dashboard/api/websocket - Get WebSocket status
dashboardRouter.get('/api/websocket',
  asyncHandler(async (req, res) => {
    await dashboardController.getWebSocketStatus(req, res);
  })
);

// HTML routes

// GET /dashboard - Serve simplified Alpine.js dashboard
dashboardRouter.get('/',
  asyncHandler(async (req, res) => {
    const dashboardPath = join(__dirname, '../../../public/dashboard-simple.html');
    
    if (!existsSync(dashboardPath)) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
        message: 'The simplified dashboard was not found at public/dashboard-simple.html',
        timestamp: new Date().toISOString()
      });
    }
    
    try {
      const htmlContent = readFileSync(dashboardPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache'); // No cache for HTML file
      res.send(htmlContent);
      return;
    } catch (error) {
      console.error('Failed to read dashboard file:', error);
      res.status(500).json({
        success: false,
        error: 'File read error',
        message: 'Failed to read simplified dashboard file',
        timestamp: new Date().toISOString()
      });
      return;
    }
  })
);