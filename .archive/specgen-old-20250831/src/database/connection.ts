import Database from 'better-sqlite3';
import { ProjectManager } from './project-manager';
import { DatabaseInitializer } from './init';

/**
 * Manages SQLite database connections per project
 */
export class DatabaseConnection {
  private static connections: Map<string, Database.Database> = new Map();

  /**
   * Get or create a database connection for a project
   */
  static getConnection(projectRoot?: string): Database.Database {
    const root = projectRoot || ProjectManager.detectProject();
    
    // Return existing connection if available
    if (this.connections.has(root)) {
      return this.connections.get(root)!;
    }

    // Create new connection
    const dbPath = ProjectManager.getDatabasePath(root);
    
    // Ensure .specgen directory exists
    ProjectManager.ensureSpecgenDir(root);
    
    // Create database connection
    const db = new Database(dbPath);
    
    // Initialize schema if database is new
    const initializer = new DatabaseInitializer(dbPath);
    if (!initializer.isInitialized()) {
      initializer.initialize();
    }
    
    // Store connection for reuse
    this.connections.set(root, db);
    
    return db;
  }

  /**
   * Close connection for a specific project
   */
  static closeConnection(projectRoot: string): void {
    const connection = this.connections.get(projectRoot);
    if (connection) {
      connection.close();
      this.connections.delete(projectRoot);
    }
  }

  /**
   * Close all open connections
   */
  static closeAllConnections(): void {
    for (const [, connection] of this.connections) {
      connection.close();
    }
    this.connections.clear();
  }

  /**
   * Get current project database connection
   */
  static getCurrentProjectConnection(): Database.Database {
    return this.getConnection(ProjectManager.detectProject());
  }

  /**
   * Execute a query on the current project database
   */
  static query<T = any>(sql: string, params: any[] = []): T[] {
    const db = this.getCurrentProjectConnection();
    const stmt = db.prepare(sql);
    return stmt.all(params) as T[];
  }

  /**
   * Execute a single row query on the current project database
   */
  static queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
    const db = this.getCurrentProjectConnection();
    const stmt = db.prepare(sql);
    return stmt.get(params) as T | undefined;
  }

  /**
   * Execute an update/insert/delete on the current project database
   */
  static run(sql: string, params: any[] = []): Database.RunResult {
    const db = this.getCurrentProjectConnection();
    const stmt = db.prepare(sql);
    return stmt.run(params);
  }

  /**
   * Execute multiple statements in a transaction
   */
  static transaction<T>(fn: (db: Database.Database) => T): T {
    const db = this.getCurrentProjectConnection();
    const transaction = db.transaction(fn);
    return transaction(db);
  }
}