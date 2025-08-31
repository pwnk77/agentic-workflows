/**
 * Integration tests for IntegratedSpecGenServer
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { IntegratedSpecGenServer } from '../../src/integrated-server.js';
import { initializeDatabase } from '../../database/data-source.js';
import request from 'supertest';
import path from 'path';
import fs from 'fs';

// Mock the browser opening function
const mockSpawn = jest.fn();
jest.mock('child_process', () => ({
  spawn: mockSpawn
}));

describe('IntegratedSpecGenServer', () => {
  let server: IntegratedSpecGenServer;
  let testDbPath: string;

  beforeEach(async () => {
    testDbPath = path.join(__dirname, `integrated-test-${Date.now()}.sqlite`);
    server = new IntegratedSpecGenServer();
    
    // Clear mock calls
    mockSpawn.mockClear();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Dashboard Mode', () => {
    it('should start in dashboard mode', async () => {
      await server.start({
        mode: 'dashboard',
        port: 0, // Use random available port
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      expect(server.isInitialized()).toBe(true);
      expect(server.getStatus().mode).toBe('dashboard');
      expect(server.getStatus().httpServer).toBe('running');
      expect(server.getStatus().mcpServer).toBe('not-running');
    });

    it('should serve API endpoints in dashboard mode', async () => {
      await server.start({
        mode: 'dashboard',
        port: 0,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      const apiApp = server.getAPIApp();
      expect(apiApp).toBeDefined();

      // Test API endpoint
      const response = await request(apiApp!)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('SpecGen MCP Server API');
    });

    it('should auto-open browser when configured', async () => {
      await server.start({
        mode: 'dashboard',
        port: 3001,
        dbPath: testDbPath,
        autoOpenBrowser: true
      });

      // Check if spawn was called to open browser
      expect(mockSpawn).toHaveBeenCalled();
      const spawnArgs = mockSpawn.mock.calls[0];
      
      // Should contain the dashboard URL
      expect(spawnArgs[1]).toContain('http://localhost:3001/dashboard');
    });

    it('should not open browser when disabled', async () => {
      await server.start({
        mode: 'dashboard',
        port: 3001,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      expect(mockSpawn).not.toHaveBeenCalled();
    });
  });

  describe('MCP Mode', () => {
    it('should start in MCP-only mode', async () => {
      await server.start({
        mode: 'mcp',
        dbPath: testDbPath
      });

      expect(server.isInitialized()).toBe(true);
      expect(server.getStatus().mode).toBe('mcp');
      expect(server.getStatus().mcpServer).toBe('running');
      expect(server.getStatus().httpServer).toBe('not-running');
    });

    it('should not start HTTP server in MCP mode', async () => {
      await server.start({
        mode: 'mcp',
        dbPath: testDbPath
      });

      const apiApp = server.getAPIApp();
      expect(apiApp).toBeNull();
    });
  });

  describe('Integrated Mode', () => {
    it('should start both servers in integrated mode', async () => {
      await server.start({
        mode: 'integrated',
        port: 0,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      expect(server.isInitialized()).toBe(true);
      expect(server.getStatus().mode).toBe('integrated');
      expect(server.getStatus().mcpServer).toBe('running');
      expect(server.getStatus().httpServer).toBe('running');
    });

    it('should serve API and handle MCP in integrated mode', async () => {
      await server.start({
        mode: 'integrated',
        port: 0,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      // Test API functionality
      const apiApp = server.getAPIApp();
      expect(apiApp).toBeDefined();

      const response = await request(apiApp!)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });
  });

  describe('Configuration', () => {
    it('should use default configuration values', async () => {
      await server.start({
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      const status = server.getStatus();
      expect(status.mode).toBe('integrated'); // default mode
    });

    it('should use custom port configuration', async () => {
      const customPort = 4567;
      
      await server.start({
        mode: 'dashboard',
        port: customPort,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      const status = server.getStatus();
      expect(status.port).toBe(customPort);
    });

    it('should handle database path configuration', async () => {
      const customDbPath = path.join(__dirname, 'custom-test.sqlite');
      
      await server.start({
        mode: 'dashboard',
        port: 0,
        dbPath: customDbPath,
        autoOpenBrowser: false
      });

      expect(fs.existsSync(customDbPath)).toBe(true);
      
      // Clean up custom database
      if (fs.existsSync(customDbPath)) {
        fs.unlinkSync(customDbPath);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle port already in use', async () => {
      // Start first server on specific port
      const port = 9876;
      const firstServer = new IntegratedSpecGenServer();
      
      await firstServer.start({
        mode: 'dashboard',
        port: port,
        dbPath: testDbPath + '1',
        autoOpenBrowser: false
      });

      try {
        // Try to start second server on same port
        await expect(server.start({
          mode: 'dashboard',
          port: port,
          dbPath: testDbPath + '2',
          autoOpenBrowser: false
        })).rejects.toThrow();
      } finally {
        await firstServer.stop();
      }
    });

    it('should prevent multiple start calls', async () => {
      await server.start({
        mode: 'dashboard',
        port: 0,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      // Second start call should be ignored
      await server.start({
        mode: 'dashboard',
        port: 0,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      expect(server.isInitialized()).toBe(true);
    });

    it('should handle invalid database path', async () => {
      const invalidDbPath = '/invalid/path/to/database.sqlite';
      
      await expect(server.start({
        mode: 'dashboard',
        port: 0,
        dbPath: invalidDbPath,
        autoOpenBrowser: false
      })).rejects.toThrow();
    });
  });

  describe('Lifecycle Management', () => {
    it('should properly stop all services', async () => {
      await server.start({
        mode: 'integrated',
        port: 0,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      expect(server.isInitialized()).toBe(true);

      await server.stop();

      const status = server.getStatus();
      expect(status.mcpServer).toBe('stopped');
      expect(status.httpServer).toBe('stopped');
    });

    it('should handle graceful shutdown', async () => {
      await server.start({
        mode: 'dashboard',
        port: 0,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      const apiApp = server.getAPIApp();
      
      // Make a request during operation
      const requestPromise = request(apiApp!)
        .get('/health')
        .expect(200);

      // Wait for request to complete
      await requestPromise;

      // Then stop server
      await server.stop();

      expect(server.isInitialized()).toBe(false);
    });
  });

  describe('Status Reporting', () => {
    it('should report correct status before initialization', () => {
      const status = server.getStatus();
      
      expect(status.initialized).toBe(false);
      expect(status.mode).toBeUndefined();
      expect(status.mcpServer).toBe('not-running');
      expect(status.httpServer).toBe('not-running');
    });

    it('should report correct status after initialization', async () => {
      await server.start({
        mode: 'integrated',
        port: 0,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      const status = server.getStatus();
      
      expect(status.initialized).toBe(true);
      expect(status.mode).toBe('integrated');
      expect(status.mcpServer).toBe('running');
      expect(status.httpServer).toBe('running');
      expect(status.port).toBeDefined();
      expect(status.startTime).toBeInstanceOf(Date);
    });

    it('should report correct status after stop', async () => {
      await server.start({
        mode: 'dashboard',
        port: 0,
        dbPath: testDbPath,
        autoOpenBrowser: false
      });

      await server.stop();

      const status = server.getStatus();
      
      expect(status.initialized).toBe(false);
      expect(status.mcpServer).toBe('stopped');
      expect(status.httpServer).toBe('stopped');
    });
  });
});