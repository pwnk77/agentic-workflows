#!/usr/bin/env node

// Test script to verify MCP server can start
const path = require('path');
process.chdir('/Users/pawanraviee/Documents/specgen-test-demo');

async function testMCP() {
  try {
    console.log('Testing MCP server startup...');
    
    // Import the startMCPServer function
    const serverModule = require('./dist/mcp/server.js');
    console.log('Server module loaded successfully');
    
    // Try to start the server
    await serverModule.startMCPServer();
  } catch (error) {
    console.error('MCP server test failed:', error);
    process.exit(1);
  }
}

testMCP();