/**
 * Dashboard routes for serving HTML interface
 */
import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { asyncHandler } from '../middleware/async-handler.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../../../public');
export const dashboardRouter = Router();
// GET /dashboard - Serve HTML dashboard
dashboardRouter.get('/', asyncHandler(async (req, res) => {
    const dashboardPath = join(publicDir, 'dashboard.html');
    if (!existsSync(dashboardPath)) {
        return res.status(404).json({
            success: false,
            error: 'Dashboard not found',
            message: 'The dashboard HTML file was not found. Please ensure it exists at public/dashboard.html',
            timestamp: new Date().toISOString()
        });
    }
    try {
        const htmlContent = readFileSync(dashboardPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(htmlContent);
        return;
    }
    catch (error) {
        console.error('Failed to read dashboard file:', error);
        res.status(500).json({
            success: false,
            error: 'File read error',
            message: 'Failed to read dashboard HTML file',
            timestamp: new Date().toISOString()
        });
        return;
    }
}));
//# sourceMappingURL=dashboard.js.map