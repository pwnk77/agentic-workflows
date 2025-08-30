/**
 * MCP resource handler for HTML dashboard
 */
export declare class DashboardResourceHandler {
    private specService;
    private searchService;
    constructor();
    read(): Promise<{
        contents: Array<{
            uri: string;
            mimeType?: string;
            text?: string;
        }>;
    }>;
    private generateDashboardHTML;
    private escapeHtml;
}
//# sourceMappingURL=dashboard-resource.d.ts.map