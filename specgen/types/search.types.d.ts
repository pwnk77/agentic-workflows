/**
 * Search service type definitions
 */
export interface SearchQuery {
    query: string;
    limit?: number;
    offset?: number;
    minScore?: number;
}
export interface SearchResult {
    id: number;
    title: string;
    bodyMd: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    score: number;
    snippet?: string;
}
export interface SearchResponse {
    results: SearchResult[];
    total: number;
    query: string;
    limit: number;
    offset: number;
    hasMore: boolean;
    searchTime: number;
}
export interface SearchSuggestion {
    term: string;
    frequency: number;
}
export declare class SearchValidationError extends Error {
    constructor(message: string);
}
export interface FTSStats {
    totalDocuments: number;
    avgDocumentLength: number;
    indexSize: number;
    lastOptimized?: Date;
}
