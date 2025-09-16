import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4567;
const DOCS_PATH = process.env.DOCS_PATH || path.resolve(__dirname, '../.specgen/markdown');
const LEGACY_DOCS_PATH = path.resolve(__dirname, '../docs'); // Legacy location
const JSON_SPECS_PATH = path.resolve(__dirname, '../.specgen/specs');
const METADATA_FILE = path.join(LEGACY_DOCS_PATH, '.spec-metadata.json'); // SHARED with MCP

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Simple in-memory cache
let metadataCache = {};
let watcher = null;

// Helper functions inline
async function scanJSONSpecs() {
  try {
    const jsonFiles = await fs.readdir(JSON_SPECS_PATH).catch(() => []);
    const specs = {};

    for (const file of jsonFiles) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(JSON_SPECS_PATH, file);
      const jsonContent = await fs.readFile(filePath, 'utf-8');
      const spec = JSON.parse(jsonContent);
      const stats = await fs.stat(filePath);

      // Convert JSON spec to metadata format
      const filename = `${spec.id}.json`;
      specs[filename] = {
        filename: filename,
        title: spec.metadata.title,
        category: spec.metadata.category,
        status: spec.metadata.status,
        priority: spec.metadata.priority,
        modified: spec.metadata.updated_at,
        created: spec.metadata.created_at,
        manualStatus: false,
        manualPriority: false,
        source: 'json' // Mark as JSON source
      };
    }

    return specs;
  } catch (error) {
    console.error('Error scanning JSON specs:', error);
    return {};
  }
}

