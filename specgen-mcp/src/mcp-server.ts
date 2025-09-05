#!/usr/bin/env node

import { startFileMCPServer } from './mcp/file-server.js';

// Start the MCP server
startFileMCPServer().catch((error: any) => {
  console.error('Failed to start SpecGen MCP Server:', error);
  process.exit(1);
});