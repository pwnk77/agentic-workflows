import { DatabaseConnection } from '../database/connection';
import { SpecStatus } from '../parsers/spec-parser';

/**
 * Core service for managing specifications in the database
 */
export class SpecService {
  /**
   * Create a new specification
   */
  static createSpec(data: CreateSpecData): Spec {
    const db = DatabaseConnection.getCurrentProjectConnection();
    
    // Auto-detect feature group if not provided
    const feature_group = data.feature_group || this.autoDetectGroup(data.title, data.body_md);
    
    const stmt = db.prepare(`
      INSERT INTO specs (title, body_md, status, feature_group)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.title,
      data.body_md,
      data.status || 'draft',
      feature_group
    );

    return this.getSpecById(result.lastInsertRowid as number)!;
  }

  /**
   * Update an existing specification
   */
  static updateSpec(spec_id: number, updates: UpdateSpecData): Spec | null {
    const db = DatabaseConnection.getCurrentProjectConnection();
    
    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title);
    }

    if (updates.body_md !== undefined) {
      updateFields.push('body_md = ?');
      updateValues.push(updates.body_md);
    }

    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(updates.status);
    }

    if (updates.feature_group !== undefined) {
      updateFields.push('feature_group = ?');
      updateValues.push(updates.feature_group);
    }

    if (updateFields.length === 0) {
      return this.getSpecById(spec_id);
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = datetime(\'now\')');
    updateValues.push(spec_id);

    const stmt = db.prepare(`
      UPDATE specs 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...updateValues);

    if (result.changes === 0) {
      return null;
    }

    return this.getSpecById(spec_id);
  }

  /**
   * Get specification by ID
   */
  static getSpecById(spec_id: number): Spec | null {
    const db = DatabaseConnection.getCurrentProjectConnection();
    const stmt = db.prepare('SELECT * FROM specs WHERE id = ?');
    return stmt.get(spec_id) as Spec | null;
  }

  /**
   * Delete specification
   */
  static deleteSpec(spec_id: number): boolean {
    const db = DatabaseConnection.getCurrentProjectConnection();
    const stmt = db.prepare('DELETE FROM specs WHERE id = ?');
    const result = stmt.run(spec_id);
    return result.changes > 0;
  }

  /**
   * List specifications with filtering and pagination
   */
  static listSpecs(options: ListSpecsOptions = {}): SpecListResult {
    const db = DatabaseConnection.getCurrentProjectConnection();
    
    // Build WHERE clause
    const whereConditions: string[] = [];
    const whereValues: any[] = [];

    if (options.status) {
      whereConditions.push('status = ?');
      whereValues.push(options.status);
    }

    if (options.feature_group) {
      whereConditions.push('feature_group = ?');
      whereValues.push(options.feature_group);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Build ORDER BY clause
    const sortBy = options.sort_by || 'created_at';
    const sortOrder = options.sort_order || 'desc';
    const orderClause = `ORDER BY ${sortBy} ${sortOrder}`;

    // Build LIMIT/OFFSET clause
    const limit = Math.min(options.limit || 50, 1000);
    const offset = options.offset || 0;
    const limitClause = `LIMIT ${limit} OFFSET ${offset}`;

    // Get specs
    const specsQuery = `
      SELECT * FROM specs 
      ${whereClause} 
      ${orderClause} 
      ${limitClause}
    `;

    const specs = db.prepare(specsQuery).all(...whereValues) as Spec[];

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM specs ${whereClause}`;
    const totalResult = db.prepare(countQuery).get(...whereValues) as { count: number };
    const total = totalResult.count;

    return {
      specs,
      pagination: {
        offset,
        limit,
        total,
        has_more: offset + limit < total
      }
    };
  }

  /**
   * Search specifications using full-text search
   */
  static searchSpecs(query: string, options: SearchOptions = {}): SpecSearchResult {
    const db = DatabaseConnection.getCurrentProjectConnection();
    
    const limit = Math.min(options.limit || 20, 100);
    const offset = options.offset || 0;
    const minScore = options.min_score || 0.1;

    const stmt = db.prepare(`
      SELECT s.*, 
             bm25(specs_fts) as score
      FROM specs s
      JOIN specs_fts ON s.id = specs_fts.rowid
      WHERE specs_fts MATCH ?
        AND bm25(specs_fts) >= ?
      ORDER BY score DESC
      LIMIT ? OFFSET ?
    `);

    const results = stmt.all(query, minScore, limit, offset) as SpecSearchResult['results'];

    // Get total count for search
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM specs s
      JOIN specs_fts ON s.id = specs_fts.rowid
      WHERE specs_fts MATCH ?
        AND bm25(specs_fts) >= ?
    `);

    const totalResult = countStmt.get(query, minScore) as { count: number };
    const total = totalResult.count;

    return {
      query,
      results,
      pagination: {
        offset,
        limit,
        total,
        has_more: offset + limit < total
      }
    };
  }