async function migrateLegacySpecs() {
  try {
    const legacyExists = await fs.access(LEGACY_DOCS_PATH).then(() => true).catch(() => false);
    if (!legacyExists) return { migrated: 0 };

    const scanDirectory = async (dir) => {
      const results = [];
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subResults = await scanDirectory(fullPath);
          results.push(...subResults);
        } else if (entry.name.startsWith('SPEC-') && entry.name.endsWith('.md')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const legacySpecs = await scanDirectory(LEGACY_DOCS_PATH);
    let migratedCount = 0;

    for (const legacyPath of legacySpecs) {
      const filename = path.basename(legacyPath);
      const newPath = path.join(DOCS_PATH, filename);

      // Check if already migrated
      const exists = await fs.access(newPath).then(() => true).catch(() => false);
      if (!exists) {
        // Ensure target directory exists
        await fs.mkdir(DOCS_PATH, { recursive: true });

        // Copy legacy spec to new location
        await fs.copyFile(legacyPath, newPath);
        migratedCount++;
        console.log(`Migrated: ${filename} -> .specgen/markdown/`);
      }
    }

    return { migrated: migratedCount, total: legacySpecs.length };
  } catch (error) {
    console.error('Migration error:', error);
    return { migrated: 0, error: error.message };
  }
}

async function scanDocs() {
  try {
    // Run migration check first
    const migrationResult = await migrateLegacySpecs();
    if (migrationResult.migrated > 0) {
      console.log(`✅ Migrated ${migrationResult.migrated} legacy specs to .specgen/markdown/`);
    }

    // Scan JSON specs first (canonical storage)
    const jsonSpecs = await scanJSONSpecs();
    console.log(`📦 Found ${Object.keys(jsonSpecs).length} JSON specs`);

    // Scan unified markdown location (.specgen/markdown/)
    const scanDirectory = async (dir) => {
      try {
        const results = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const subResults = await scanDirectory(fullPath);
            results.push(...subResults);
          } else if (entry.name.startsWith('SPEC-') && entry.name.endsWith('.md')) {
            results.push(fullPath);
          }
        }
        return results;
      } catch (error) {
        // Directory doesn't exist yet, return empty array
        if (error.code === 'ENOENT') {
          return [];
        }
        throw error;
      }
    };

    const specFiles = await scanDirectory(DOCS_PATH);

    // Start with JSON specs (canonical source with precedence)
    const specs = { ...jsonSpecs };
    console.log(`📄 Found ${specFiles.length} markdown specs`);

    for (const filePath of specFiles) {
      const file = path.basename(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      const title = content.match(/^#\s+(.+)/m)?.[1] || file;

      // Existing metadata logic unchanged
      const existingMeta = metadataCache[file];
      const hasManualStatus = existingMeta?.manualStatus;
      const hasManualPriority = existingMeta?.manualPriority;

      specs[file] = {
        filename: file,
        title,
        category: detectCategory(content),
        status: hasManualStatus ? existingMeta.status : detectStatus(content),
        priority: hasManualPriority ? existingMeta.priority : detectPriority(content),
        modified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString(),
        manualStatus: hasManualStatus || false,
        manualPriority: hasManualPriority || false,
        source: 'markdown' // Markdown source
      };
    }

    const metadata = {
      metadata_version: "1.0.0",
      last_full_scan: new Date().toISOString(),
      specs: specs
    };

    metadataCache = specs;
    // Write to SHARED metadata file - same one MCP uses
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    return specs;
  } catch (error) {
    console.error('Error scanning docs:', error);
    return {};
  }
}

function detectCategory(content) {
  const contentLower = content.toLowerCase();
  
  // Check in order of specificity - more specific categories first
  if (contentLower.includes('api') || contentLower.includes('endpoint') || contentLower.includes('rest') || contentLower.includes('graphql')) {
    return 'API';
  }
  if (contentLower.includes('ui') || contentLower.includes('frontend') || contentLower.includes('component') || contentLower.includes('interface')) {
    return 'UI';
  }
  if (contentLower.includes('database') || contentLower.includes('schema') || contentLower.includes('sql') || contentLower.includes('migration')) {
    return 'Database';
  }
  if (contentLower.includes('backend') || contentLower.includes('server') || contentLower.includes('service')) {
    return 'Backend';
  }
  if (contentLower.includes('integration') || contentLower.includes('webhook') || contentLower.includes('external')) {
    return 'Integration';
  }
  if (contentLower.includes('architecture') || contentLower.includes('system') || contentLower.includes('design')) {
    return 'Architecture';
  }
  if (contentLower.includes('test') || contentLower.includes('testing') || contentLower.includes('qa') || contentLower.includes('quality')) {
    return 'Testing';
  }
  
  return 'General';
}

function detectStatus(content) {
  const lines = content.split('\n');
  
  // Look for **Status**: in the first 10 lines (frontmatter section)
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim().toLowerCase();
    if (line.startsWith('**status**:')) {
      if (line.includes('completed') || line.includes('done')) {
        return 'completed';
      }
      if (line.includes('in-progress') || line.includes('implementing')) {
        return 'in-progress';
      }
      if (line.includes('todo') || line.includes('draft')) {
        return 'draft';
      }
      break; // Stop after finding the first Status line
    }
  }
  
  // Fallback to general content detection if no explicit **Status**: found
  const contentLower = content.toLowerCase();
  if (contentLower.includes('completed') || contentLower.includes('done')) return 'completed';
  if (contentLower.includes('in-progress') || contentLower.includes('implementing')) return 'in-progress';
  if (contentLower.includes('todo') || contentLower.includes('draft')) return 'draft';
  
  return 'todo';
}

function detectPriority(content) {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('high priority') || contentLower.includes('urgent')) return 'high';
  if (contentLower.includes('low priority') || contentLower.includes('nice to have')) return 'low';
  
  return 'medium';
}


