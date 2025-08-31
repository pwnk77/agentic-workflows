/**
 * WebSocket handler for real-time updates in dashboard
 */
import { Server as HttpServer } from 'http';
import { WebSocket } from 'ws';
export type WSMessageType = 'spec_updated' | 'spec_created' | 'spec_deleted' | 'spec_status_changed' | 'search_updated' | 'stats_updated' | 'connection_ack' | 'ping' | 'pong';
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
export declare class WebSocketHandler {
    private wss;
    private clients;
    private pingInterval;
    private connectionCounter;
    private settings;
    /**
     * Initialize WebSocket server
     */
    initialize(httpServer: HttpServer): void;
    /**
     * Handle new WebSocket connection
     */
    private handleConnection;
    /**
     * Handle incoming messages from clients
     */
    private handleMessage;
    /**
     * Handle client disconnection
     */
    private handleDisconnection;
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message: WSMessage): void;
    /**
     * Send message to specific client
     */
    private sendToClient;
    /**
     * Broadcast specification update
     */
    broadcastSpecUpdate(specId: number, spec: any): void;
    /**
     * Broadcast new specification creation
     */
    broadcastSpecCreated(spec: any): void;
    /**
     * Broadcast specification deletion
     */
    broadcastSpecDeleted(specId: number): void;
    /**
     * Broadcast specification status change
     */
    broadcastSpecStatusChanged(specId: number, oldStatus: string, newStatus: string): void;
    /**
     * Broadcast statistics update
     */
    broadcastStatsUpdate(stats: any): void;
    /**
     * Setup heartbeat to detect dead connections
     */
    private setupHeartbeat;
    /**
     * Generate unique client ID
     */
    private generateClientId;
    /**
     * Get connected clients count
     */
    getConnectedClientsCount(): number;
    /**
     * Get client status information
     */
    getClientsStatus(): Array<{
        id: string;
        isAlive: boolean;
        lastPing: Date;
    }>;
    /**
     * Close WebSocket server
     */
    close(): Promise<void>;
}
export declare const websocketHandler: WebSocketHandler;
//# sourceMappingURL=websocket-handler.d.ts.map