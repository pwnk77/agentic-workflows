import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MigrationRunner } from './migration-runner';

/**
 * Initialize a new SQLite database with the simplified SpecGen schema
 */
export class DatabaseInitializer {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  /**
   * Initialize database with schema and indexes
   */
  async initialize(): Promise<void> {
    try {
      // Read and execute schema SQL
      const schemaPath = join(__dirname, 'schema.sql');
      const schemaSql = readFileSync(schemaPath, 'utf-8');
      
      // Execute the entire schema at once
      this.db.exec(schemaSql);

      // Enable WAL mode for better concurrent access
      this.db.exec('PRAGMA journal_mode = WAL;');
      
      // Optimize for read performance
      this.db.exec('PRAGMA synchronous = NORMAL;');
      this.db.exec('PRAGMA cache_size = -64000;'); // 64MB cache

      // Run any pending migrations
      const migrationRunner = new MigrationRunner(this.db);
      await migrationRunner.runMigrations();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

  /**
   * Get the database instance for use by other services
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Check if database is properly initialized
   */
  isInitialized(): boolean {
    try {
      const result = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('specs', 'specs_fts')
      `).all();
      
      return result.length === 2;
    } catch {
      return false;
    }
  }
}