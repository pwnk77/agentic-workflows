#!/usr/bin/env node

/**
 * Simple dashboard server based on spec-workflow-mcp patterns
 */

import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startDashboard() {
  const app = fastify({ logger: true });
  
  // Serve static files from dashboard build directory
  await app.register(fastifyStatic, {
    root: join(__dirname, 'dashboard', 'build'),
    prefix: '/',
  });

  // API routes
  app.get('/api/test', async () => {
    return { message: 'SpecGen Dashboard Online!' };
  });

  app.get('/api/specs', async () => {
    return { specs: [], total: 0 };
  });

  app.get('/dashboard/api/stats', async () => {
    return {
      success: true,
      stats: {
        total_specs: 0,
        by_status: {
          draft: 0,
          todo: 0,
          'in-progress': 0,
          done: 0
        }
      }
    };
  });

  // SPA fallback for dashboard routes
  app.get('/dashboard', async (request, reply) => {
    const indexPath = join(__dirname, 'dashboard', 'build', 'index.html');
    
    if (!existsSync(indexPath)) {
      return reply.code(404).send({
        error: 'Dashboard build not found',
        message: 'Please build the dashboard: cd dashboard && npm run build'
      });
    }

    const htmlContent = await readFile(indexPath, 'utf-8');
    reply.type('text/html').send(htmlContent);
  });

  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Simple SpecGen Dashboard running at: http://localhost:3001/dashboard');
  } catch (error) {
    console.error('Failed to start dashboard:', error);
    process.exit(1);
  }
}

startDashboard().catch(console.error);