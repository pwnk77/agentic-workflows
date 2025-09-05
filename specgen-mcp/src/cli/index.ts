#!/usr/bin/env node

import { program } from 'commander';
import { createInitCommand } from './commands/init.js';
import { createStatusCommand } from './commands/status.js';

// Main CLI program
program
  .name('specgen')
  .description('SpecGen - Project-scoped specification management for Claude Code')
  .version('1.0.0');

// Add commands
program.addCommand(createInitCommand());
program.addCommand(createStatusCommand());

// Global error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();