// API Routes - all inline
app.get('/api/specs', async (req, res) => {
  try {
    const specs = await scanDocs();
    res.json(Object.values(specs));
  } catch (err) {
    console.error('Error listing specs:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/specs/:filename', async (req, res) => {
  try {
    const { format } = req.query; // 'json' or 'markdown' or undefined (auto)
    const filename = req.params.filename;
    const metadata = metadataCache[filename];

    // Check if this is a JSON spec
    if (metadata?.source === 'json') {
      const id = filename.replace('.json', '');
      const jsonFilePath = path.join(JSON_SPECS_PATH, `${id}.json`);

      if (await fs.access(jsonFilePath).then(() => true).catch(() => false)) {
        const jsonContent = await fs.readFile(jsonFilePath, 'utf-8');
        const spec = JSON.parse(jsonContent);

        if (format === 'markdown') {
          // Convert JSON to markdown for display
          const { MarkdownGenerator } = await import('../src/core/markdown-generator.js');
          const markdownContent = MarkdownGenerator.generateFromJSON(spec);
          return res.json({
            content: markdownContent,
            metadata,
            source: 'json',
            format: 'markdown'
          });
        } else {
          // Return JSON format
          return res.json({
            content: format === 'json' ? JSON.stringify(spec, null, 2) : jsonContent,
            metadata,
            source: 'json',
            format: 'json'
          });
        }
      }
    }

    // Handle markdown specs
    const markdownPath = path.join(DOCS_PATH, filename);
    const content = await fs.readFile(markdownPath, 'utf-8');

    if (format === 'json') {
      // Convert markdown to JSON
      const { MarkdownGenerator } = await import('../src/core/markdown-generator.js');
      const spec = MarkdownGenerator.parseToJSON(content);
      return res.json({
        content: JSON.stringify(spec, null, 2),
        metadata: metadata || {},
        source: 'markdown',
        format: 'json'
      });
    }

    // Return markdown as-is
    res.json({
      content,
      metadata: metadata || {},
      source: 'markdown',
      format: 'markdown'
    });
  } catch (err) {
    console.error('Error getting spec:', err);
    res.status(404).json({ error: 'Spec not found' });
  }
});


app.put('/api/specs/:filename', async (req, res) => {
  try {
    const { content, status, priority } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Use unified markdown path (.specgen/markdown/)
    const filePath = path.join(DOCS_PATH, req.params.filename);
    
    // 1. Update content with metadata if provided
    let updatedContent = content;
    if (status || priority) {
      const lines = content.split('\n');
      let statusUpdated = false, priorityUpdated = false;
      
      // Look for existing metadata lines and update them
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('**Status**:') || line.startsWith('**Status:**')) {
          if (status) {
            lines[i] = `**Status**: ${status}`;
            statusUpdated = true;
          }
        }
        if (line.startsWith('**Priority**:') || line.startsWith('**Priority:**')) {
          if (priority) {
            lines[i] = `**Priority**: ${priority}`;
            priorityUpdated = true;
          }
        }
      }
      
      updatedContent = lines.join('\n');
    }
    
    // 2. Write updated content to markdown file
    await fs.writeFile(filePath, updatedContent);
    
    // 3. Update metadata JSON directly if status/priority provided
    if (status || priority) {
      try {
        const metadataContent = await fs.readFile(METADATA_FILE, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        
        // Update the specific spec's metadata
        if (metadata.specs && metadata.specs[req.params.filename]) {
          if (status) {
            metadata.specs[req.params.filename].status = status;
            metadata.specs[req.params.filename].manualStatus = true; // Mark as manual override
          }
          if (priority) {
            metadata.specs[req.params.filename].priority = priority;
            metadata.specs[req.params.filename].manualPriority = true; // Mark as manual override
          }
          metadata.specs[req.params.filename].modified = new Date().toISOString();
          metadata.last_full_scan = new Date().toISOString();
        }
        
        // Write updated metadata back to file
        await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
      } catch (metadataError) {
        console.error('Error updating metadata:', metadataError);
        // Continue even if metadata update fails - at least the file was saved
      }
    } else {
      // Just refresh metadata if no status/priority changes
      await scanDocs();
    }
    
    // CRITICAL FIX: Temporarily pause file watcher to prevent it from overriding our update
    if (watcher && (status || priority)) {
      watcher.unwatch(path.join(DOCS_PATH, req.params.filename));
      
      // Re-enable watching after 2 seconds
      setTimeout(() => {
        if (watcher) {
          watcher.add(path.join(DOCS_PATH, req.params.filename));
        }
      }, 2000);
    }
    
    res.json({ message: 'Spec updated successfully' });
  } catch (err) {
    console.error('Error updating spec:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/specs/:filename', async (req, res) => {
  try {
    // Use unified markdown path (.specgen/markdown/)
    const filePath = path.join(DOCS_PATH, req.params.filename);

    await fs.unlink(filePath);
    await scanDocs(); // Refresh metadata

    res.json({ message: 'Spec deleted successfully' });
  } catch (err) {
    console.error('Error deleting spec:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/refresh-metadata', async (req, res) => {
  try {
    const specs = await scanDocs();
    res.json({
      message: 'Metadata refreshed successfully',
      count: Object.keys(specs).length
    });
  } catch (err) {
    console.error('Error refreshing metadata:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/migration/status', async (req, res) => {
  try {
    const legacyExists = await fs.access(LEGACY_DOCS_PATH).then(() => true).catch(() => false);

    const scanDirectory = async (dir) => {
      try {
        const results = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const subResults = await scanDirectory(fullPath);
            results.push(...subResults);
          } else if (entry.name.startsWith('SPEC-') && entry.name.endsWith('.md')) {
            results.push(fullPath);
          }
        }
        return results;
      } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
      }
    };

    const legacySpecs = legacyExists ? await scanDirectory(LEGACY_DOCS_PATH) : [];
    const currentSpecs = await scanDirectory(DOCS_PATH);

    // Check which legacy specs need migration (don't exist in unified location)
    let unmigrated = 0;
    for (const legacyPath of legacySpecs) {
      const filename = path.basename(legacyPath);
      const unifiedPath = path.join(DOCS_PATH, filename);
      const exists = await fs.access(unifiedPath).then(() => true).catch(() => false);
      if (!exists) {
        unmigrated++;
      }
    }

    res.json({
      legacyPath: LEGACY_DOCS_PATH,
      currentPath: DOCS_PATH,
      legacySpecsFound: legacySpecs.length,
      currentSpecs: currentSpecs.length,
      unmigratedSpecs: unmigrated,
      migrationNeeded: unmigrated > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/migration/migrate', async (req, res) => {
  try {
    const result = await migrateLegacySpecs();
    await scanDocs(); // Refresh metadata after migration
    res.json({
      success: true,
      migrated: result.migrated,
      total: result.total,
      message: `Migrated ${result.migrated} specs to .specgen/markdown/`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File watching
function startWatcher() {
  if (watcher) {
    watcher.close();
  }
  
  // Watch for SPEC-*.md files in unified markdown directory
  watcher = chokidar.watch(path.join(DOCS_PATH, '**/SPEC-*.md'), {
    persistent: true,
    ignoreInitial: true,
    usePolling: false
  });
  
  watcher.on('all', async (event, filepath) => {
    console.log(`File ${event}: ${path.basename(filepath)}`);
    try {
      await scanDocs();
      console.log('Metadata updated after file change');
    } catch (error) {
      console.error('Error updating metadata after file change:', error);
    }
  });
  
  watcher.on('error', (error) => {
    console.error('File watcher error:', error);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down dashboard server...');
  if (watcher) {
    watcher.close();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down dashboard server...');
  if (watcher) {
    watcher.close();
  }
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 SpecGen Dashboard running on http://localhost:${PORT}`);
  console.log(`📁 Watching specs in: ${DOCS_PATH}`);
  
  try {
    await scanDocs();
    console.log(`✅ Initial scan complete: ${Object.keys(metadataCache).length} specs found`);
    
    startWatcher();
    console.log('📡 File watcher started');
  } catch (error) {
    console.error('❌ Error during startup:', error);
  }
});