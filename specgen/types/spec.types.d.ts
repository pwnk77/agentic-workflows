/**
 * Spec service type definitions
 */
import { SpecStatus } from '../entities/Spec.js';
export interface CreateSpecRequest {
    title: string;
    bodyMd: string;
    status?: SpecStatus;
}
export interface UpdateSpecRequest {
    title?: string;
    bodyMd?: string;
    status?: SpecStatus;
}
export interface ListSpecsQuery {
    limit?: number;
    offset?: number;
    status?: SpecStatus;
    sortBy?: 'id' | 'title' | 'created_at' | 'updated_at';
    sortOrder?: 'ASC' | 'DESC';
}
export interface SpecListResponse {
    specs: any[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}
export interface SpecValidationErrorItem {
    field: string;
    message: string;
    value?: any;
}
export declare class SpecNotFoundError extends Error {
    constructor(id: number);
}
export declare class SpecValidationError extends Error {
    errors: SpecValidationErrorItem[];
    constructor(errors: SpecValidationErrorItem[]);
}
