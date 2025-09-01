import { SpecStatus } from '../parsers/spec-parser';
export declare class SpecService {
    static createSpec(data: CreateSpecData): Spec;
    static updateSpec(spec_id: number, updates: UpdateSpecData): Spec | null;
    static getSpecById(spec_id: number): Spec | null;
    static deleteSpec(spec_id: number): boolean;
    static listSpecs(options?: ListSpecsOptions): SpecListResult;
    static searchSpecs(query: string, options?: SearchOptions): SpecSearchResult;
    static getStats(include_details?: boolean): SpecStats;
    private static autoDetectGroup;
    private static autoDetectTheme;
}
export interface Spec {
    id: number;
    title: string;
    body_md: string;
    status: SpecStatus;
    feature_group: string;
    theme_category?: string;
    priority?: string;
    related_specs?: string;
    parent_spec_id?: number;
    created_via?: string;
    last_command?: string;
    created_at: string;
    updated_at: string;
}
export interface CreateSpecData {
    title: string;
    body_md: string;
    status?: SpecStatus;
    feature_group?: string;
    theme_category?: string;
    priority?: string;
    related_specs?: number[];
    parent_spec_id?: number;
    created_via?: string;
}
export interface UpdateSpecData {
    title?: string;
    body_md?: string;
    status?: SpecStatus;
    feature_group?: string;
    theme_category?: string;
    priority?: string;
    related_specs?: string;
    parent_spec_id?: number;
    last_command?: string;
}
export interface ListSpecsOptions {
    status?: SpecStatus;
    feature_group?: string;
    theme_category?: string;
    priority?: string;
    created_via?: string;
    sort_by?: 'id' | 'title' | 'created_at' | 'updated_at' | 'priority';
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
export interface SearchOptions {
    limit?: number;
    offset?: number;
    min_score?: number;
}
export interface SpecListResult {
    specs: Spec[];
    pagination: {
        offset: number;
        limit: number;
        total: number;
        has_more: boolean;
    };
}
export interface SpecSearchResult {
    query: string;
    results: Array<Spec & {
        score: number;
    }>;
    pagination: {
        offset: number;
        limit: number;
        total: number;
        has_more: boolean;
    };
}
export interface SpecStats {
    total_specs: number;
    by_status: Record<string, number>;
    by_group: Record<string, number>;
    recent_activity?: number;
    latest_specs?: Array<{
        id: number;
        title: string;
        status: string;
        feature_group: string;
        created_at: string;
    }>;
}
//# sourceMappingURL=spec.service.d.ts.map