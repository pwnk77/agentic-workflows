/**
 * Integrated server architecture combining MCP stdio and Express HTTP servers
 * Implements the dual-server pattern for dashboard functionality
 */

import express from 'express';
import { Server as HttpServer } from 'http';
import { MCPServerManager } from '../mcp/server.js';
import { createAPIServer } from '../api/server.js';
import { initializeDatabase } from '../database/data-source.js';
import { getAppSettings } from '../config/settings.js';
import { logger } from '../services/logging.service.js';
import { websocketHandler } from './dashboard/websocket-handler.js';

export type ServerMode = 'mcp' | 'dashboard' | 'integrated';

export interface IntegratedServerOptions {
  mode?: ServerMode;
  port?: number;
  dbPath?: string;
  autoOpenBrowser?: boolean;
}

/**
 * Integrated SpecGen Server managing both MCP stdio and HTTP web servers
 */
export class IntegratedSpecGenServer {
  private mcpServer: MCPServerManager | null = null;
  private httpServer: HttpServer | null = null;
  private apiApp: express.Application | null = null;
  private settings: ReturnType<typeof getAppSettings>;
  private initialized = false;

  constructor() {
    this.settings = getAppSettings();
  }

  /**
   * Start the integrated server in specified mode
   */
  async start(options: IntegratedServerOptions = {}): Promise<void> {
    const mode = options.mode || 'integrated';
    // Use dashboard port for dashboard mode, regular server port otherwise
    const defaultPort = mode === 'dashboard' ? this.settings.dashboard.defaultPort : this.settings.server.port;
    const port = options.port || defaultPort;
    const dbPath = options.dbPath || this.settings.database.path;
    // Use dashboard config for auto-open browser setting if not overridden
    const autoOpenBrowser = options.autoOpenBrowser ?? this.settings.dashboard.autoOpenBrowser;

    if (this.initialized) {
      logger.warn('Integrated server already initialized');
      return;
    }

    logger.info('Starting IntegratedSpecGenServer', {
      mode,
      port,
      dbPath,
      autoOpenBrowser
    });

    try {
      // Initialize database first - required for both modes
      logger.info('Initializing database...');
      await initializeDatabase(dbPath);
      logger.info('Database initialized successfully');

      // Start MCP server (unless dashboard-only mode)
      if (mode !== 'dashboard') {
        logger.info('Starting MCP stdio server...');
        this.mcpServer = new MCPServerManager();
        await this.mcpServer.start();
        logger.info('MCP stdio server started successfully');
      }

      // Start HTTP web server (unless MCP-only mode)
      if (mode !== 'mcp') {
        logger.info('Starting HTTP web server...');
        await this.startWebServer(port);
        logger.info(`HTTP web server started on port ${port}`);

        // Auto-open browser for dashboard mode
        if (autoOpenBrowser && mode === 'dashboard') {
          await this.openBrowserToDashboard(port);
        }
      }

      this.initialized = true;
      logger.info('IntegratedSpecGenServer started successfully', { mode, port });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start IntegratedSpecGenServer', error as Error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Start the Express HTTP web server
   */
  private async startWebServer(port: number): Promise<void> {
    this.apiApp = createAPIServer();
    
    return new Promise((resolve, reject) => {
      this.httpServer = this.apiApp!.listen(port, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          // Initialize WebSocket server after HTTP server is ready
          websocketHandler.initialize(this.httpServer!);
          resolve();
        }
      });

      this.httpServer.on('error', (error) => {
        logger.error('HTTP server error', error);
        reject(error);
      });
    });
  }

  /**
   * Open browser to dashboard (for dashboard mode)
   */
  private async openBrowserToDashboard(port: number): Promise<void> {
    const url = `http://localhost:${port}/dashboard`;
    logger.info(`Opening browser to dashboard: ${url}`);
    
    // Use platform-appropriate command to open browser
    const { spawn } = await import('child_process');
    const platform = process.platform;
    
    let command: string;
    let args: string[];
    
    if (platform === 'darwin') {
      command = 'open';
      args = [url];
    } else if (platform === 'win32') {
      command = 'start';
      args = ['', url];
    } else {
      command = 'xdg-open';
      args = [url];
    }
    
    const child = spawn(command, args, { 
      detached: true, 
      stdio: 'ignore' 
    });
    child.unref();
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));
  }

  /**
   * Stop the integrated server
   */
  async stop(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    logger.info('Stopping IntegratedSpecGenServer...');
    await this.cleanup();
    this.initialized = false;
    logger.info('IntegratedSpecGenServer stopped successfully');
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    const errors: Error[] = [];

    // Close WebSocket server first
    try {
      await websocketHandler.close();
      logger.info('WebSocket server closed');
    } catch (error) {
      errors.push(error as Error);
      logger.error('Error closing WebSocket server', error as Error);
    }

    // Close HTTP server
    if (this.httpServer) {
      try {
        await new Promise<void>((resolve, reject) => {
          this.httpServer!.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        this.httpServer = null;
        this.apiApp = null;
        logger.info('HTTP server closed');
      } catch (error) {
        errors.push(error as Error);
        logger.error('Error closing HTTP server', error as Error);
      }
    }

    // Close MCP server
    if (this.mcpServer) {
      try {
        await this.mcpServer.close();
        this.mcpServer = null;
        logger.info('MCP server closed');
      } catch (error) {
        errors.push(error as Error);
        logger.error('Error closing MCP server', error as Error);
      }
    }

    // Report cleanup errors if any
    if (errors.length > 0) {
      const errorMessage = `Cleanup completed with ${errors.length} errors`;
      logger.warn(errorMessage, { errors: errors.map(e => e.message) });
      throw new Error(errorMessage);
    }
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.initialized;
  }

  /**
   * Get server status
   */
  getStatus(): {
    running: boolean;
    mcpRunning: boolean;
    httpRunning: boolean;
    wsConnectedClients: number;
    port?: number;
  } {
    return {
      running: this.initialized,
      mcpRunning: this.mcpServer?.isRunning() || false,
      httpRunning: this.httpServer?.listening || false,
      wsConnectedClients: websocketHandler.getConnectedClientsCount(),
      port: this.httpServer?.listening ? 
        (this.httpServer.address() as any)?.port : undefined
    };
  }

  /**
   * Get configuration
   */
  getConfig(): ReturnType<typeof getAppSettings> {
    return { ...this.settings };
  }
}

/**
 * Factory function to create and start integrated server
 */
export async function createIntegratedServer(options: IntegratedServerOptions = {}): Promise<IntegratedSpecGenServer> {
  const server = new IntegratedSpecGenServer();
  await server.start(options);
  return server;
}