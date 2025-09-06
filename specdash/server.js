const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const PORT = process.env.PORT || 3000;
const DOCS_PATH = path.resolve(__dirname, '../docs');
const METADATA_FILE = path.join(DOCS_PATH, '.spec-metadata.json'); // SHARED with MCP

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Simple in-memory cache
let metadataCache = {};
let watcher = null;

// Helper functions inline
async function scanDocs() {
  try {
    const files = await fs.readdir(DOCS_PATH);
    const specs = {};
    
    for (const file of files) {
      if (file.startsWith('SPEC-') && file.endsWith('.md')) {
        const filePath = path.join(DOCS_PATH, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        const title = content.match(/^#\s+(.+)/m)?.[1] || file;
        
        // Check if we have existing metadata with manual overrides
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
          manualPriority: hasManualPriority || false
        };
        
      }
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
    const filePath = path.join(DOCS_PATH, req.params.filename);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ 
      content, 
      metadata: metadataCache[req.params.filename] || {}
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
      console.log('🔧 DEBUG: Temporarily pausing file watcher for 2 seconds');
      watcher.unwatch(path.join(DOCS_PATH, req.params.filename));
      
      // Re-enable watching after 2 seconds
      setTimeout(() => {
        if (watcher) {
          watcher.add(path.join(DOCS_PATH, req.params.filename));
          console.log('🔧 DEBUG: File watcher resumed');
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

// File watching
function startWatcher() {
  if (watcher) {
    watcher.close();
  }
  
  watcher = chokidar.watch(path.join(DOCS_PATH, 'SPEC-*.md'), {
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