export interface Spec {
    id: number;
    title: string;
    body_md: string;
    status: 'draft' | 'todo' | 'in-progress' | 'done';
    version: number;
    created_at: string;
    updated_at: string;
    todos?: Todo[];
}
export interface Todo {
    id: number;
    spec_id: number;
    step_no?: number;
    text?: string;
    status: 'pending' | 'in-progress' | 'completed';
}
export interface SearchResult {
    id: number;
    title: string;
    status: string;
    score: number;
    snippet: string;
    created_at: string;
    updated_at: string;
}
export interface DashboardStats {
    overview: {
        total_specs: number;
        specs_by_status: Record<string, number>;
        search_documents: number;
        avg_document_length: number;
        index_size_bytes: number;
    };
    recent_activity: {
        recent_specs: Spec[];
        activity_summary: {
            specs_updated_today: number;
            specs_updated_this_week: number;
            total_activity_score: number;
        };
    };
    system_status: {
        websocket: {
            connected_clients: number;
        };
        search_healthy: boolean;
    };
}
export interface WSMessage {
    type: 'spec_updated' | 'spec_created' | 'spec_deleted' | 'spec_status_changed' | 'stats_updated' | 'connection_ack' | 'ping' | 'pong';
    payload?: any;
    timestamp?: string;
}
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}
export interface PaginationInfo {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
}
export interface ListResponse<T> extends APIResponse<{
    specs?: T[];
    results?: T[];
    pagination?: PaginationInfo;
    search_time_ms?: number;
}> {
}
//# sourceMappingURL=index.d.ts.map