  /**
   * Get specification statistics
   */
  static getStats(include_details: boolean = false): SpecStats {
    const db = DatabaseConnection.getCurrentProjectConnection();
    
    // Basic counts
    const totalResult = db.prepare('SELECT COUNT(*) as count FROM specs').get() as { count: number };
    const total = totalResult.count;

    // Status breakdown
    const statusStats = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM specs 
      GROUP BY status
    `).all() as Array<{ status: string; count: number }>;

    const byStatus = statusStats.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Group breakdown
    const groupStats = db.prepare(`
      SELECT feature_group, COUNT(*) as count 
      FROM specs 
      WHERE feature_group IS NOT NULL
      GROUP BY feature_group
    `).all() as Array<{ feature_group: string; count: number }>;

    const byGroup = groupStats.reduce((acc, item) => {
      acc[item.feature_group] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const stats: SpecStats = {
      total_specs: total,
      by_status: byStatus,
      by_group: byGroup
    };

    if (include_details) {
      // Recent activity (last 7 days)
      const recentResult = db.prepare(`
        SELECT COUNT(*) as count 
        FROM specs 
        WHERE updated_at >= datetime('now', '-7 days')
      `).get() as { count: number };

      stats.recent_activity = recentResult.count;

      // Latest specs
      const latestSpecs = db.prepare(`
        SELECT id, title, status, feature_group, created_at 
        FROM specs 
        ORDER BY created_at DESC 
        LIMIT 5
      `).all() as Array<{
        id: number;
        title: string;
        status: string;
        feature_group: string;
        created_at: string;
      }>;

      stats.latest_specs = latestSpecs;
    }

    return stats;
  }

  /**
   * Auto-detect feature group from title and content
   */
  private static autoDetectGroup(title: string, body_md: string): string {
    const combined = (title + ' ' + body_md).toLowerCase();

    if (combined.includes('specgen') || combined.includes('spec management')) {
      return 'specgen';
    }
    
    if (combined.includes('learning') || combined.includes('research') || 
        combined.includes('documentation') || combined.includes('knowledge')) {
      return 'learning';
    }
    
    if (combined.includes('repository') || combined.includes('codebase') ||
        combined.includes('git') || combined.includes('version control')) {
      return 'repository';
    }

    return 'general';
  }
}

export interface Spec {
  id: number;
  title: string;
  body_md: string;
  status: SpecStatus;
  feature_group: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSpecData {
  title: string;
  body_md: string;
  status?: SpecStatus;
  feature_group?: string;
}

export interface UpdateSpecData {
  title?: string;
  body_md?: string;
  status?: SpecStatus;
  feature_group?: string;
}

export interface ListSpecsOptions {
  status?: SpecStatus;
  feature_group?: string;
  sort_by?: 'id' | 'title' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  min_score?: number;
}

export interface SpecListResult {
  specs: Spec[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface SpecSearchResult {
  query: string;
  results: Array<Spec & { score: number }>;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface SpecStats {
  total_specs: number;
  by_status: Record<string, number>;
  by_group: Record<string, number>;
  recent_activity?: number;
  latest_specs?: Array<{
    id: number;
    title: string;
    status: string;
    feature_group: string;
    created_at: string;
  }>;
}