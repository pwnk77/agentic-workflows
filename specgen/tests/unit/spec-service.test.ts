/**
 * Unit tests for SpecService
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { SpecService } from '../../services/spec.service.js';
import { initializeDatabase } from '../../database/data-source.js';
import path from 'path';
import fs from 'fs';

describe('SpecService', () => {
  let specService: SpecService;
  let testDbPath: string;

  beforeEach(async () => {
    // Create a temporary test database
    testDbPath = path.join(__dirname, `test-${Date.now()}.sqlite`);
    await initializeDatabase(testDbPath);
    specService = new SpecService();
  });

  afterEach(async () => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('createSpec', () => {
    it('should create a new specification', async () => {
      const specData = {
        title: 'Test Specification',
        bodyMd: '# Test\n\nThis is a test specification.',
        status: 'draft' as const
      };

      const result = await specService.createSpec(specData);

      expect(result.id).toBeDefined();
      expect(result.title).toBe(specData.title);
      expect(result.bodyMd).toBe(specData.bodyMd);
      expect(result.status).toBe(specData.status);
      expect(result.version).toBe(1);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error for invalid title', async () => {
      const specData = {
        title: '',
        bodyMd: '# Test',
        status: 'draft' as const
      };

      await expect(specService.createSpec(specData)).rejects.toThrow();
    });

    it('should throw error for invalid status', async () => {
      const specData = {
        title: 'Test Spec',
        bodyMd: '# Test',
        status: 'invalid-status' as any
      };

      await expect(specService.createSpec(specData)).rejects.toThrow();
    });
  });

  describe('getSpec', () => {
    it('should retrieve an existing specification', async () => {
      // Create a spec first
      const created = await specService.createSpec({
        title: 'Test Specification',
        bodyMd: '# Test',
        status: 'draft'
      });

      const retrieved = await specService.getSpec(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.title).toBe(created.title);
      expect(retrieved!.bodyMd).toBe(created.bodyMd);
    });

    it('should return null for non-existent specification', async () => {
      const result = await specService.getSpec(999);
      expect(result).toBeNull();
    });
  });

  describe('updateSpec', () => {
    it('should update specification title and status', async () => {
      // Create a spec first
      const created = await specService.createSpec({
        title: 'Original Title',
        bodyMd: '# Original',
        status: 'draft'
      });

      const updateData = {
        title: 'Updated Title',
        status: 'todo' as const
      };

      const updated = await specService.updateSpec(created.id, updateData);

      expect(updated.title).toBe(updateData.title);
      expect(updated.status).toBe(updateData.status);
      expect(updated.bodyMd).toBe(created.bodyMd); // Should remain unchanged
      expect(updated.version).toBe(created.version + 1);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('should throw error for non-existent specification', async () => {
      await expect(specService.updateSpec(999, { title: 'Updated' }))
        .rejects.toThrow('Specification not found');
    });
  });

  describe('deleteSpec', () => {
    it('should delete an existing specification', async () => {
      // Create a spec first
      const created = await specService.createSpec({
        title: 'Test Specification',
        bodyMd: '# Test',
        status: 'draft'
      });

      await specService.deleteSpec(created.id);

      // Verify it's deleted
      const retrieved = await specService.getSpec(created.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error for non-existent specification', async () => {
      await expect(specService.deleteSpec(999))
        .rejects.toThrow('Specification not found');
    });
  });

  describe('listSpecs', () => {
    beforeEach(async () => {
      // Create test specs
      await Promise.all([
        specService.createSpec({ title: 'Spec 1', bodyMd: '# Spec 1', status: 'draft' }),
        specService.createSpec({ title: 'Spec 2', bodyMd: '# Spec 2', status: 'todo' }),
        specService.createSpec({ title: 'Spec 3', bodyMd: '# Spec 3', status: 'in-progress' }),
        specService.createSpec({ title: 'Spec 4', bodyMd: '# Spec 4', status: 'done' }),
      ]);
    });

    it('should list specifications with default pagination', async () => {
      const result = await specService.listSpecs({});

      expect(result.specs).toHaveLength(4);
      expect(result.total).toBe(4);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should filter specifications by status', async () => {
      const result = await specService.listSpecs({ status: 'draft' });

      expect(result.specs).toHaveLength(1);
      expect(result.specs[0].status).toBe('draft');
      expect(result.total).toBe(1);
    });

    it('should paginate specifications', async () => {
      const result = await specService.listSpecs({ limit: 2, offset: 1 });

      expect(result.specs).toHaveLength(2);
      expect(result.limit).toBe(2);
      expect(result.offset).toBe(1);
      expect(result.hasMore).toBe(true);
    });

    it('should sort specifications', async () => {
      const result = await specService.listSpecs({
        sortBy: 'title',
        sortOrder: 'ASC'
      });

      expect(result.specs[0].title).toBe('Spec 1');
      expect(result.specs[3].title).toBe('Spec 4');
    });
  });

  describe('getSpecStats', () => {
    beforeEach(async () => {
      // Create test specs with different statuses
      await Promise.all([
        specService.createSpec({ title: 'Draft 1', bodyMd: '# Draft 1', status: 'draft' }),
        specService.createSpec({ title: 'Draft 2', bodyMd: '# Draft 2', status: 'draft' }),
        specService.createSpec({ title: 'Todo 1', bodyMd: '# Todo 1', status: 'todo' }),
        specService.createSpec({ title: 'In Progress 1', bodyMd: '# In Progress 1', status: 'in-progress' }),
        specService.createSpec({ title: 'Done 1', bodyMd: '# Done 1', status: 'done' }),
      ]);
    });

    it('should return specification statistics', async () => {
      const stats = await specService.getSpecStats();

      expect(stats.total).toBe(5);
      expect(stats.byStatus.draft).toBe(2);
      expect(stats.byStatus.todo).toBe(1);
      expect(stats.byStatus['in-progress']).toBe(1);
      expect(stats.byStatus.done).toBe(1);
    });
  });
});