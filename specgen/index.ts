#!/usr/bin/env node

/**
 * SpecGen MCP Server - Main entry point
 * TypeScript-based MCP server for SPEC file management with SQLite backend
 */

import { createCLI } from './cli/index.js';

async function main(): Promise<void> {
  const cli = createCLI();
  await cli.parseAsync();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Application Error:', error.message);
    process.exit(1);
  });
}