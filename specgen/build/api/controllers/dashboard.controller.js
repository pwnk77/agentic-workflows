/**
 * Dashboard controller for overview statistics and metrics
 */
import { SpecService } from '../../services/spec.service.js';
import { SearchService } from '../../services/search.service.js';
import { websocketHandler } from '../../src/dashboard/websocket-handler.js';
import { logger } from '../../services/logging.service.js';
export class DashboardController {
    specService;
    searchService;
    constructor() {
        this.specService = new SpecService();
        this.searchService = new SearchService();
    }
    /**
     * Get comprehensive dashboard statistics
     */
    async getDashboardStats(req, res) {
        logger.debug('Getting dashboard stats via API');
        try {
            // Fetch all statistics in parallel
            const [specStats, searchStats, recentSpecs] = await Promise.all([
                this.specService.getSpecStats(),
                this.searchService.getSearchStats(),
                this.getRecentSpecs(10)
            ]);
            // Get WebSocket status
            const wsStats = {
                connected_clients: websocketHandler.getConnectedClientsCount(),
                clients_status: websocketHandler.getClientsStatus()
            };
            // Calculate activity metrics
            const activityStats = await this.getActivityStats();
            res.json({
                success: true,
                data: {
                    overview: {
                        total_specs: specStats.total,
                        specs_by_status: specStats.byStatus,
                        search_documents: searchStats.totalDocuments,
                        avg_document_length: searchStats.avgDocumentLength,
                        index_size_bytes: searchStats.indexSize
                    },
                    recent_activity: {
                        recent_specs: recentSpecs,
                        activity_summary: activityStats
                    },
                    system_status: {
                        websocket: wsStats,
                        search_healthy: await this.searchService.validateFTSIntegrity()
                    }
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger.error('Failed to get dashboard stats', error);
            throw error;
        }
    }
    /**
     * Get system health status
     */
    async getSystemHealth(req, res) {
        logger.debug('Getting system health via API');
        try {
            const [searchHealthy, specStats] = await Promise.all([
                this.searchService.validateFTSIntegrity(),
                this.specService.getSpecStats()
            ]);
            const health = {
                overall_status: searchHealthy ? 'healthy' : 'degraded',
                services: {
                    database: 'healthy', // If we can query specs, DB is healthy
                    search: searchHealthy ? 'healthy' : 'degraded',
                    websocket: websocketHandler.getConnectedClientsCount() >= 0 ? 'healthy' : 'error'
                },
                metrics: {
                    total_specs: specStats.total,
                    connected_clients: websocketHandler.getConnectedClientsCount(),
                    memory_usage: process.memoryUsage(),
                    uptime_seconds: process.uptime()
                }
            };
            const statusCode = health.overall_status === 'healthy' ? 200 : 503;
            res.status(statusCode).json({
                success: health.overall_status === 'healthy',
                data: health,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger.error('Failed to get system health', error);
            res.status(503).json({
                success: false,
                data: {
                    overall_status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    /**
     * Get recent activity summary
     */
    async getRecentActivity(req, res) {
        const limit = parseInt(req.query.limit) || 20;
        logger.debug('Getting recent activity via API', { limit });
        try {
            const [recentSpecs, activityStats] = await Promise.all([
                this.getRecentSpecs(limit),
                this.getActivityStats()
            ]);
            res.json({
                success: true,
                data: {
                    recent_specs: recentSpecs,
                    activity_summary: activityStats
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger.error('Failed to get recent activity', error);
            throw error;
        }
    }
    /**
     * Get WebSocket client information
     */
    async getWebSocketStatus(req, res) {
        logger.debug('Getting WebSocket status via API');
        const wsStatus = {
            connected_clients: websocketHandler.getConnectedClientsCount(),
            clients_details: websocketHandler.getClientsStatus()
        };
        res.json({
            success: true,
            data: wsStatus,
            timestamp: new Date().toISOString()
        });
    }
    /**
     * Helper: Get recent specifications
     */
    async getRecentSpecs(limit) {
        const result = await this.specService.listSpecs({
            limit,
            offset: 0,
            sortBy: 'updated_at',
            sortOrder: 'DESC'
        });
        return result.specs.map(spec => ({
            id: spec.id,
            title: spec.title,
            status: spec.status,
            version: spec.version,
            created_at: spec.createdAt.toISOString(),
            updated_at: spec.updatedAt.toISOString()
        }));
    }
    /**
     * Helper: Get activity statistics
     */
    async getActivityStats() {
        try {
            // Get specs created/updated in the last 24 hours
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            // Get specs created/updated in the last week
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            // Note: This is a simplified implementation
            // In a real application, you might want to track activity logs
            const [allSpecs, recentSpecs] = await Promise.all([
                this.specService.listSpecs({ limit: 1000, offset: 0 }),
                this.specService.listSpecs({ limit: 100, offset: 0, sortBy: 'updated_at', sortOrder: 'DESC' })
            ]);
            // Count specs by time periods
            const now = new Date();
            let dailyActivity = 0;
            let weeklyActivity = 0;
            recentSpecs.specs.forEach(spec => {
                const updatedAt = new Date(spec.updatedAt);
                if (updatedAt > oneDayAgo) {
                    dailyActivity++;
                }
                if (updatedAt > oneWeekAgo) {
                    weeklyActivity++;
                }
            });
            return {
                specs_updated_today: dailyActivity,
                specs_updated_this_week: weeklyActivity,
                total_activity_score: dailyActivity + (weeklyActivity * 0.1) // Simple scoring
            };
        }
        catch (error) {
            logger.error('Failed to calculate activity stats', error);
            return {
                specs_updated_today: 0,
                specs_updated_this_week: 0,
                total_activity_score: 0
            };
        }
    }
}
//# sourceMappingURL=dashboard.controller.js.map