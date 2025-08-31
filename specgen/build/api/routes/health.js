/**
 * Health check routes
 */
import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { getDataSource } from '../../database/data-source.js';
import { logger } from '../../services/logging.service.js';
export const healthRouter = Router();
healthRouter.get('/', asyncHandler(async (req, res) => {
    const startTime = Date.now();
    try {
        // Test database connection
        const dataSource = await getDataSource();
        await dataSource.query('SELECT 1');
        const healthData = {
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: 'connected',
            responseTime: Date.now() - startTime
        };
        res.json(healthData);
    }
    catch (error) {
        logger.error('Health check failed', error);
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
            responseTime: Date.now() - startTime
        });
    }
}));
//# sourceMappingURL=health.js.map