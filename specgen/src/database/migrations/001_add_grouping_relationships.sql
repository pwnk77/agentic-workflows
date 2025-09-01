-- Migration 001: Add grouping and relationship fields for MCP commands integration
-- Extends the clean architecture schema with intelligence features

-- Add new columns to specs table
ALTER TABLE specs ADD COLUMN theme_category TEXT;          -- Higher level: 'backend', 'frontend', 'integration'
ALTER TABLE specs ADD COLUMN priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high'));

-- Relationship tracking columns
ALTER TABLE specs ADD COLUMN related_specs TEXT;           -- JSON array of related spec IDs
ALTER TABLE specs ADD COLUMN parent_spec_id INTEGER;       -- For spec hierarchies

-- Command integration columns  
ALTER TABLE specs ADD COLUMN created_via TEXT;             -- 'architect-mcp', 'engineer-mcp', 'import'
ALTER TABLE specs ADD COLUMN last_command TEXT;            -- Last command that modified this spec

-- Add foreign key constraint for parent_spec_id
CREATE INDEX idx_specs_parent_id ON specs(parent_spec_id);

-- Update existing indexes to include new fields
CREATE INDEX idx_specs_theme_category ON specs(theme_category);
CREATE INDEX idx_specs_priority ON specs(priority);
CREATE INDEX idx_specs_status_priority ON specs(status, priority);
CREATE INDEX idx_specs_created_via ON specs(created_via);

-- Update the FTS table to include the new searchable fields
-- We need to recreate the FTS table to include theme_category and priority
DROP TABLE specs_fts;

CREATE VIRTUAL TABLE specs_fts USING fts5(
    title, 
    body_md,
    theme_category,
    feature_group,
    content='specs', 
    content_rowid='id'
);

-- Repopulate FTS with existing data
INSERT INTO specs_fts(rowid, title, body_md, theme_category, feature_group)
SELECT id, title, body_md, theme_category, feature_group FROM specs;

-- Recreate the FTS triggers with new fields
DROP TRIGGER specs_fts_insert;
DROP TRIGGER specs_fts_update;
DROP TRIGGER specs_fts_delete;

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