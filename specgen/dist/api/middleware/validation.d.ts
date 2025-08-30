/**
 * Request validation middleware using Zod
 */
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export interface ValidationSchemas {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
}
export declare function validate(schemas: ValidationSchemas): (req: Request, res: Response, next: NextFunction) => void;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const paginationQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const sortQuerySchema: z.ZodObject<{
    sort_by: z.ZodDefault<z.ZodOptional<z.ZodEnum<["id", "title", "created_at", "updated_at"]>>>;
    sort_order: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    sort_by: "id" | "created_at" | "title" | "updated_at";
    sort_order: "asc" | "desc";
}, {
    sort_by?: "id" | "created_at" | "title" | "updated_at" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map