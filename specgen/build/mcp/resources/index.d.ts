/**
 * MCP resources exports and instances
 */
import { SpecResourceHandler } from './spec-resource.js';
import { DashboardResourceHandler } from './dashboard-resource.js';
export declare const specResources: SpecResourceHandler;
export declare const dashboardResourceHandler: DashboardResourceHandler;
export declare const dashboardResource: {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
    read: () => Promise<{
        contents: Array<{
            uri: string;
            mimeType?: string;
            text?: string;
        }>;
    }>;
};
//# sourceMappingURL=index.d.ts.map