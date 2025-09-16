import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { CONFIG } from '../../core/config.js';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface LaunchDashboardArgs {
  port?: number;
}

export async function launchDashboard(args: LaunchDashboardArgs = {}): Promise<CallToolResult> {
  const { port = 4567 } = args;

  try {
    // Check if server.js exists with fallback paths
    let serverPath = path.join(CONFIG.dashboardPath, 'server.js');
    let dashboardPath = CONFIG.dashboardPath;

    try {
      await fs.access(serverPath);
    } catch {
      // Fallback: Try alternative paths if primary fails
      const fallbackPaths = [
        path.resolve(process.cwd(), '..', '..', 'specgen-mcp', 'specdash'), // Current implementation path
        path.resolve(process.cwd(), '.specgen/specdash'), // Local .specgen/specdash
        path.resolve(__dirname, '..', '..', 'specdash'), // Adjacent specdash
      ];

      let found = false;
      for (const fallbackPath of fallbackPaths) {
        const fallbackServer = path.join(fallbackPath, 'server.js');
        try {
          await fs.access(fallbackServer);
          serverPath = fallbackServer;
          dashboardPath = fallbackPath;
          found = true;
          break;
        } catch {
          continue;
        }
      }

      if (!found) {
        throw new Error(`server.js not found at ${CONFIG.dashboardPath} or fallback locations: ${fallbackPaths.join(', ')}`);
      }
    }

    // Check if port is already in use
    const http = await import('http');
    const isPortInUse = await new Promise((resolve) => {
      const testServer = http.createServer();
      testServer.once('error', () => resolve(true));
      testServer.once('listening', () => {
        testServer.close();
        resolve(false);
      });
      testServer.listen(port);
    });

    if (isPortInUse) {
      return {
        content: [{
          type: "text",
          text: `⚠️ Port ${port} is already in use. Dashboard may already be running at http://localhost:${port}`
        }],
        isError: false
      };
    }

    // Start dashboard server
    const serverProcess = spawn('node', [serverPath], {
      cwd: dashboardPath,
      env: {
        ...process.env,
        PORT: port.toString(),
        DOCS_PATH: CONFIG.docsPath // Pass the correct project docs path
      },
      detached: false,
      stdio: 'ignore'
    });

    // Handle process errors
    serverProcess.on('error', (error) => {
      console.error('Failed to start dashboard:', error);
    });

    // Wait for server to start with basic health verification
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Basic health check - try to verify server is responding
    const dashboardUrl = `http://localhost:${port}`;
    let healthCheckPassed = false;

    try {
      // Simple health verification - if we can fetch, server is likely up
      const http = await import('http');
      const healthPromise = new Promise((resolve) => {
        const req = http.request(`http://localhost:${port}`, { method: 'GET' }, (res) => {
          resolve(res.statusCode === 200 || res.statusCode === 404); // 404 is OK, means server is up
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => {
          req.destroy();
          resolve(false);
        });
        req.end();
      });

      healthCheckPassed = await healthPromise as boolean;
    } catch (healthError) {
      // Health check failed, but server might still be starting
      console.error('Health check failed:', healthError);
    }

    // Format as proper MCP CallToolResult
    const responseText = `🚀 Dashboard launched successfully!

📡 Server Details:
• URL: ${dashboardUrl}
• Process ID: ${serverProcess.pid}
• Health Check: ${healthCheckPassed ? '✅ Passed' : '⚠️ Failed'}
• Status: Running in background

💡 The dashboard uses shared JSON metadata and will show all discovered specs.`;

    return {
      content: [{
        type: "text",
        text: responseText
      }],
      isError: false
    };
  } catch (error) {
    // Format error as proper MCP CallToolResult
    const errorText = `❌ Failed to launch dashboard server

🔍 Error Details:
• Error: ${String(error)}
• Dashboard Path: ${CONFIG.dashboardPath}
• Port: ${port}

💡 Please check that the dashboard directory exists and node server.js can be executed.`;

    return {
      content: [{
        type: "text",
        text: errorText
      }],
      isError: true
    };
  }
}