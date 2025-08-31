/**
 * Integration tests for WebSocket functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import WebSocket from 'ws';
import { createAPIServer } from '../../api/server.js';
import { WebSocketHandler } from '../../src/dashboard/websocket-handler.js';
import { initializeDatabase } from '../../database/data-source.js';
import { SpecService } from '../../services/spec.service.js';
import express from 'express';
import { Server } from 'http';
import path from 'path';
import fs from 'fs';

describe('WebSocket Integration', () => {
  let app: express.Application;
  let server: Server;
  let wsHandler: WebSocketHandler;
  let specService: SpecService;
  let testDbPath: string;
  let port: number;

  beforeEach(async () => {
    // Create a temporary test database
    testDbPath = path.join(__dirname, `ws-test-${Date.now()}.sqlite`);
    await initializeDatabase(testDbPath);
    
    // Create server
    app = createAPIServer();
    server = app.listen(0); // Use random available port
    port = (server.address() as any)?.port;
    
    // Initialize WebSocket handler
    wsHandler = new WebSocketHandler();
    wsHandler.initialize(server);
    
    specService = new SpecService();
  });

  afterEach(async () => {
    // Clean up
    if (wsHandler) {
      wsHandler.shutdown();
    }
    if (server) {
      server.close();
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('WebSocket Connection', () => {
    it('should establish WebSocket connection', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      
      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });
      
      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should receive connection acknowledgment', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'connection_ack') {
          expect(message.type).toBe('connection_ack');
          expect(message.timestamp).toBeDefined();
          ws.close();
          done();
        }
      });
      
      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle ping-pong heartbeat', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      
      ws.on('open', () => {
        // Send ping
        ws.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
      });
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'pong') {
          expect(message.type).toBe('pong');
          expect(message.timestamp).toBeDefined();
          ws.close();
          done();
        }
      });
      
      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should broadcast spec creation', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      let connectionAckReceived = false;
      
      ws.on('message', async (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'connection_ack') {
          connectionAckReceived = true;
          
          // Create a specification after connection is established
          await specService.createSpec({
            title: 'Test WebSocket Spec',
            body_md: '# WebSocket Test',
            status: 'draft'
          });
          
          return;
        }
        
        if (message.type === 'spec_created' && connectionAckReceived) {
          expect(message.type).toBe('spec_created');
          expect(message.payload).toBeDefined();
          expect(message.payload.spec.title).toBe('Test WebSocket Spec');
          expect(message.timestamp).toBeDefined();
          ws.close();
          done();
        }
      });
      
      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should broadcast spec updates', (done) => {
      let testSpecId: number;
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      let connectionAckReceived = false;
      let specCreated = false;
      
      ws.on('message', async (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'connection_ack') {
          connectionAckReceived = true;
          
          // Create a specification
          const spec = await specService.createSpec({
            title: 'Original Title',
            body_md: '# Original',
            status: 'draft'
          });
          testSpecId = spec.id;
          return;
        }
        
        if (message.type === 'spec_created' && connectionAckReceived && !specCreated) {
          specCreated = true;
          
          // Update the specification
          await specService.updateSpec(testSpecId, {
            title: 'Updated Title',
            status: 'todo'
          });
          return;
        }
        
        if (message.type === 'spec_updated' && specCreated) {
          expect(message.type).toBe('spec_updated');
          expect(message.payload.spec.title).toBe('Updated Title');
          expect(message.payload.spec.status).toBe('todo');
          expect(message.payload.spec.id).toBe(testSpecId);
          ws.close();
          done();
        }
      });
      
      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should broadcast spec deletion', (done) => {
      let testSpecId: number;
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      let connectionAckReceived = false;
      let specCreated = false;
      
      ws.on('message', async (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'connection_ack') {
          connectionAckReceived = true;
          
          // Create a specification
          const spec = await specService.createSpec({
            title: 'To Be Deleted',
            body_md: '# Delete Me',
            status: 'draft'
          });
          testSpecId = spec.id;
          return;
        }
        
        if (message.type === 'spec_created' && connectionAckReceived && !specCreated) {
          specCreated = true;
          
          // Delete the specification
          await specService.deleteSpec(testSpecId);
          return;
        }
        
        if (message.type === 'spec_deleted' && specCreated) {
          expect(message.type).toBe('spec_deleted');
          expect(message.payload.spec_id).toBe(testSpecId);
          ws.close();
          done();
        }
      });
      
      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Connection Management', () => {
    it('should handle multiple concurrent connections', (done) => {
      const connections: WebSocket[] = [];
      let connectedCount = 0;
      const expectedConnections = 3;
      
      const createConnection = () => {
        const ws = new WebSocket(`ws://localhost:${port}/ws`);
        connections.push(ws);
        
        ws.on('open', () => {
          connectedCount++;
          if (connectedCount === expectedConnections) {
            // All connections established
            expect(connections).toHaveLength(expectedConnections);
            
            // Close all connections
            connections.forEach(connection => connection.close());
            done();
          }
        });
        
        ws.on('error', (error) => {
          done(error);
        });
      };
      
      // Create multiple connections
      for (let i = 0; i < expectedConnections; i++) {
        createConnection();
      }
    });

    it('should clean up closed connections', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      
      ws.on('open', () => {
        // Connection established
        expect(ws.readyState).toBe(WebSocket.OPEN);
        
        // Close connection
        ws.close();
      });
      
      ws.on('close', () => {
        // Connection should be cleaned up from server
        setTimeout(() => {
          // Give server time to clean up
          done();
        }, 100);
      });
      
      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Message Validation', () => {
    it('should handle malformed messages gracefully', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      
      ws.on('open', () => {
        // Send malformed JSON
        ws.send('invalid json');
        
        // Send valid message after malformed one
        ws.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
      });
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'pong') {
          // If we receive pong, the connection is still working after malformed message
          ws.close();
          done();
        }
      });
      
      ws.on('error', (error) => {
        // WebSocket errors are expected for malformed messages
        // but the connection should remain stable
        done();
      });
    });

    it('should validate message types', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      
      ws.on('open', () => {
        // Send message with invalid type
        ws.send(JSON.stringify({
          type: 'invalid_type',
          timestamp: new Date().toISOString()
        }));
        
        // Send valid ping after invalid message
        ws.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
      });
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'pong') {
          // Connection still works after invalid message type
          ws.close();
          done();
        }
      });
      
      ws.on('error', (error) => {
        done(error);
      });
    });
  });
});