/**
 * Environment configuration with Zod validation
 */

import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_PATH: z.string().default('./specgen.sqlite'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  MCP_SERVER_NAME: z.string().default('specgen-mcp-server'),
  API_PREFIX: z.string().default('/api'),
  ENABLE_CORS: z.coerce.boolean().default(true),
  MAX_SPEC_SIZE: z.coerce.number().int().positive().default(1048576), // 1MB
  DATABASE_WAL_MODE: z.coerce.boolean().default(true),
  DATABASE_MEMORY_MAPPING: z.coerce.boolean().default(true),
  SEARCH_RESULTS_LIMIT: z.coerce.number().int().positive().default(50)
});

export type Environment = z.infer<typeof environmentSchema>;

let cachedEnv: Environment | undefined;

export function getEnvironment(): Environment {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = environmentSchema.safeParse(process.env);
  
  if (!result.success) {
    const formattedError = result.error.format();
    throw new Error(`Invalid environment configuration: ${JSON.stringify(formattedError, null, 2)}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function isProduction(): boolean {
  return getEnvironment().NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return getEnvironment().NODE_ENV === 'development';
}

export function isTest(): boolean {
  return getEnvironment().NODE_ENV === 'test';
}