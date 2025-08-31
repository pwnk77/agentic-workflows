#!/usr/bin/env node

/**
 * Test script to validate dashboard functionality
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDashboard() {
  console.log('🌐 Testing SpecGen Dashboard...\n');

  try {
    // Test 1: Check if dashboard build exists
    console.log('1. Checking dashboard build...');
    const dashboardBuildPath = path.join(__dirname, 'dashboard', 'build');
    
    try {
      const indexHtml = path.join(dashboardBuildPath, 'index.html');
      await fs.access(indexHtml);
      console.log('✅ Dashboard build exists');
      
      // Check build contents
      const htmlContent = await fs.readFile(indexHtml, 'utf8');
      if (htmlContent.includes('SpecGen Dashboard') || htmlContent.includes('root')) {
        console.log('✅ Dashboard HTML structure valid');
      } else {
        console.log('⚠️ Dashboard HTML might need verification');
      }
    } catch (error) {
      console.error('❌ Dashboard build not found. Run: cd dashboard && npm run build');
      throw error;
    }

    // Test 2: Test integrated server in dashboard mode
    console.log('\n2. Testing integrated server API...');
    
    try {
      const { IntegratedSpecGenServer } = await import('../build/src/integrated-server.js');
      const server = new IntegratedSpecGenServer();
      
      // Start server in dashboard mode on a test port
      const testPort = 3999; // Use a high port to avoid conflicts
      
      await server.start({
        mode: 'dashboard',
        port: testPort,
        autoOpenBrowser: false,
        dbPath: './test-dashboard.sqlite'
      });
      
      console.log('✅ Integrated server started successfully');
      
      // Test API endpoints
      const testApiEndpoint = async (path, expectedStatus = 200) => {
        try {
          const response = await fetch(`http://localhost:${testPort}${path}`);
          if (response.status === expectedStatus) {
            console.log(`✅ API ${path} responding (${response.status})`);
            return await response.json();
          } else {
            throw new Error(`Expected ${expectedStatus}, got ${response.status}`);
          }
        } catch (error) {
          console.error(`❌ API ${path} failed:`, error.message);
          throw error;
        }
      };

      // Test API root endpoint (uses API prefix)
      await testApiEndpoint('/api');
      
      // Test health endpoint
      await testApiEndpoint('/health');
      
      // Test specs endpoint
      await testApiEndpoint('/api/specs');
      
      // Test dashboard stats
      await testApiEndpoint('/dashboard/api/stats');

      console.log('✅ All API endpoints responding correctly');

      // Stop the server
      await server.stop();
      console.log('✅ Server stopped cleanly');
      
    } catch (error) {
      console.error('❌ Integrated server test failed:', error.message);
      throw error;
    }

    // Test 3: Test MCP tools
    console.log('\n3. Testing MCP tools...');
    
    try {
      const { specTools } = await import('../build/mcp/tools/spec-tools.js');
      
      console.log(`✅ Found ${specTools.length} MCP tools:`);
      specTools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
      
      // Test the launch_dashboard tool specifically
      const launchTool = specTools.find(tool => tool.name === 'launch_dashboard');
      if (launchTool) {
        console.log('✅ Launch dashboard tool available');
        console.log(`   Input schema: ${JSON.stringify(launchTool.inputSchema.properties, null, 2)}`);
      } else {
        throw new Error('Launch dashboard tool not found');
      }
      
    } catch (error) {
      console.error('❌ MCP tools test failed:', error.message);
      throw error;
    }

    console.log('\n🎉 All dashboard tests passed!\n');

    // Test summary
    console.log('📋 Dashboard Test Summary:');
    console.log('   ✅ Dashboard build exists');
    console.log('   ✅ Integrated server functionality');
    console.log('   ✅ API endpoints working');
    console.log('   ✅ MCP tools available');
    
    console.log('\n🚀 Dashboard is ready for use!');
    console.log('\n📝 Usage:');
    console.log('   1. Via MCP tool: launch_dashboard');
    console.log('   2. Direct command: node build/index.js --mode dashboard');
    console.log('   3. With custom port: node build/index.js --mode dashboard --port 3001');

  } catch (error) {
    console.error('\n❌ Dashboard test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure dashboard is built: cd dashboard && npm run build');
    console.error('   2. Check database permissions');
    console.error('   3. Verify port availability');
    process.exit(1);
  } finally {
    // Cleanup test database
    try {
      await fs.unlink('./test-dashboard.sqlite');
    } catch (error) {
      // File doesn't exist, that's fine
    }
  }
}

// Run the tests
testDashboard().catch(console.error);