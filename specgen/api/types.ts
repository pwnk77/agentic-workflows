/**
 * API type definitions
 */

import { Request, Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export interface SortQuery {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export type ApiRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = Request<P, ResBody, ReqBody, ReqQuery>;

export type ApiResponseObject = Response;