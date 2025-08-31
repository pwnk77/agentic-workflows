import { SpecService } from '../../../src/services/spec.service';
import { DatabaseConnection } from '../../../src/database/connection';
import { ProjectManager } from '../../../src/database/project-manager';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { getTempProjectPath, cleanupTempProject } from '../../setup';

// Mock ProjectManager to use test project path
jest.mock('../../../src/database/project-manager');
const mockProjectManager = ProjectManager as jest.Mocked<typeof ProjectManager>;

describe('SpecService', () => {
  let testProjectPath: string;

  beforeEach(() => {
    testProjectPath = getTempProjectPath('spec-service-test');
    
    // Setup project structure
    const specgenDir = join(testProjectPath, '.specgen');
    mkdirSync(specgenDir, { recursive: true });
    
    // Mock project detection
    mockProjectManager.detectProject.mockReturnValue(testProjectPath);
    mockProjectManager.getDatabasePath.mockReturnValue(join(specgenDir, 'specgen.sqlite'));
    mockProjectManager.ensureSpecgenDir.mockReturnValue(specgenDir);
    
    // Initialize database
    DatabaseConnection.getConnection(testProjectPath);
  });

  afterEach(() => {
    DatabaseConnection.closeAllConnections();
    cleanupTempProject(testProjectPath);
    jest.clearAllMocks();
  });

  describe('createSpec', () => {
    it('should create a spec with all fields', () => {
      const specData = {
        title: 'Test Specification',
        body_md: '# Test\n\nThis is a test spec.',
        status: 'draft' as const,
        feature_group: 'testing'
      };

      const spec = SpecService.createSpec(specData);

      expect(spec.id).toBeGreaterThan(0);
      expect(spec.title).toBe(specData.title);
      expect(spec.body_md).toBe(specData.body_md);
      expect(spec.status).toBe(specData.status);
      expect(spec.feature_group).toBe(specData.feature_group);
      expect(spec.created_at).toBeDefined();
      expect(spec.updated_at).toBeDefined();
    });

    it('should auto-detect feature group when not provided', () => {
      const specData = {
        title: 'SpecGen Enhancement',
        body_md: 'This spec is about improving specgen functionality.'
      };

      const spec = SpecService.createSpec(specData);

      expect(spec.feature_group).toBe('specgen');
    });

    it('should default status to draft when not provided', () => {
      const specData = {
        title: 'Default Status Test',
        body_md: 'Testing default status behavior.'
      };

      const spec = SpecService.createSpec(specData);

      expect(spec.status).toBe('draft');
    });
  });

  describe('updateSpec', () => {
    let createdSpecId: number;

    beforeEach(() => {
      const spec = SpecService.createSpec({
        title: 'Original Title',
        body_md: 'Original content',
        status: 'draft'
      });
      createdSpecId = spec.id;
    });

    it('should update spec title', () => {
      const updatedSpec = SpecService.updateSpec(createdSpecId, {
        title: 'Updated Title'
      });

      expect(updatedSpec).not.toBeNull();
      expect(updatedSpec!.title).toBe('Updated Title');
      expect(updatedSpec!.body_md).toBe('Original content'); // Unchanged
    });

    it('should update spec body', () => {
      const updatedSpec = SpecService.updateSpec(createdSpecId, {
        body_md: 'Updated content'
      });

      expect(updatedSpec).not.toBeNull();
      expect(updatedSpec!.body_md).toBe('Updated content');
      expect(updatedSpec!.title).toBe('Original Title'); // Unchanged
    });

    it('should update spec status', () => {
      const updatedSpec = SpecService.updateSpec(createdSpecId, {
        status: 'todo'
      });

      expect(updatedSpec).not.toBeNull();
      expect(updatedSpec!.status).toBe('todo');
    });

    it('should return null for non-existent spec', () => {
      const updatedSpec = SpecService.updateSpec(99999, {
        title: 'Should not work'
      });

      expect(updatedSpec).toBeNull();
    });

    it('should return original spec when no updates provided', () => {
      const updatedSpec = SpecService.updateSpec(createdSpecId, {});

      expect(updatedSpec).not.toBeNull();
      expect(updatedSpec!.title).toBe('Original Title');
      expect(updatedSpec!.body_md).toBe('Original content');
    });
  });

  describe('getSpecById', () => {
    it('should retrieve existing spec', () => {
      const originalSpec = SpecService.createSpec({
        title: 'Retrieve Test',
        body_md: 'Content for retrieval test'
      });

      const retrievedSpec = SpecService.getSpecById(originalSpec.id);

      expect(retrievedSpec).not.toBeNull();
      expect(retrievedSpec!.id).toBe(originalSpec.id);
      expect(retrievedSpec!.title).toBe(originalSpec.title);
    });

    it('should return null for non-existent spec', () => {
      const spec = SpecService.getSpecById(99999);
      expect(spec).toBeNull();
    });
  });

  describe('deleteSpec', () => {
    it('should delete existing spec', () => {
      const spec = SpecService.createSpec({
        title: 'To Delete',
        body_md: 'This will be deleted'
      });

      const deleted = SpecService.deleteSpec(spec.id);
      expect(deleted).toBe(true);

      // Verify deletion
      const retrievedSpec = SpecService.getSpecById(spec.id);
      expect(retrievedSpec).toBeNull();
    });

    it('should return false for non-existent spec', () => {
      const deleted = SpecService.deleteSpec(99999);
      expect(deleted).toBe(false);
    });
  });

  describe('listSpecs', () => {
    beforeEach(() => {
      // Create test specs
      SpecService.createSpec({
        title: 'Draft Spec',
        body_md: 'Draft content',
        status: 'draft',
        feature_group: 'testing'
      });

      SpecService.createSpec({
        title: 'Todo Spec',
        body_md: 'Todo content',
        status: 'todo',
        feature_group: 'testing'
      });

      SpecService.createSpec({
        title: 'Learning Spec',
        body_md: 'Learning content',
        status: 'draft',
        feature_group: 'learning'
      });
    });

    it('should list all specs when no filters applied', () => {
      const result = SpecService.listSpecs();

      expect(result.specs.length).toBe(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.has_more).toBe(false);
    });

    it('should filter specs by status', () => {
      const result = SpecService.listSpecs({ status: 'draft' });

      expect(result.specs.length).toBe(2);
      expect(result.specs.every(spec => spec.status === 'draft')).toBe(true);
    });

    it('should filter specs by feature group', () => {
      const result = SpecService.listSpecs({ feature_group: 'testing' });

      expect(result.specs.length).toBe(2);
      expect(result.specs.every(spec => spec.feature_group === 'testing')).toBe(true);
    });

    it('should handle pagination', () => {
      const result = SpecService.listSpecs({ limit: 2, offset: 0 });

      expect(result.specs.length).toBe(2);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.has_more).toBe(true);
    });

    it('should sort specs correctly', () => {
      const result = SpecService.listSpecs({ 
        sort_by: 'title', 
        sort_order: 'asc' 
      });

      expect(result.specs[0].title).toBe('Draft Spec');
      expect(result.specs[1].title).toBe('Learning Spec');
      expect(result.specs[2].title).toBe('Todo Spec');
    });
  });

  describe('searchSpecs', () => {
    beforeEach(() => {
      // Create searchable specs
      SpecService.createSpec({
        title: 'Authentication System',
        body_md: 'User login and authentication functionality'
      });

      SpecService.createSpec({
        title: 'Payment Processing',
        body_md: 'Handle user payments and billing'
      });

      SpecService.createSpec({
        title: 'User Management',
        body_md: 'Manage user accounts and profiles'
      });
    });

    it('should search specs by title', () => {
      const result = SpecService.searchSpecs('Authentication');

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].title).toContain('Authentication');
    });

    it('should search specs by content', () => {
      const result = SpecService.searchSpecs('payment');

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results.some(spec => 
        spec.title.toLowerCase().includes('payment') || 
        spec.body_md.toLowerCase().includes('payment')
      )).toBe(true);
    });

    it('should handle empty search results', () => {
      const result = SpecService.searchSpecs('nonexistent');

      expect(result.results.length).toBe(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should respect search options', () => {
      const result = SpecService.searchSpecs('user', { limit: 1 });

      expect(result.results.length).toBeLessThanOrEqual(1);
      expect(result.pagination.limit).toBe(1);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      // Create specs with various statuses and groups
      SpecService.createSpec({
        title: 'Draft 1',
        body_md: 'Content',
        status: 'draft',
        feature_group: 'testing'
      });

      SpecService.createSpec({
        title: 'Todo 1',
        body_md: 'Content',
        status: 'todo',
        feature_group: 'testing'
      });

      SpecService.createSpec({
        title: 'Done 1',
        body_md: 'Content',
        status: 'done',
        feature_group: 'learning'
      });
    });

    it('should return basic stats', () => {
      const stats = SpecService.getStats(false);

      expect(stats.total_specs).toBe(3);
      expect(stats.by_status).toEqual({
        draft: 1,
        todo: 1,
        done: 1
      });
      expect(stats.by_group).toEqual({
        testing: 2,
        learning: 1
      });
    });

    it('should include detailed stats when requested', () => {
      const stats = SpecService.getStats(true);

      expect(stats.total_specs).toBe(3);
      expect(stats.recent_activity).toBeDefined();
      expect(stats.latest_specs).toBeDefined();
      expect(stats.latest_specs!.length).toBeLessThanOrEqual(5);
    });
  });
});