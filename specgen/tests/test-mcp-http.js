#!/usr/bin/env node

/**
 * Test MCP HTTP Protocol Communication
 */

async function testMCPConnection() {
  try {
    console.log('Testing MCP server connection...');
    
    // Test 1: Health check
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Initialize request
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };
    
    console.log('Sending initialize request...');
    const mcpResponse = await fetch('http://localhost:3001/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'MCP-Protocol-Version': '2024-11-05'
      },
      body: JSON.stringify(initRequest)
    });
    
    console.log('Response status:', mcpResponse.status);
    console.log('Response headers:', Object.fromEntries(mcpResponse.headers.entries()));
    
    if (mcpResponse.ok) {
      const text = await mcpResponse.text();
      console.log('✅ MCP Response:', text);
      
      try {
        const mcpData = JSON.parse(text);
        console.log('✅ Parsed response:', JSON.stringify(mcpData, null, 2));
      } catch (e) {
        console.log('Response is not JSON:', text);
      }
    } else {
      const errorText = await mcpResponse.text();
      console.log('❌ MCP request failed:', mcpResponse.status, mcpResponse.statusText);
      console.log('Error body:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testMCPConnection();