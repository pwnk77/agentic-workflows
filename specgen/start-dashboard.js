#!/usr/bin/env node

/**
 * Start the SpecGen dashboard directly
 */

import { IntegratedSpecGenServer } from './build/src/integrated-server.js';

async function startDashboard() {
  console.log('🚀 Starting SpecGen Dashboard...\n');

  try {
    const server = new IntegratedSpecGenServer();
    
    // Start server in dashboard mode
    const port = process.argv.includes('--port') ? 
      parseInt(process.argv[process.argv.indexOf('--port') + 1]) : 3001;
    
    await server.start({
      mode: 'dashboard',
      port: port,
      autoOpenBrowser: true
    });
    
    console.log(`✅ SpecGen Dashboard running at: http://localhost:${port}/dashboard`);
    console.log('Press Ctrl+C to stop\n');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down dashboard...');
      await server.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start dashboard:', error.message);
    process.exit(1);
  }
}

startDashboard().catch(console.error);