/**
 * MCP resource handlers for spec documents
 */
export declare class SpecResourceHandler {
    private specService;
    constructor();
    list(): Promise<Array<{
        uri: string;
        name?: string;
        description?: string;
        mimeType?: string;
    }>>;
    read(uri: string): Promise<{
        contents: Array<{
            uri: string;
            mimeType?: string;
            text?: string;
        }>;
    }>;
    private formatSpecAsMarkdown;
}
//# sourceMappingURL=spec-resource.d.ts.map