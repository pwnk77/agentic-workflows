#!/usr/bin/env node

/**
 * Simple API server startup script
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// __dirname is available in CommonJS

const app = express();
const PORT = process.env.PORT || 4567;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve dashboard
app.get('/dashboard', (req, res) => {
  const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
  res.sendFile(dashboardPath);
});

// Basic API endpoints for dashboard
app.get('/api/specs', (req, res) => {
  res.json({
    success: true,
    data: {
      specs: []
    },
    pagination: {
      offset: 0,
      limit: 50,
      total: 0,
      has_more: false
    }
  });
});

app.get('/api/specs/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      total: 0,
      by_status: {
        draft: 0,
        todo: 0,
        'in-progress': 0,
        done: 0
      }
    }
  });
});

app.get('/api/search', (req, res) => {
  res.json({
    success: true,
    data: {
      results: [],
      total: 0
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SpecGen Dashboard API Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});