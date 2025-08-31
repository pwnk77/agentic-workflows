/**
 * Integration tests for API endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { createAPIServer } from '../../api/server.js';
import { initializeDatabase } from '../../database/data-source.js';
import express from 'express';
import path from 'path';
import fs from 'fs';

describe('API Endpoints', () => {
  let app: express.Application;
  let testDbPath: string;

  beforeEach(async () => {
    // Create a temporary test database
    testDbPath = path.join(__dirname, `api-test-${Date.now()}.sqlite`);
    await initializeDatabase(testDbPath);
    app = createAPIServer();
  });

  afterEach(async () => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('SpecGen MCP Server API');
      expect(response.body.version).toBeDefined();
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('POST /api/specs', () => {
    it('should create a new specification', async () => {
      const specData = {
        title: 'Test API Specification',
        body_md: '# Test API Spec\n\nThis is a test specification created via API.',
        status: 'draft'
      };

      const response = await request(app)
        .post('/api/specs')
        .send(specData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(specData.title);
      expect(response.body.data.body_md).toBe(specData.body_md);
      expect(response.body.data.status).toBe(specData.status);
      expect(response.body.data.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/specs')
        .send({}) // Missing required fields
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('title');
    });

    it('should validate field types', async () => {
      const response = await request(app)
        .post('/api/specs')
        .send({
          title: 123, // Should be string
          body_md: 'Test',
          status: 'invalid-status'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/specs/:id', () => {
    let specId: number;

    beforeEach(async () => {
      // Create a test specification
      const createResponse = await request(app)
        .post('/api/specs')
        .send({
          title: 'Test Specification',
          body_md: '# Test',
          status: 'draft'
        });
      specId = createResponse.body.data.id;
    });

    it('should retrieve specification by ID', async () => {
      const response = await request(app)
        .get(`/api/specs/${specId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(specId);
      expect(response.body.data.title).toBe('Test Specification');
    });

    it('should return 404 for non-existent specification', async () => {
      const response = await request(app)
        .get('/api/specs/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should validate ID parameter', async () => {
      const response = await request(app)
        .get('/api/specs/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/specs/:id', () => {
    let specId: number;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/specs')
        .send({
          title: 'Original Title',
          body_md: '# Original',
          status: 'draft'
        });
      specId = createResponse.body.data.id;
    });

    it('should update specification', async () => {
      const updateData = {
        title: 'Updated Title',
        status: 'todo'
      };

      const response = await request(app)
        .put(`/api/specs/${specId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data.version).toBe(2);
    });

    it('should handle partial updates', async () => {
      const response = await request(app)
        .put(`/api/specs/${specId}`)
        .send({ title: 'Only Title Updated' })
        .expect(200);

      expect(response.body.data.title).toBe('Only Title Updated');
      expect(response.body.data.body_md).toBe('# Original'); // Should remain unchanged
    });

    it('should return 404 for non-existent specification', async () => {
      const response = await request(app)
        .put('/api/specs/999999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/specs/:id', () => {
    let specId: number;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/specs')
        .send({
          title: 'To Be Deleted',
          body_md: '# Delete Me',
          status: 'draft'
        });
      specId = createResponse.body.data.id;
    });

    it('should delete specification', async () => {
      const response = await request(app)
        .delete(`/api/specs/${specId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify it's deleted
      await request(app)
        .get(`/api/specs/${specId}`)
        .expect(404);
    });

    it('should return 404 for non-existent specification', async () => {
      const response = await request(app)
        .delete('/api/specs/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/specs', () => {
    beforeEach(async () => {
      // Create multiple test specifications
      const specs = [
        { title: 'Spec 1', body_md: '# Spec 1', status: 'draft' },
        { title: 'Spec 2', body_md: '# Spec 2', status: 'todo' },
        { title: 'Spec 3', body_md: '# Spec 3', status: 'in-progress' },
        { title: 'Spec 4', body_md: '# Spec 4', status: 'done' },
      ];

      for (const spec of specs) {
        await request(app).post('/api/specs').send(spec);
      }
    });

    it('should list specifications with default pagination', async () => {
      const response = await request(app)
        .get('/api/specs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.specs).toHaveLength(4);
      expect(response.body.data.pagination.total).toBe(4);
      expect(response.body.data.pagination.limit).toBe(50);
      expect(response.body.data.pagination.offset).toBe(0);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/specs?status=draft')
        .expect(200);

      expect(response.body.data.specs).toHaveLength(1);
      expect(response.body.data.specs[0].status).toBe('draft');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/specs?limit=2&offset=1')
        .expect(200);

      expect(response.body.data.specs).toHaveLength(2);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.offset).toBe(1);
      expect(response.body.data.pagination.has_more).toBe(true);
    });

    it('should sort specifications', async () => {
      const response = await request(app)
        .get('/api/specs?sort_by=title&sort_order=asc')
        .expect(200);

      const titles = response.body.data.specs.map((s: any) => s.title);
      expect(titles).toEqual(['Spec 1', 'Spec 2', 'Spec 3', 'Spec 4']);
    });
  });

  describe('GET /api/search', () => {
    beforeEach(async () => {
      // Create searchable specifications
      const specs = [
        {
          title: 'Authentication System',
          body_md: '# Authentication\n\nUser authentication system with OAuth2 integration.',
          status: 'draft'
        },
        {
          title: 'Database Schema',
          body_md: '# Database Design\n\nRelational database schema for user management.',
          status: 'todo'
        },
      ];

      for (const spec of specs) {
        await request(app).post('/api/specs').send(spec);
      }

      // Allow time for search index
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should search specifications', async () => {
      const response = await request(app)
        .get('/api/search?q=authentication')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
      expect(response.body.data.query).toBe('authentication');
      expect(response.body.data.search_time_ms).toBeGreaterThan(0);
    });

    it('should require query parameter', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('query');
    });

    it('should handle pagination in search', async () => {
      const response = await request(app)
        .get('/api/search?q=database&limit=1')
        .expect(200);

      expect(response.body.data.pagination.limit).toBe(1);
      expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    beforeEach(async () => {
      // Create specifications for stats
      const specs = [
        { title: 'Draft Spec', body_md: '# Draft', status: 'draft' },
        { title: 'Todo Spec', body_md: '# Todo', status: 'todo' },
        { title: 'Done Spec', body_md: '# Done', status: 'done' },
      ];

      for (const spec of specs) {
        await request(app).post('/api/specs').send(spec);
      }
    });

    it('should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.recent_activity).toBeDefined();
      expect(response.body.data.system_status).toBeDefined();

      const overview = response.body.data.overview;
      expect(overview.total_specs).toBe(3);
      expect(overview.specs_by_status.draft).toBe(1);
      expect(overview.specs_by_status.todo).toBe(1);
      expect(overview.specs_by_status.done).toBe(1);
    });

    it('should include recent activity', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      const recentActivity = response.body.data.recent_activity;
      expect(recentActivity.recent_specs).toHaveLength(3);
      expect(recentActivity.activity_summary).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.services.database).toBe('connected');
      expect(response.body.services.search).toBe('operational');
    });
  });
});