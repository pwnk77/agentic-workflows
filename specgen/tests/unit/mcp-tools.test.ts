/**
 * Unit tests for MCP Tools
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { specTools } from '../../mcp/tools/spec-tools.js';
import { initializeDatabase } from '../../database/data-source.js';
import path from 'path';
import fs from 'fs';

describe('MCP Tools', () => {
  let testDbPath: string;

  beforeEach(async () => {
    // Create a temporary test database
    testDbPath = path.join(__dirname, `mcp-test-${Date.now()}.sqlite`);
    await initializeDatabase(testDbPath);
  });

  afterEach(async () => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('create_spec tool', () => {
    it('should have correct tool definition', () => {
      const createTool = specTools.find(tool => tool.name === 'create_spec');
      
      expect(createTool).toBeDefined();
      expect(createTool!.description).toContain('Create a new specification');
      expect(createTool!.inputSchema.properties).toHaveProperty('title');
      expect(createTool!.inputSchema.properties).toHaveProperty('body_md');
      expect(createTool!.inputSchema.properties).toHaveProperty('status');
    });

    it('should create specification with valid input', async () => {
      const createTool = specTools.find(tool => tool.name === 'create_spec')!;
      
      const result = await createTool.handler({
        title: 'Test Specification',
        body_md: '# Test Spec\n\nThis is a test.',
        status: 'draft'
      });

      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content);
      expect(content.success).toBe(true);
      expect(content.spec.title).toBe('Test Specification');
      expect(content.spec.id).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const createTool = specTools.find(tool => tool.name === 'create_spec')!;
      
      const result = await createTool.handler({
        title: '', // Invalid empty title
        body_md: '# Test',
        status: 'draft'
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('Validation failed');
    });

    it('should use default status if not provided', async () => {
      const createTool = specTools.find(tool => tool.name === 'create_spec')!;
      
      const result = await createTool.handler({
        title: 'Test Specification',
        body_md: '# Test Spec'
      });

      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content);
      expect(content.spec.status).toBe('draft');
    });
  });

  describe('get_spec tool', () => {
    let testSpecId: number;

    beforeEach(async () => {
      // Create a test specification
      const createTool = specTools.find(tool => tool.name === 'create_spec')!;
      const result = await createTool.handler({
        title: 'Test Specification',
        body_md: '# Test',
        status: 'draft'
      });
      const content = JSON.parse(result.content);
      testSpecId = content.spec.id;
    });

    it('should retrieve existing specification', async () => {
      const getTool = specTools.find(tool => tool.name === 'get_spec')!;
      
      const result = await getTool.handler({
        spec_id: testSpecId
      });

      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content);
      expect(content.success).toBe(true);
      expect(content.spec.id).toBe(testSpecId);
      expect(content.spec.title).toBe('Test Specification');
    });

    it('should handle non-existent specification', async () => {
      const getTool = specTools.find(tool => tool.name === 'get_spec')!;
      
      const result = await getTool.handler({
        spec_id: 999999
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('not found');
    });

    it('should validate spec_id parameter', async () => {
      const getTool = specTools.find(tool => tool.name === 'get_spec')!;
      
      const result = await getTool.handler({
        spec_id: 'invalid' as any
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('Validation failed');
    });
  });

  describe('update_spec tool', () => {
    let testSpecId: number;

    beforeEach(async () => {
      // Create a test specification
      const createTool = specTools.find(tool => tool.name === 'create_spec')!;
      const result = await createTool.handler({
        title: 'Original Title',
        body_md: '# Original',
        status: 'draft'
      });
      const content = JSON.parse(result.content);
      testSpecId = content.spec.id;
    });

    it('should update specification', async () => {
      const updateTool = specTools.find(tool => tool.name === 'update_spec')!;
      
      const result = await updateTool.handler({
        spec_id: testSpecId,
        title: 'Updated Title',
        status: 'todo'
      });

      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content);
      expect(content.success).toBe(true);
      expect(content.spec.title).toBe('Updated Title');
      expect(content.spec.status).toBe('todo');
      expect(content.spec.version).toBe(2);
    });

    it('should require at least one update field', async () => {
      const updateTool = specTools.find(tool => tool.name === 'update_spec')!;
      
      const result = await updateTool.handler({
        spec_id: testSpecId
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('at least one field');
    });
  });

  describe('list_specs tool', () => {
    beforeEach(async () => {
      // Create multiple test specifications
      const createTool = specTools.find(tool => tool.name === 'create_spec')!;
      await Promise.all([
        createTool.handler({ title: 'Spec 1', body_md: '# Spec 1', status: 'draft' }),
        createTool.handler({ title: 'Spec 2', body_md: '# Spec 2', status: 'todo' }),
        createTool.handler({ title: 'Spec 3', body_md: '# Spec 3', status: 'in-progress' }),
      ]);
    });

    it('should list specifications with default parameters', async () => {
      const listTool = specTools.find(tool => tool.name === 'list_specs')!;
      
      const result = await listTool.handler({});

      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content);
      expect(content.success).toBe(true);
      expect(content.specs).toHaveLength(3);
      expect(content.pagination.total).toBe(3);
    });

    it('should filter by status', async () => {
      const listTool = specTools.find(tool => tool.name === 'list_specs')!;
      
      const result = await listTool.handler({
        status: 'draft'
      });

      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content);
      expect(content.specs).toHaveLength(1);
      expect(content.specs[0].status).toBe('draft');
    });

    it('should handle pagination', async () => {
      const listTool = specTools.find(tool => tool.name === 'list_specs')!;
      
      const result = await listTool.handler({
        limit: 2,
        offset: 1
      });

      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content);
      expect(content.specs).toHaveLength(2);
      expect(content.pagination.limit).toBe(2);
      expect(content.pagination.offset).toBe(1);
    });
  });

  describe('search_specs tool', () => {
    beforeEach(async () => {
      // Create searchable test specifications
      const createTool = specTools.find(tool => tool.name === 'create_spec')!;
      await Promise.all([
        createTool.handler({
          title: 'Authentication System',
          body_md: '# Auth\n\nUser authentication with OAuth2.',
          status: 'draft'
        }),
        createTool.handler({
          title: 'Database Design',
          body_md: '# Database\n\nRelational database schema design.',
          status: 'todo'
        }),
      ]);
      
      // Allow time for search index
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should search specifications', async () => {
      const searchTool = specTools.find(tool => tool.name === 'search_specs')!;
      
      const result = await searchTool.handler({
        query: 'authentication'
      });

      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content);
      expect(content.success).toBe(true);
      expect(content.results.length).toBeGreaterThan(0);
      expect(content.query).toBe('authentication');
    });

    it('should validate required query parameter', async () => {
      const searchTool = specTools.find(tool => tool.name === 'search_specs')!;
      
      const result = await searchTool.handler({} as any);

      expect(result.isError).toBe(true);
      expect(result.content).toContain('Validation failed');
    });
  });

  describe('launch_dashboard tool', () => {
    it('should have correct tool definition', () => {
      const launchTool = specTools.find(tool => tool.name === 'launch_dashboard');
      
      expect(launchTool).toBeDefined();
      expect(launchTool!.description).toContain('Launch the interactive web dashboard');
      expect(launchTool!.inputSchema.properties).toHaveProperty('port');
      expect(launchTool!.inputSchema.properties).toHaveProperty('open_browser');
    });

    it('should validate port parameter', async () => {
      const launchTool = specTools.find(tool => tool.name === 'launch_dashboard')!;
      
      // Test invalid port
      const result = await launchTool.handler({
        port: 999 // Below minimum port
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('Validation failed');
    });
  });
});