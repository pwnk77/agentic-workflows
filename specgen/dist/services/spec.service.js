import { DatabaseConnection } from '../database/connection.js';
export class SpecService {
    static createSpec(data) {
        const db = DatabaseConnection.getCurrentProjectConnection();
        const columns = this.getTableColumns(db, 'specs');
        const hasExtendedColumns = columns.includes('theme_category');
        const feature_group = data.feature_group || this.autoDetectGroup(data.title, data.body_md);
        let stmt;
        let values;
        if (hasExtendedColumns) {
            const theme_category = data.theme_category || this.autoDetectTheme(feature_group);
            const related_specs_json = data.related_specs ? JSON.stringify(data.related_specs) : null;
            stmt = db.prepare(`
        INSERT INTO specs (
          title, body_md, status, feature_group, theme_category, 
          priority, related_specs, parent_spec_id, created_via
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
            values = [
                data.title,
                data.body_md,
                data.status || 'draft',
                feature_group,
                theme_category,
                data.priority || 'medium',
                related_specs_json,
                data.parent_spec_id || null,
                data.created_via || null
            ];
        }
        else {
            stmt = db.prepare(`
        INSERT INTO specs (title, body_md, status, feature_group)
        VALUES (?, ?, ?, ?)
      `);
            values = [
                data.title,
                data.body_md,
                data.status || 'draft',
                feature_group
            ];
        }
        const result = stmt.run(...values);
        return this.getSpecById(result.lastInsertRowid);
    }
    static getTableColumns(db, tableName) {
        try {
            const result = db.prepare(`PRAGMA table_info(${tableName})`).all();
            return result.map((row) => row.name);
        }
        catch {
            return ['id', 'title', 'body_md', 'status', 'feature_group', 'created_at', 'updated_at'];
        }
    }
    static ensureFTSIndex(db) {
        try {
            const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='specs_fts'
      `).all();
            if (tables.length === 0) {
                this.createFTSTable(db);
            }
            else {
                const ftsCount = db.prepare('SELECT COUNT(*) as count FROM specs_fts').get();
                const specsCount = db.prepare('SELECT COUNT(*) as count FROM specs').get();
                if (ftsCount.count !== specsCount.count) {
                    this.rebuildFTSIndex(db);
                }
            }
        }
        catch (error) {
            console.error('Error ensuring FTS index:', error);
            try {
                this.rebuildFTSIndex(db);
            }
            catch (rebuildError) {
                console.error('Error rebuilding FTS index:', rebuildError);
            }
        }
    }
    static createFTSTable(db) {
        const columns = this.getTableColumns(db, 'specs');
        const hasExtendedColumns = columns.includes('theme_category');
        if (hasExtendedColumns) {
            db.exec(`
        CREATE VIRTUAL TABLE specs_fts USING fts5(
          title, 
          body_md,
          theme_category,
          feature_group,
          content='specs', 
          content_rowid='id'
        );
      `);
            db.exec(`
        CREATE TRIGGER specs_fts_insert AFTER INSERT ON specs BEGIN
          INSERT INTO specs_fts(rowid, title, body_md, theme_category, feature_group) 
          VALUES (new.id, new.title, new.body_md, new.theme_category, new.feature_group);
        END;

        CREATE TRIGGER specs_fts_update AFTER UPDATE ON specs BEGIN
          UPDATE specs_fts 
          SET title = new.title, 
              body_md = new.body_md,
              theme_category = new.theme_category,
              feature_group = new.feature_group
          WHERE rowid = new.id;
        END;

        CREATE TRIGGER specs_fts_delete AFTER DELETE ON specs BEGIN
          DELETE FROM specs_fts WHERE rowid = old.id;
        END;
      `);
        }
        else {
            db.exec(`
        CREATE VIRTUAL TABLE specs_fts USING fts5(
          title, 
          body_md,
          content='specs', 
          content_rowid='id'
        );
      `);
            db.exec(`
        CREATE TRIGGER specs_fts_insert AFTER INSERT ON specs BEGIN
          INSERT INTO specs_fts(rowid, title, body_md) 
          VALUES (new.id, new.title, new.body_md);
        END;

        CREATE TRIGGER specs_fts_update AFTER UPDATE ON specs BEGIN
          UPDATE specs_fts 
          SET title = new.title, body_md = new.body_md
          WHERE rowid = new.id;
        END;

        CREATE TRIGGER specs_fts_delete AFTER DELETE ON specs BEGIN
          DELETE FROM specs_fts WHERE rowid = old.id;
        END;
      `);
        }
        this.populateFTSTable(db, hasExtendedColumns);
    }
    static rebuildFTSIndex(db) {
        try {
            db.exec('DELETE FROM specs_fts;');
            const columns = this.getTableColumns(db, 'specs');
            const hasExtendedColumns = columns.includes('theme_category');
            this.populateFTSTable(db, hasExtendedColumns);
        }
        catch (error) {
            console.error('Error rebuilding FTS index:', error);
        }
    }
    static populateFTSTable(db, hasExtendedColumns) {
        if (hasExtendedColumns) {
            db.exec(`
        INSERT INTO specs_fts(rowid, title, body_md, theme_category, feature_group)
        SELECT id, title, body_md, theme_category, feature_group FROM specs;
      `);
        }
        else {
            db.exec(`
        INSERT INTO specs_fts(rowid, title, body_md)
        SELECT id, title, body_md FROM specs;
      `);
        }
    }
    static updateSpec(spec_id, updates) {
        const db = DatabaseConnection.getCurrentProjectConnection();
        const updateFields = [];
        const updateValues = [];
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
        if (updates.theme_category !== undefined) {
            updateFields.push('theme_category = ?');
            updateValues.push(updates.theme_category);
        }
        if (updates.priority !== undefined) {
            updateFields.push('priority = ?');
            updateValues.push(updates.priority);
        }
        if (updates.related_specs !== undefined) {
            updateFields.push('related_specs = ?');
            updateValues.push(updates.related_specs);
        }
        if (updates.parent_spec_id !== undefined) {
            updateFields.push('parent_spec_id = ?');
            updateValues.push(updates.parent_spec_id);
        }
        if (updates.last_command !== undefined) {
            updateFields.push('last_command = ?');
            updateValues.push(updates.last_command);
        }
        if (updateFields.length === 0) {
            return this.getSpecById(spec_id);
        }
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
    static getSpecById(spec_id) {
        const db = DatabaseConnection.getCurrentProjectConnection();
        const stmt = db.prepare('SELECT * FROM specs WHERE id = ?');
        return stmt.get(spec_id);
    }
    static deleteSpec(spec_id) {
        const db = DatabaseConnection.getCurrentProjectConnection();
        const stmt = db.prepare('DELETE FROM specs WHERE id = ?');
        const result = stmt.run(spec_id);
        return result.changes > 0;
    }
    static listSpecs(options = {}) {
        const db = DatabaseConnection.getCurrentProjectConnection();
        const whereConditions = [];
        const whereValues = [];
        if (options.status) {
            whereConditions.push('status = ?');
            whereValues.push(options.status);
        }
        if (options.feature_group) {
            whereConditions.push('feature_group = ?');
            whereValues.push(options.feature_group);
        }
        if (options.theme_category) {
            whereConditions.push('theme_category = ?');
            whereValues.push(options.theme_category);
        }
        if (options.priority) {
            whereConditions.push('priority = ?');
            whereValues.push(options.priority);
        }
        if (options.created_via) {
            whereConditions.push('created_via = ?');
            whereValues.push(options.created_via);
        }
        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';
        const sortBy = options.sort_by || 'created_at';
        const sortOrder = options.sort_order || 'desc';
        const orderClause = `ORDER BY ${sortBy} ${sortOrder}`;
        const limit = Math.min(options.limit || 50, 1000);
        const offset = options.offset || 0;
        const limitClause = `LIMIT ${limit} OFFSET ${offset}`;
        const specsQuery = `
      SELECT * FROM specs 
      ${whereClause} 
      ${orderClause} 
      ${limitClause}
    `;
        const specs = db.prepare(specsQuery).all(...whereValues);
        const countQuery = `SELECT COUNT(*) as count FROM specs ${whereClause}`;
        const totalResult = db.prepare(countQuery).get(...whereValues);
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
    static searchSpecs(query, options = {}) {
        const db = DatabaseConnection.getCurrentProjectConnection();
        this.ensureFTSIndex(db);
        const limit = Math.min(options.limit || 20, 100);
        const offset = options.offset || 0;
        const minScore = options.min_score !== undefined ? options.min_score : -10.0;
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
        const results = stmt.all(query, minScore, limit, offset);
        const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM specs s
      JOIN specs_fts ON s.id = specs_fts.rowid
      WHERE specs_fts MATCH ?
        AND bm25(specs_fts) >= ?
    `);
        const totalResult = countStmt.get(query, minScore);
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
    static getStats(include_details = false) {
        const db = DatabaseConnection.getCurrentProjectConnection();
        const totalResult = db.prepare('SELECT COUNT(*) as count FROM specs').get();
        const total = totalResult.count;
        const statusStats = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM specs 
      GROUP BY status
    `).all();
        const byStatus = statusStats.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
        }, {});
        const groupStats = db.prepare(`
      SELECT feature_group, COUNT(*) as count 
      FROM specs 
      WHERE feature_group IS NOT NULL
      GROUP BY feature_group
    `).all();
        const byGroup = groupStats.reduce((acc, item) => {
            acc[item.feature_group] = item.count;
            return acc;
        }, {});
        const stats = {
            total_specs: total,
            by_status: byStatus,
            by_group: byGroup
        };
        if (include_details) {
            const recentResult = db.prepare(`
        SELECT COUNT(*) as count 
        FROM specs 
        WHERE updated_at >= datetime('now', '-7 days')
      `).get();
            stats.recent_activity = recentResult.count;
            const latestSpecs = db.prepare(`
        SELECT id, title, status, feature_group, created_at 
        FROM specs 
        ORDER BY created_at DESC 
        LIMIT 5
      `).all();
            stats.latest_specs = latestSpecs;
        }
        return stats;
    }
    static autoDetectGroup(title, body_md) {
        const combined = (title + ' ' + body_md).toLowerCase();
        if (combined.includes('auth') || combined.includes('login') ||
            combined.includes('security') || combined.includes('jwt')) {
            return 'auth';
        }
        if (combined.includes('dashboard') || combined.includes('component') ||
            combined.includes('frontend') || combined.includes('react') ||
            combined.includes('interface')) {
            return 'ui';
        }
        if (combined.includes('endpoint') || combined.includes('rest') ||
            combined.includes('graphql') || combined.includes('service') ||
            combined.includes('backend')) {
            return 'api';
        }
        if (combined.includes('database') || combined.includes('migration') ||
            combined.includes('schema') || combined.includes('model') ||
            combined.includes('storage')) {
            return 'data';
        }
        if (combined.includes('mcp') || combined.includes('webhook') ||
            combined.includes('external') || combined.includes('sync')) {
            return 'integration';
        }
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
    static autoDetectTheme(feature_group) {
        const themeMap = {
            'auth': 'backend',
            'ui': 'frontend',
            'api': 'backend',
            'data': 'backend',
            'integration': 'integration',
            'specgen': 'integration',
            'learning': 'general',
            'repository': 'general'
        };
        return themeMap[feature_group] || 'general';
    }
}
//# sourceMappingURL=spec.service.js.map