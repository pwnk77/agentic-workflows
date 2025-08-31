/**
 * WebSocket handler for real-time updates in dashboard
 */

import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../../services/logging.service.js';
import { getAppSettings } from '../../config/settings.js';
import { z } from 'zod';

// WebSocket message types
export type WSMessageType = 
  | 'spec_updated'
  | 'spec_created' 
  | 'spec_deleted'
  | 'spec_status_changed'
  | 'search_updated'
  | 'stats_updated'
  | 'connection_ack'
  | 'ping'
  | 'pong';

// WebSocket message schema
const wsMessageSchema = z.object({
  type: z.enum(['spec_updated', 'spec_created', 'spec_deleted', 'spec_status_changed', 'search_updated', 'stats_updated', 'connection_ack', 'ping', 'pong']),
  payload: z.any().optional(),
  timestamp: z.string().datetime().optional()
});

export interface WSMessage {
  type: WSMessageType;
  payload?: any;
  timestamp?: string;
}

export interface ConnectedClient {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  lastPing: Date;
  isAlive: boolean;
}

/**
 * WebSocket server for real-time dashboard updates
 */
export class WebSocketHandler {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, ConnectedClient>();
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionCounter = 0;
  private settings = getAppSettings();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HttpServer): void {
    logger.info('Initializing WebSocket server...');

    this.wss = new WebSocketServer({
      server: httpServer,
      path: '/ws',
      perMessageDeflate: {
        zlibDeflateOptions: {
          level: 3,
          windowBits: 13,
        },
        threshold: 1024,
      }
    });

    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      logger.error('WebSocket server error', error);
    });

    // Setup ping/pong heartbeat
    this.setupHeartbeat();

    logger.info('WebSocket server initialized successfully');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, request: any): void {
    // Check connection limit
    if (this.clients.size >= this.settings.websocket.maxConnections) {
      logger.warn('WebSocket connection limit reached', { 
        currentClients: this.clients.size, 
        maxConnections: this.settings.websocket.maxConnections 
      });
      ws.close(1013, 'Connection limit reached');
      return;
    }

    const clientId = this.generateClientId();
    const client: ConnectedClient = {
      id: clientId,
      ws,
      subscriptions: new Set(),
      lastPing: new Date(),
      isAlive: true
    };

    this.clients.set(clientId, client);

    logger.info('WebSocket client connected', { 
      clientId, 
      totalClients: this.clients.size,
      userAgent: request.headers['user-agent'],
      ip: request.connection.remoteAddress
    });

    // Send connection acknowledgment
    this.sendToClient(client, {
      type: 'connection_ack',
      payload: { clientId },
      timestamp: new Date().toISOString()
    });

    // Handle client messages
    ws.on('message', (data) => {
      this.handleMessage(client, data);
    });

    // Handle client disconnect
    ws.on('close', (code, reason) => {
      this.handleDisconnection(client, code, reason);
    });

    // Handle WebSocket errors
    ws.on('error', (error) => {
      logger.error('WebSocket client error', error, { clientId });
    });

    // Handle pong responses
    ws.on('pong', () => {
      client.isAlive = true;
      client.lastPing = new Date();
    });
  }

  /**
   * Handle incoming messages from clients
   */
  private handleMessage(client: ConnectedClient, data: any): void {
    try {
      const message = JSON.parse(data.toString());
      const validationResult = wsMessageSchema.safeParse(message);
      
      if (!validationResult.success) {
        logger.warn('Invalid WebSocket message received', { 
          clientId: client.id,
          errors: validationResult.error.errors 
        });
        return;
      }

      const wsMessage = validationResult.data as WSMessage;
      
      logger.debug('WebSocket message received', { 
        clientId: client.id,
        type: wsMessage.type 
      });

      // Handle different message types
      switch (wsMessage.type) {
        case 'ping':
          this.sendToClient(client, {
            type: 'pong',
            timestamp: new Date().toISOString()
          });
          break;
          
        default:
          logger.debug('Unhandled WebSocket message type', { 
            clientId: client.id,
            type: wsMessage.type 
          });
          break;
      }

    } catch (error) {
      logger.error('Error processing WebSocket message', error as Error, { 
        clientId: client.id 
      });
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(client: ConnectedClient, code: number, reason: Buffer): void {
    this.clients.delete(client.id);
    
    logger.info('WebSocket client disconnected', { 
      clientId: client.id,
      code,
      reason: reason.toString(),
      totalClients: this.clients.size
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: WSMessage): void {
    if (this.clients.size === 0) {
      return; // No clients to broadcast to
    }

    const messageData = JSON.stringify({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    });

    let successCount = 0;
    let errorCount = 0;

    this.clients.forEach((client) => {
      try {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(messageData);
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        logger.error('Error broadcasting to client', error as Error, { 
          clientId: client.id 
        });
        errorCount++;
      }
    });

    logger.debug('WebSocket broadcast completed', { 
      type: message.type,
      successCount,
      errorCount,
      totalClients: this.clients.size
    });
  }

  /**
   * Send message to specific client
   */
  private sendToClient(client: ConnectedClient, message: WSMessage): void {
    if (client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const messageData = JSON.stringify({
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      });

      client.ws.send(messageData);
    } catch (error) {
      logger.error('Error sending message to client', error as Error, { 
        clientId: client.id 
      });
    }
  }

  /**
   * Broadcast specification update
   */
  broadcastSpecUpdate(specId: number, spec: any): void {
    this.broadcast({
      type: 'spec_updated',
      payload: { specId, spec }
    });
  }

  /**
   * Broadcast new specification creation
   */
  broadcastSpecCreated(spec: any): void {
    this.broadcast({
      type: 'spec_created',
      payload: { spec }
    });
  }

  /**
   * Broadcast specification deletion
   */
  broadcastSpecDeleted(specId: number): void {
    this.broadcast({
      type: 'spec_deleted',
      payload: { specId }
    });
  }

  /**
   * Broadcast specification status change
   */
  broadcastSpecStatusChanged(specId: number, oldStatus: string, newStatus: string): void {
    this.broadcast({
      type: 'spec_status_changed',
      payload: { specId, oldStatus, newStatus }
    });
  }

  /**
   * Broadcast statistics update
   */
  broadcastStatsUpdate(stats: any): void {
    this.broadcast({
      type: 'stats_updated',
      payload: { stats }
    });
  }

  /**
   * Setup heartbeat to detect dead connections
   */
  private setupHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (!client.isAlive) {
          // Client didn't respond to ping, terminate connection
          logger.warn('Terminating dead WebSocket connection', { clientId: client.id });
          client.ws.terminate();
          this.clients.delete(client.id);
          return;
        }

        // Mark as not alive and send ping
        client.isAlive = false;
        try {
          client.ws.ping();
        } catch (error) {
          logger.error('Error sending ping to client', error as Error, { clientId: client.id });
        }
      });
    }, this.settings.websocket.pingInterval);
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    this.connectionCounter++;
    return `client_${Date.now()}_${this.connectionCounter}`;
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get client status information
   */
  getClientsStatus(): Array<{ id: string; isAlive: boolean; lastPing: Date }> {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      isAlive: client.isAlive,
      lastPing: client.lastPing
    }));
  }

  /**
   * Close WebSocket server
   */
  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }

      if (this.wss) {
        logger.info('Closing WebSocket server...');
        
        // Close all client connections
        this.clients.forEach((client) => {
          client.ws.close(1000, 'Server shutting down');
        });
        this.clients.clear();

        this.wss.close(() => {
          logger.info('WebSocket server closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Singleton instance
export const websocketHandler = new WebSocketHandler();