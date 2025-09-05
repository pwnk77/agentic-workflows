#!/usr/bin/env node

import express from 'express';
import { createFileDashboardServer } from './dist/api/file-dashboard-server.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting SpecGen Dashboard Server...\n');

const app = createFileDashboardServer();

// Default route serves the dashboard (before static middleware)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add CORS headers for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const port = process.env.PORT || 4567;

app.listen(port, () => {
  console.log(`🚀 SpecGen File-Based Dashboard Server started successfully!

📊 Dashboard:     http://localhost:${port}
🔍 API Health:    http://localhost:${port}/health
📈 API Stats:     http://localhost:${port}/api/stats
🔧 API Specs:     http://localhost:${port}/api/specs

✅ Features Available:
✅ File-based storage (no SQLite corruption!)
✅ Automatic markdown file organization  
✅ Intelligent category detection
✅ Full-text search with TF-IDF scoring
✅ Complete CRUD operations
✅ Backward compatibility with existing MCP tools

📁 Specs Location: ${process.cwd()}/docs/
📋 Metadata File:  ${process.cwd()}/specs-metadata.json

Ready to manage your specifications!
`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  process.exit(0);
});