const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');

// Create a test version of the server with mocked paths
function createTestApp() {
  const express = require('express');
  const app = express();
  
  // Mock paths for testing
  const DOCS_PATH = path.resolve(__dirname, '../__test_docs__');
  const METADATA_FILE = path.join(DOCS_PATH, '.spec-metadata.json');
  
  let metadataCache = {};
  
  // Middleware
  app.use(express.json());
  
  // Helper functions (simplified versions from server.js)
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
          
          specs[file] = {
            filename: file,
            title,
            category: detectCategory(content),
            status: detectStatus(content),
            priority: detectPriority(content),
            modified: stats.mtime.toISOString(),
            created: stats.birthtime.toISOString()
          };
        }
      }
      
      const metadata = {
        metadata_version: "1.0.0",
        last_full_scan: new Date().toISOString(),
        specs: specs
      };
      
      metadataCache = specs;
      await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
      return specs;
    } catch (error) {
      console.error('Error scanning docs:', error);
      return {};
    }
  }
  
  function detectCategory(content) {
    const contentLower = content.toLowerCase();
    if (contentLower.includes('api')) return 'API';
    if (contentLower.includes('ui')) return 'UI';
    if (contentLower.includes('database')) return 'Database';
    return 'General';
  }
  
  function detectStatus(content) {
    const contentLower = content.toLowerCase();
    if (contentLower.includes('completed')) return 'completed';
    if (contentLower.includes('in-progress')) return 'in-progress';
    if (contentLower.includes('draft')) return 'draft';
    return 'todo';
  }
  
  function detectPriority(content) {
    const contentLower = content.toLowerCase();
    if (contentLower.includes('high priority')) return 'high';
    if (contentLower.includes('low priority')) return 'low';
    return 'medium';
  }
  
  function generateFilename(title) {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return `SPEC-${timestamp}-${slug}.md`;
  }
  
  // API Routes
  app.get('/api/specs', async (req, res) => {
    try {
      const specs = await scanDocs();
      res.json(Object.values(specs));
    } catch (err) {
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
      res.status(404).json({ error: 'Spec not found' });
    }
  });
  
  app.post('/api/specs', async (req, res) => {
    try {
      const { title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      
      const filename = generateFilename(title);
      const filePath = path.join(DOCS_PATH, filename);
      
      await fs.writeFile(filePath, content);
      await scanDocs();
      
      res.json({ filename, message: 'Spec created successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.put('/api/specs/:filename', async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      const filePath = path.join(DOCS_PATH, req.params.filename);
      await fs.writeFile(filePath, content);
      await scanDocs();
      
      res.json({ message: 'Spec updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.delete('/api/specs/:filename', async (req, res) => {
    try {
      const filePath = path.join(DOCS_PATH, req.params.filename);
      await fs.unlink(filePath);
      await scanDocs();
      
      res.json({ message: 'Spec deleted successfully' });
    } catch (err) {
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
      res.status(500).json({ error: err.message });
    }
  });
  
  return app;
}

describe('SpecGen Dashboard API', () => {
  let app;
  const testDocsPath = path.resolve(__dirname, '../__test_docs__');
  
  beforeAll(async () => {
    app = createTestApp();
    
    // Create test directory
    await fs.mkdir(testDocsPath, { recursive: true });
    
    // Create sample spec files
    await fs.writeFile(
      path.join(testDocsPath, 'SPEC-20250101-test-api.md'),
      `# Test API Specification

## Description
API for testing purposes with high priority implementation.

## Endpoints
- GET /api/test
- POST /api/test

Status: in-progress
Priority: high priority
`
    );
    
    await fs.writeFile(
      path.join(testDocsPath, 'SPEC-20250102-ui-dashboard.md'),
      `# UI Dashboard Component

## Overview
Frontend dashboard component implementation.

## Features
- Data visualization
- User interface components
- Interactive elements

Status: completed
`
    );
  });
  
  afterAll(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testDocsPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });
  
  describe('GET /api/specs', () => {
    it('should return list of all specifications', async () => {
      const response = await request(app)
        .get('/api/specs')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const spec = response.body[0];
      expect(spec).toHaveProperty('filename');
      expect(spec).toHaveProperty('title');
      expect(spec).toHaveProperty('category');
      expect(spec).toHaveProperty('status');
      expect(spec).toHaveProperty('priority');
    });
    
    it('should include correct metadata for specs', async () => {
      const response = await request(app)
        .get('/api/specs')
        .expect(200);
      
      const apiSpec = response.body.find(spec => spec.filename.includes('test-api'));
      expect(apiSpec.category).toBe('API');
      expect(apiSpec.status).toBe('in-progress');
      expect(apiSpec.priority).toBe('high');
      
      const uiSpec = response.body.find(spec => spec.filename.includes('ui-dashboard'));
      expect(uiSpec.category).toBe('UI');
      expect(uiSpec.status).toBe('completed');
    });
  });
  
  describe('GET /api/specs/:filename', () => {
    it('should return specification content', async () => {
      const response = await request(app)
        .get('/api/specs/SPEC-20250101-test-api.md')
        .expect(200);
      
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.content).toContain('# Test API Specification');
      expect(response.body.content).toContain('GET /api/test');
    });
    
    it('should return 404 for non-existent specification', async () => {
      const response = await request(app)
        .get('/api/specs/non-existent-spec.md')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Spec not found');
    });
  });
  
  describe('POST /api/specs', () => {
    it('should create new specification', async () => {
      const newSpec = {
        title: 'Test Integration Spec',
        content: `# Test Integration Spec

## Description
Integration testing specification

## Requirements
- API integration
- Database integration
- Frontend integration

Status: draft
`
      };
      
      const response = await request(app)
        .post('/api/specs')
        .send(newSpec)
        .expect(200);
      
      expect(response.body).toHaveProperty('filename');
      expect(response.body).toHaveProperty('message', 'Spec created successfully');
      expect(response.body.filename).toContain('test-integration-spec');
      
      // Verify the file was created
      const createdFile = path.join(testDocsPath, response.body.filename);
      const fileContent = await fs.readFile(createdFile, 'utf-8');
      expect(fileContent).toContain('# Test Integration Spec');
    });
    
    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/specs')
        .send({ content: 'Some content' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Title and content are required');
    });
    
    it('should return 400 when content is missing', async () => {
      const response = await request(app)
        .post('/api/specs')
        .send({ title: 'Some title' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Title and content are required');
    });
  });
  
  describe('PUT /api/specs/:filename', () => {
    it('should update existing specification', async () => {
      // First create a separate spec for updating to avoid affecting other tests
      const testSpec = {
        title: 'Spec For Updating',
        content: `# Spec For Updating

Original content for testing update functionality.

Status: draft
`
      };
      
      const createResponse = await request(app)
        .post('/api/specs')
        .send(testSpec);
      
      const filename = createResponse.body.filename;
      
      const updatedContent = `# Spec For Updating - Updated

## Description
Updated specification with new features.

## New Features
- Feature 1
- Feature 2
- Feature 3

Status: completed
`;
      
      const response = await request(app)
        .put(`/api/specs/${filename}`)
        .send({ content: updatedContent })
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Spec updated successfully');
      
      // Verify the file was updated
      const updatedFile = path.join(testDocsPath, filename);
      const fileContent = await fs.readFile(updatedFile, 'utf-8');
      expect(fileContent).toContain('Updated specification');
      expect(fileContent).toContain('Feature 1');
    });
    
    it('should return 400 when content is missing', async () => {
      const response = await request(app)
        .put('/api/specs/SPEC-20250101-test-api.md')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Content is required');
    });
  });
  
  describe('DELETE /api/specs/:filename', () => {
    it('should delete specification', async () => {
      // First create a spec to delete
      const testSpec = {
        title: 'Spec To Delete',
        content: '# Spec To Delete\n\nThis spec will be deleted.'
      };
      
      const createResponse = await request(app)
        .post('/api/specs')
        .send(testSpec);
      
      const filename = createResponse.body.filename;
      
      // Now delete it
      const response = await request(app)
        .delete(`/api/specs/${filename}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Spec deleted successfully');
      
      // Verify the file was deleted
      const filePath = path.join(testDocsPath, filename);
      await expect(fs.access(filePath)).rejects.toThrow();
    });
    
    it('should return 500 for non-existent file deletion', async () => {
      const response = await request(app)
        .delete('/api/specs/non-existent-file.md')
        .expect(500);
      
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/refresh-metadata', () => {
    it('should refresh metadata and return count', async () => {
      const response = await request(app)
        .post('/api/refresh-metadata')
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Metadata refreshed successfully');
      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
      expect(response.body.count).toBeGreaterThan(0);
    });
  });
  
  describe('Category Detection', () => {
    it('should correctly detect API category', async () => {
      const response = await request(app).get('/api/specs');
      const apiSpec = response.body.find(spec => spec.filename.includes('test-api'));
      expect(apiSpec.category).toBe('API');
    });
    
    it('should correctly detect UI category', async () => {
      const response = await request(app).get('/api/specs');
      const uiSpec = response.body.find(spec => spec.filename.includes('ui-dashboard'));
      expect(uiSpec.category).toBe('UI');
    });
    
    it('should default to General for unrecognized content', async () => {
      const generalSpec = {
        title: 'General Documentation',
        content: `# General Documentation

This is general documentation without specific keywords.

## Content
Regular documentation content.
`
      };
      
      await request(app).post('/api/specs').send(generalSpec);
      const response = await request(app).get('/api/specs');
      const spec = response.body.find(spec => spec.title === 'General Documentation');
      expect(spec.category).toBe('General');
    });
  });
  
  describe('Status Detection', () => {
    it('should detect completed status', async () => {
      const response = await request(app).get('/api/specs');
      const completedSpec = response.body.find(spec => spec.status === 'completed');
      expect(completedSpec).toBeDefined();
    });
    
    it('should detect in-progress status', async () => {
      const response = await request(app).get('/api/specs');
      // Look for the specific spec we created with in-progress status
      const inProgressSpec = response.body.find(spec => 
        spec.filename.includes('test-api') && spec.status === 'in-progress'
      );
      expect(inProgressSpec).toBeDefined();
    });
    
    it('should default to todo for unspecified status', async () => {
      const noStatusSpec = {
        title: 'No Status Spec',
        content: `# No Status Spec

This spec has no explicit status.
`
      };
      
      await request(app).post('/api/specs').send(noStatusSpec);
      const response = await request(app).get('/api/specs');
      const spec = response.body.find(spec => spec.title === 'No Status Spec');
      expect(spec.status).toBe('todo');
    });
  });
});