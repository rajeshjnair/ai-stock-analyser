import type { WebSocket } from 'ws';

export interface ClientConnectionOptions {
  id: string;
  ws: WebSocket;
  userId?: string;
}

export class ClientConnection {
  public readonly id: string;
  public readonly ws: WebSocket;
  public readonly userId?: string;
  public readonly subscribedSymbols: Set<string>;
  public readonly connectedAt: Date;
  private _isAlive: boolean;

  constructor(options: ClientConnectionOptions) {
    this.id = options.id;
    this.ws = options.ws;
    this.userId = options.userId;
    this.subscribedSymbols = new Set();
    this.connectedAt = new Date();
    this._isAlive = true;
  }

  /**
   * Send a message to the client
   */
  send(message: unknown): void {
    if (this.ws.readyState === 1) { // WebSocket.OPEN
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to client ${this.id}:`, error);
      }
    }
  }

  /**
   * Add a symbol to the client's subscriptions
   */
  addSymbol(symbol: string): void {
    this.subscribedSymbols.add(symbol.toUpperCase());
  }

  /**
   * Remove a symbol from the client's subscriptions
   */
  removeSymbol(symbol: string): void {
    this.subscribedSymbols.delete(symbol.toUpperCase());
  }

  /**
   * Get all subscribed symbols
   */
  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }

  /**
   * Check if client is subscribed to a symbol
   */
  isSubscribedTo(symbol: string): boolean {
    return this.subscribedSymbols.has(symbol.toUpperCase());
  }

  /**
   * Get connection duration in seconds
   */
  getConnectionDuration(): number {
    return Math.floor((Date.now() - this.connectedAt.getTime()) / 1000);
  }

  /**
   * Mark connection as alive (for heartbeat)
   */
  markAlive(): void {
    this._isAlive = true;
  }

  /**
   * Mark connection as possibly dead (for heartbeat)
   */
  markDead(): void {
    this._isAlive = false;
  }

  /**
   * Check if connection is alive
   */
  isAlive(): boolean {
    return this._isAlive;
  }

  /**
   * Close the WebSocket connection
   */
  close(code?: number, reason?: string): void {
    if (this.ws.readyState === 1 || this.ws.readyState === 0) { // OPEN or CONNECTING
      this.ws.close(code, reason);
    }
  }

  /**
   * Get connection info for logging/debugging
   */
  getInfo(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      subscribedSymbols: this.getSubscribedSymbols(),
      connectedAt: this.connectedAt.toISOString(),
      connectionDuration: this.getConnectionDuration(),
      isAlive: this._isAlive,
    };
  }
}
