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

export class SpecNotFoundError extends Error {
  constructor(id: number) {
    super(`Specification with ID ${id} not found`);
    this.name = 'SpecNotFoundError';
  }
}

export class SpecValidationError extends Error {
  public errors: SpecValidationErrorItem[];

  constructor(errors: SpecValidationErrorItem[]) {
    super(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    this.name = 'SpecValidationError';
    this.errors = errors;
  }
}