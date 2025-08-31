#!/usr/bin/env node

/**
 * Start dashboard server for testing
 */

import { IntegratedSpecGenServer } from './build/src/integrated-server.js';

console.log('🚀 Starting dashboard server for testing...');

const server = new IntegratedSpecGenServer();

await server.start({
  mode: 'dashboard',
  port: 3005,
  autoOpenBrowser: false
});

console.log('✅ Dashboard server started at http://localhost:3005/dashboard');
console.log('Press Ctrl+C to stop the server');

// Keep the server running
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down dashboard server...');
  await server.stop();
  console.log('✅ Server stopped');
  process.exit(0);
});