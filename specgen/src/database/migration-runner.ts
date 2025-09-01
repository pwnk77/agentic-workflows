import Database from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Migration {
  version: number;
  filename: string;
  sql: string;
}

export class MigrationRunner {
  private db: Database.Database;
  private migrationsDir: string;

  constructor(db: Database.Database) {
    this.db = db;
    this.migrationsDir = join(__dirname, 'migrations');
    this.ensureMigrationsTable();
  }

  private ensureMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        filename TEXT NOT NULL,
        applied_at DATETIME DEFAULT (datetime('now'))
      )
    `);
  }

  private getAppliedMigrations(): Set<number> {
    const migrations = this.db.prepare('SELECT version FROM schema_migrations ORDER BY version').all();
    return new Set(migrations.map((row: any) => row.version));
  }

  private parseMigrationFilename(filename: string): { version: number; name: string } | null {
    const match = filename.match(/^(\d{3})_(.+)\.sql$/);
    if (!match) return null;
    
    return {
      version: parseInt(match[1], 10),
      name: match[2]
    };
  }

  private loadMigrations(): Migration[] {
    const files = readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    const migrations: Migration[] = [];

    for (const file of files) {
      const parsed = this.parseMigrationFilename(file);
      if (!parsed) {
        console.warn(`Skipping invalid migration filename: ${file}`);
        continue;
      }

      const sql = readFileSync(join(this.migrationsDir, file), 'utf-8');
      migrations.push({
        version: parsed.version,
        filename: file,
        sql
      });
    }

    return migrations;
  }

  public async runMigrations(): Promise<void> {
    const appliedMigrations = this.getAppliedMigrations();
    const allMigrations = this.loadMigrations();
    
    const pendingMigrations = allMigrations.filter(
      migration => !appliedMigrations.has(migration.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Running ${pendingMigrations.length} migration(s)...`);

    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.version}: ${migration.filename}`);
      
      try {
        // Begin transaction
        this.db.exec('BEGIN TRANSACTION');
        
        // Execute migration SQL
        this.db.exec(migration.sql);
        
        // Record migration as applied
        this.db.prepare(`
          INSERT INTO schema_migrations (version, filename)
          VALUES (?, ?)
        `).run(migration.version, migration.filename);
        
        // Commit transaction
        this.db.exec('COMMIT');
        
        console.log(`✓ Migration ${migration.version} applied successfully`);
      } catch (error) {
        // Rollback on error
        this.db.exec('ROLLBACK');
        console.error(`✗ Failed to apply migration ${migration.version}:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  }

  public getCurrentVersion(): number {
    const result = this.db.prepare('SELECT MAX(version) as version FROM schema_migrations').get() as any;
    return result?.version || 0;
  }
}