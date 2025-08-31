#!/usr/bin/env node

/**
 * Simple MCP server test script
 */

import { createMCPServer } from '../dist/mcp/server.js';
import { initializeDatabase } from '../dist/database/data-source.js';
import { logger } from '../dist/services/logging.service.js';

async function main() {
  try {
    // Initialize database
    logger.info('Initializing database...');
    await initializeDatabase('./specgen.sqlite');
    logger.info('Database initialized successfully');

    // Create and start MCP server
    logger.info('Starting MCP server...');
    const mcpServer = createMCPServer();
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      logger.info('Shutting down...');
      await mcpServer.close();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main();