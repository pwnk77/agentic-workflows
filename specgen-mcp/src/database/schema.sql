-- SpecGen Clean Architecture - Simplified SQLite Schema
-- Single table design to eliminate complexity while maintaining functionality

-- Core specs table with all essential fields
CREATE TABLE specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body_md TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'todo', 'in-progress', 'done')),
    feature_group TEXT,          -- Auto-detected: 'specgen', 'learning', 'repository'
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now')),
    
    -- Prevent duplicates and optimize queries
    UNIQUE(title)
);

-- Full-text search virtual table using FTS5
CREATE VIRTUAL TABLE specs_fts USING fts5(
    title, 
    body_md, 
    content='specs', 
    content_rowid='id'
);

-- Trigger to keep FTS in sync on INSERT
CREATE TRIGGER specs_fts_insert AFTER INSERT ON specs BEGIN
    INSERT INTO specs_fts(rowid, title, body_md) 
    VALUES (new.id, new.title, new.body_md);
END;

-- Trigger to keep FTS in sync on UPDATE
CREATE TRIGGER specs_fts_update AFTER UPDATE ON specs BEGIN
    UPDATE specs_fts 
    SET title = new.title, body_md = new.body_md 
    WHERE rowid = new.id;
END;

-- Trigger to keep FTS in sync on DELETE
CREATE TRIGGER specs_fts_delete AFTER DELETE ON specs BEGIN
    DELETE FROM specs_fts WHERE rowid = old.id;
END;

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER specs_updated_at AFTER UPDATE ON specs BEGIN
    UPDATE specs SET updated_at = datetime('now') WHERE id = new.id;
END;

-- Index for common queries
CREATE INDEX idx_specs_status ON specs(status);
CREATE INDEX idx_specs_feature_group ON specs(feature_group);
CREATE INDEX idx_specs_created_at ON specs(created_at);