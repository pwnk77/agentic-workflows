/**
 * Express.js HTTP API server with TypeScript middleware
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getAppSettings } from '../config/settings.js';
import { logger } from '../services/logging.service.js';

// Import middleware
import { requestLogger, responseTime, requestId } from './middleware/logging.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

// Import routes
import { specsRouter } from './routes/specs.js';
import { searchRouter } from './routes/search.js';
import { healthRouter } from './routes/health.js';
import { dashboardRouter } from './routes/dashboard.js';

export function createAPIServer(): express.Application {
  const app = express();
  const settings = getAppSettings();

  // Trust proxy for headers like X-Forwarded-For
  app.set('trust proxy', true);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // CORS middleware
  if (settings.server.enableCors) {
    app.use(cors({
      origin: true, // Allow all origins for local development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
    }));
  }

  // Body parsing middleware
  app.use(express.json({ limit: settings.server.maxRequestSize }));
  app.use(express.urlencoded({ extended: true, limit: settings.server.maxRequestSize }));

  // Logging and tracing middleware
  app.use(requestId);
  app.use(responseTime);
  app.use(requestLogger);

  // API routes
  const apiPrefix = settings.server.apiPrefix;
  
  // Health check (no prefix)
  app.use('/health', healthRouter);
  
  // Dashboard route (no prefix)
  app.use('/dashboard', dashboardRouter);
  
  // API routes with prefix
  app.use(`${apiPrefix}/specs`, specsRouter);
  app.use(`${apiPrefix}/search`, searchRouter);

  // API documentation route
  app.get(apiPrefix, (req, res) => {
    res.json({
      success: true,
      message: 'SpecGen MCP Server API',
      version: '1.0.0',
      endpoints: {
        specs: `${apiPrefix}/specs`,
        search: `${apiPrefix}/search`,
        health: '/health',
        dashboard: '/dashboard'
      },
      documentation: {
        specs: {
          'GET /specs': 'List specifications with pagination',
          'GET /specs/:id': 'Get specification by ID',
          'POST /specs': 'Create new specification',
          'PUT /specs/:id': 'Update specification',
          'DELETE /specs/:id': 'Delete specification'
        },
        search: {
          'GET /search': 'Search specifications using full-text search',
          'GET /search/suggestions': 'Get search suggestions',
          'GET /search/stats': 'Get search statistics'
        }
      },
      timestamp: new Date().toISOString()
    });
  });

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  logger.info('Express API server configured', {
    apiPrefix: settings.server.apiPrefix,
    corsEnabled: settings.server.enableCors,
    maxRequestSize: settings.server.maxRequestSize
  });

  return app;
}