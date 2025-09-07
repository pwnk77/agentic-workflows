-- SQLite initialization and optimization settings
-- This script should be executed first to configure the database

-- Enable Write-Ahead Logging (WAL) mode for better concurrency
PRAGMA journal_mode = WAL;

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Set synchronous mode to NORMAL for better performance
-- FULL is safer but slower, NORMAL is good balance for demo
PRAGMA synchronous = NORMAL;

-- Set cache size to 10MB (negative value means KB)
PRAGMA cache_size = -10240;

-- Enable memory-mapped I/O for better performance
PRAGMA mmap_size = 268435456; -- 256MB

-- Set temp store to memory for faster operations
PRAGMA temp_store = MEMORY;

-- Optimize for faster reads (good for demo/reporting)
PRAGMA optimize;

-- Set a reasonable timeout for busy database (5 seconds)
PRAGMA busy_timeout = 5000;

-- Configure automatic vacuuming to keep database clean
PRAGMA auto_vacuum = INCREMENTAL;

-- Enable query planner analysis for better performance
PRAGMA analysis_limit = 1000;

-- Show current configuration (simplified for compatibility)
SELECT 'SQLite configuration applied successfully' as status;