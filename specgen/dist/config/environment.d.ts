/**
 * Environment configuration with Zod validation
 */
import { z } from 'zod';
declare const environmentSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_PATH: z.ZodDefault<z.ZodString>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
    MCP_SERVER_NAME: z.ZodDefault<z.ZodString>;
    API_PREFIX: z.ZodDefault<z.ZodString>;
    ENABLE_CORS: z.ZodDefault<z.ZodBoolean>;
    MAX_SPEC_SIZE: z.ZodDefault<z.ZodNumber>;
    DATABASE_WAL_MODE: z.ZodDefault<z.ZodBoolean>;
    DATABASE_MEMORY_MAPPING: z.ZodDefault<z.ZodBoolean>;
    SEARCH_RESULTS_LIMIT: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_PATH: string;
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    MCP_SERVER_NAME: string;
    API_PREFIX: string;
    ENABLE_CORS: boolean;
    MAX_SPEC_SIZE: number;
    DATABASE_WAL_MODE: boolean;
    DATABASE_MEMORY_MAPPING: boolean;
    SEARCH_RESULTS_LIMIT: number;
}, {
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: number | undefined;
    DATABASE_PATH?: string | undefined;
    LOG_LEVEL?: "error" | "warn" | "info" | "debug" | undefined;
    MCP_SERVER_NAME?: string | undefined;
    API_PREFIX?: string | undefined;
    ENABLE_CORS?: boolean | undefined;
    MAX_SPEC_SIZE?: number | undefined;
    DATABASE_WAL_MODE?: boolean | undefined;
    DATABASE_MEMORY_MAPPING?: boolean | undefined;
    SEARCH_RESULTS_LIMIT?: number | undefined;
}>;
export type Environment = z.infer<typeof environmentSchema>;
export declare function getEnvironment(): Environment;
export declare function isProduction(): boolean;
export declare function isDevelopment(): boolean;
export declare function isTest(): boolean;
export {};
//# sourceMappingURL=environment.d.ts.map