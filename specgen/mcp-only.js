#!/usr/bin/env node

/**
 * MCP-only server launcher (no HTTP API)
 */

import { createMCPServer } from './dist/mcp/server.js';
import { initializeDatabase } from './dist/database/data-source.js';
import { logger } from './dist/services/logging.service.js';

async function main() {
  try {
    // Initialize database
    logger.info('Initializing database...');
    await initializeDatabase('./specgen.sqlite');
    logger.info('Database initialized successfully');

    // Create and start MCP server (stdio transport only)
    logger.info('Starting MCP server...');
    const mcpServer = createMCPServer();
    
    // Handle graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
        if (mcpServer) {
          await mcpServer.close?.();
          logger.info('MCP server closed');
        }
        logger.info('Shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
  } catch (error) {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main();