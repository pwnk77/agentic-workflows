/**
 * Application settings and configuration
 */

import { getEnvironment } from './environment.js';

export interface DatabaseConfig {
  path: string;
  walMode: boolean;
  memoryMapping: boolean;
  connectionTimeout: number;
  queryTimeout: number;
}

export interface ServerConfig {
  port: number;
  apiPrefix: string;
  enableCors: boolean;
  maxRequestSize: string;
}

export interface MCPConfig {
  serverName: string;
  serverVersion: string;
  maxTools: number;
  maxResources: number;
}

export interface SearchConfig {
  resultsLimit: number;
  maxQueryLength: number;
  enableFuzzySearch: boolean;
}

export interface LoggingConfig {
  level: string;
  enableConsole: boolean;
  enableFile: boolean;
  maxFileSize: number;
  maxFiles: number;
}

export interface AppSettings {
  database: DatabaseConfig;
  server: ServerConfig;
  mcp: MCPConfig;
  search: SearchConfig;
  logging: LoggingConfig;
  maxSpecSize: number;
}

export function getAppSettings(): AppSettings {
  const env = getEnvironment();

  return {
    database: {
      path: env.DATABASE_PATH,
      walMode: env.DATABASE_WAL_MODE,
      memoryMapping: env.DATABASE_MEMORY_MAPPING,
      connectionTimeout: 30000,
      queryTimeout: 10000
    },
    server: {
      port: env.PORT,
      apiPrefix: env.API_PREFIX,
      enableCors: env.ENABLE_CORS,
      maxRequestSize: '10mb'
    },
    mcp: {
      serverName: env.MCP_SERVER_NAME,
      serverVersion: '1.0.0',
      maxTools: 10,
      maxResources: 1000
    },
    search: {
      resultsLimit: env.SEARCH_RESULTS_LIMIT,
      maxQueryLength: 1000,
      enableFuzzySearch: true
    },
    logging: {
      level: env.LOG_LEVEL,
      enableConsole: true,
      enableFile: !env.NODE_ENV || env.NODE_ENV === 'development',
      maxFileSize: 5242880, // 5MB
      maxFiles: 5
    },
    maxSpecSize: env.MAX_SPEC_SIZE
  };
}