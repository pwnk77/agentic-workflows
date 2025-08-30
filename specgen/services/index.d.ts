/**
 * Service exports
 */
export { SpecService } from './spec.service.js';
export { SearchService } from './search.service.js';
export { logger } from './logging.service.js';
export type { CreateSpecRequest, UpdateSpecRequest, ListSpecsQuery, SpecListResponse } from '../types/spec.types.js';
export type { SearchQuery, SearchResult, SearchResponse, SearchSuggestion, FTSStats } from '../types/search.types.js';
export type { ExecutionLogData, IssueLogData, LogContext, LogLevel } from '../types/logging.types.js';
