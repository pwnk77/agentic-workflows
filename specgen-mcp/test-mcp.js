#!/usr/bin/env node

import { spawn } from 'child_process';

function testMCPTool(toolName, params = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let initialized = false;

    child.stdout.on('data', (data) => {
      output += data.toString();
      
      if (!initialized) {
        // Send initialize request
        const initReq = {
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: { roots: { listChanged: true } },
            clientInfo: { name: "test-client", version: "1.0.0" }
          }
        };
        child.stdin.write(JSON.stringify(initReq) + '\n');
        
        // Send tool call request
        const toolReq = {
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: {
            name: toolName,
            arguments: params
          }
        };
        child.stdin.write(JSON.stringify(toolReq) + '\n');
        child.stdin.end();
        initialized = true;
      }
    });

    child.stderr.on('data', (data) => {
      console.error('STDERR:', data.toString());
    });

    child.on('close', (code) => {
      try {
        // Parse JSON responses
        const lines = output.split('\n').filter(line => line.trim());
        const responses = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return { error: 'Parse error', raw: line };
          }
        });
        resolve(responses);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Test refresh_metadata first
console.log('Testing refresh_metadata...');
testMCPTool('refresh_metadata', { reason: 'Testing MCP implementation' })
  .then(responses => {
    console.log('refresh_metadata responses:', JSON.stringify(responses, null, 2));
  })
  .catch(console.error);