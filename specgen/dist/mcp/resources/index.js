/**
 * MCP resources exports and instances
 */
import { SpecResourceHandler } from './spec-resource.js';
import { DashboardResourceHandler } from './dashboard-resource.js';
// Create resource handler instances
export const specResources = new SpecResourceHandler();
export const dashboardResourceHandler = new DashboardResourceHandler();
// Dashboard resource definition for MCP server
export const dashboardResource = {
    uri: 'dashboard.html://index',
    name: 'SpecGen Dashboard',
    description: 'HTML dashboard showing specifications overview and statistics',
    mimeType: 'text/html',
    read: async () => dashboardResourceHandler.read()
};
//# sourceMappingURL=index.js.map