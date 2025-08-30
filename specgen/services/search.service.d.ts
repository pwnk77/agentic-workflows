/**
 * Full-text search service using SQLite FTS5
 */
import { SearchQuery, SearchResponse, SearchSuggestion, FTSStats } from '../types/search.types.js';
export declare class SearchService {
    private settings;
    constructor();
    searchSpecs(query: SearchQuery): Promise<SearchResponse>;
    suggestTerms(partialQuery: string, limit?: number): Promise<SearchSuggestion[]>;
    getSearchStats(): Promise<FTSStats>;
    optimizeIndex(): Promise<void>;
    private prepareFTSQuery;
    validateFTSIntegrity(): Promise<boolean>;
}
