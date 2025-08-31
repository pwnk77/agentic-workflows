/**
 * Dashboard controller for overview statistics and metrics
 */
import { Request, Response } from 'express';
export declare class DashboardController {
    private specService;
    private searchService;
    constructor();
    /**
     * Get comprehensive dashboard statistics
     */
    getDashboardStats(req: Request, res: Response): Promise<void>;
    /**
     * Get system health status
     */
    getSystemHealth(req: Request, res: Response): Promise<void>;
    /**
     * Get recent activity summary
     */
    getRecentActivity(req: Request, res: Response): Promise<void>;
    /**
     * Get WebSocket client information
     */
    getWebSocketStatus(req: Request, res: Response): Promise<void>;
    /**
     * Helper: Get recent specifications
     */
    private getRecentSpecs;
    /**
     * Helper: Get activity statistics
     */
    private getActivityStats;
}
//# sourceMappingURL=dashboard.controller.d.ts.map