/**
 * MCP server type definitions
 */
export interface MCPServerConfig {
    name: string;
    version: string;
    maxTools: number;
    maxResources: number;
}
export interface MCPToolResult {
    content: Array<{
        type: 'text' | 'image';
        text?: string;
        data?: string;
        mimeType?: string;
    }>;
    isError?: boolean;
}
export interface MCPResourceContent {
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: Uint8Array;
}
//# sourceMappingURL=types.d.ts.map