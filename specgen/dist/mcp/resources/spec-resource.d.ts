export declare class SpecResourceHandler {
    static getSpecUri(specId: number): string;
    static listSpecResources(): Promise<Array<{
        uri: string;
        name: string;
        description: string;
        mimeType: string;
    }>>;
    static readSpecResource(uri: string): Promise<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}
export declare class ProjectResourceHandler {
    static listProjectResources(): Promise<Array<{
        uri: string;
        name: string;
        description: string;
        mimeType: string;
    }>>;
    static readProjectResource(uri: string): Promise<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
    private static generateProjectSummary;
}
export declare class SpecGenResourceHandler {
    static listAllResources(): Promise<Array<{
        uri: string;
        name: string;
        description: string;
        mimeType: string;
    }>>;
    static readResource(uri: string): Promise<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}
//# sourceMappingURL=spec-resource.d.ts.map