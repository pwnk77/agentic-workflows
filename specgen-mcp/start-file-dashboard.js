#!/usr/bin/env node

import express from 'express';
import { createFileDashboardServer } from './src/api/file-dashboard-server.ts';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createFileDashboardServer();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route serves the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`
🚀 SpecGen File-Based Dashboard Server started!

📊 Dashboard:     http://localhost:${port}
🔍 API Health:    http://localhost:${port}/health
📈 API Stats:     http://localhost:${port}/api/stats
🔧 Maintenance:   http://localhost:${port}/api/maintenance/health

Features:
✅ File-based storage (no SQLite corruption!)
✅ Automatic markdown file organization
✅ Intelligent category detection
✅ Full-text search with TF-IDF scoring
✅ Complete CRUD operations
✅ Backward compatibility with existing MCP tools

Ready to manage your specifications!
`);
});