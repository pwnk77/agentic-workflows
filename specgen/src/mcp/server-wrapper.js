#!/usr/bin/env node

// This wrapper handles the ES module import issue
async function startServer() {
  try {
    // Import the CommonJS compiled server
    const { startMCPServer } = require('./server.js');
    await startMCPServer();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();