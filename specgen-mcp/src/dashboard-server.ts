import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { listSpecsTool, searchSpecsTool, dbMetricsTool } from './mcp/tools/file-spec-tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createDashboardServer() {
  const app = express();

  // Enable CORS for all routes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Parse JSON bodies
  app.use(express.json());

  // API Routes for the dashboard
  app.get('/api/specs', async (_req, res) => {
    try {
      const result = await listSpecsTool.handler({
        limit: 100,
        sort_by: 'updated_at',
        sort_order: 'desc'
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/stats', async (_req, res) => {
    try {
      const stats = await dbMetricsTool.handler({});
      res.json({
        project: {
          name: 'File-based Project',
          version: '1.0.0',
          type: 'file-based'
        },
        stats
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
      }
      
      const result = await searchSpecsTool.handler({
        query,
        limit: 50
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Serve the dashboard HTML
  app.get('/', (_req, res) => {
    const dashboardPath = path.join(__dirname, '../public/dashboard.html');
    res.sendFile(dashboardPath);
  });

  // Serve static files from public directory
  app.use('/public', express.static(path.join(__dirname, '../public')));

  return app;
}