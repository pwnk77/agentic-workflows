/**
 * Zod validation schemas for MCP tools
 */
import { z } from 'zod';
export declare const specIdSchema: z.ZodNumber;
export declare const specStatusSchema: z.ZodEnum<["draft", "todo", "in-progress", "done"]>;
export declare const createSpecToolSchema: z.ZodObject<{
    title: z.ZodString;
    body_md: z.ZodString;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["draft", "todo", "in-progress", "done"]>>>;
}, "strip", z.ZodTypeAny, {
    status: "in-progress" | "draft" | "todo" | "done";
    title: string;
    body_md: string;
}, {
    title: string;
    body_md: string;
    status?: "in-progress" | "draft" | "todo" | "done" | undefined;
}>;
export declare const updateSpecToolSchema: z.ZodEffects<z.ZodObject<{
    spec_id: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    body_md: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["draft", "todo", "in-progress", "done"]>>;
}, "strip", z.ZodTypeAny, {
    spec_id: number;
    status?: "in-progress" | "draft" | "todo" | "done" | undefined;
    title?: string | undefined;
    body_md?: string | undefined;
}, {
    spec_id: number;
    status?: "in-progress" | "draft" | "todo" | "done" | undefined;
    title?: string | undefined;
    body_md?: string | undefined;
}>, {
    spec_id: number;
    status?: "in-progress" | "draft" | "todo" | "done" | undefined;
    title?: string | undefined;
    body_md?: string | undefined;
}, {
    spec_id: number;
    status?: "in-progress" | "draft" | "todo" | "done" | undefined;
    title?: string | undefined;
    body_md?: string | undefined;
}>;
export declare const listSpecsToolSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<["draft", "todo", "in-progress", "done"]>>;
    sort_by: z.ZodDefault<z.ZodOptional<z.ZodEnum<["id", "title", "created_at", "updated_at"]>>>;
    sort_order: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    sort_by: "id" | "created_at" | "title" | "updated_at";
    sort_order: "asc" | "desc";
    status?: "in-progress" | "draft" | "todo" | "done" | undefined;
}, {
    status?: "in-progress" | "draft" | "todo" | "done" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    sort_by?: "id" | "created_at" | "title" | "updated_at" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export declare const getSpecToolSchema: z.ZodObject<{
    spec_id: z.ZodNumber;
    include_relations: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    spec_id: number;
    include_relations: boolean;
}, {
    spec_id: number;
    include_relations?: boolean | undefined;
}>;
export declare const deleteSpecToolSchema: z.ZodObject<{
    spec_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    spec_id: number;
}, {
    spec_id: number;
}>;
export declare const searchSpecsToolSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    min_score: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit: number;
    offset: number;
    min_score: number;
}, {
    query: string;
    limit?: number | undefined;
    offset?: number | undefined;
    min_score?: number | undefined;
}>;
export declare const getSpecStatsToolSchema: z.ZodObject<{
    include_details: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    include_details: boolean;
}, {
    include_details?: boolean | undefined;
}>;
export type CreateSpecToolInput = z.infer<typeof createSpecToolSchema>;
export type UpdateSpecToolInput = z.infer<typeof updateSpecToolSchema>;
export type ListSpecsToolInput = z.infer<typeof listSpecsToolSchema>;
export type GetSpecToolInput = z.infer<typeof getSpecToolSchema>;
export type DeleteSpecToolInput = z.infer<typeof deleteSpecToolSchema>;
export type SearchSpecsToolInput = z.infer<typeof searchSpecsToolSchema>;
export type GetSpecStatsToolInput = z.infer<typeof getSpecStatsToolSchema>;
//# sourceMappingURL=tool-schemas.d.ts.map