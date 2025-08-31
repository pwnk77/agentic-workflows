import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { specTools } from '../../src/mcp/tools/spec-tools';
import { SpecGenResourceHandler } from '../../src/mcp/resources/spec-resource';
import { DatabaseConnection } from '../../src/database/connection';
import { ProjectManager } from '../../src/database/project-manager';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getTempProjectPath, cleanupTempProject } from '../setup';

// Mock ProjectManager to use test project path
jest.mock('../../src/database/project-manager');
const mockProjectManager = ProjectManager as jest.Mocked<typeof ProjectManager>;

describe('MCP Integration Tests', () => {
  let testProjectPath: string;

  beforeEach(() => {
    testProjectPath = getTempProjectPath('mcp-integration-test');
    
    // Setup project structure
    const specgenDir = join(testProjectPath, '.specgen');
    mkdirSync(specgenDir, { recursive: true });
    
    // Create package.json for project info
    writeFileSync(join(testProjectPath, 'package.json'), JSON.stringify({
      name: 'test-mcp-project',
      version: '1.0.0'
    }));
    
    // Mock project detection
    mockProjectManager.detectProject.mockReturnValue(testProjectPath);
    mockProjectManager.getDatabasePath.mockReturnValue(join(specgenDir, 'specgen.sqlite'));
    mockProjectManager.ensureSpecgenDir.mockReturnValue(specgenDir);
    mockProjectManager.isProjectInitialized.mockReturnValue(true);
    mockProjectManager.getProjectInfo.mockReturnValue({
      name: 'test-mcp-project',
      version: '1.0.0',
      root: testProjectPath,
      specgenDir,
      databasePath: join(specgenDir, 'specgen.sqlite'),
      isInitialized: true
    });
    
    // Initialize database
    DatabaseConnection.getConnection(testProjectPath);
  });

  afterEach(() => {
    DatabaseConnection.closeAllConnections();
    cleanupTempProject(testProjectPath);
    jest.clearAllMocks();
  });

  describe('MCP Tools Integration', () => {
    describe('create_spec tool', () => {
      it('should create spec successfully', async () => {
        const createTool = specTools.find(t => t.name === 'create_spec')!;
        
        const result = await createTool.handler({
          title: 'Test Integration Spec',
          body_md: '# Test\n\nThis is an integration test spec.',
          status: 'draft',
          feature_group: 'testing'
        });

        expect(result.success).toBe(true);
        expect(result.spec).toBeDefined();
        expect(result.spec.title).toBe('Test Integration Spec');
        expect(result.spec.status).toBe('draft');
        expect(result.spec.feature_group).toBe('testing');
      });

      it('should handle validation errors', async () => {
        const createTool = specTools.find(t => t.name === 'create_spec')!;
        
        const result = await createTool.handler({
          title: '', // Invalid: empty title
          body_md: 'Content'
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('update_spec tool', () => {
      let specId: number;

      beforeEach(async () => {
        const createTool = specTools.find(t => t.name === 'create_spec')!;
        const createResult = await createTool.handler({
          title: 'Original Title',
          body_md: 'Original content'
        });
        specId = createResult.spec.id;
      });

      it('should update spec successfully', async () => {
        const updateTool = specTools.find(t => t.name === 'update_spec')!;
        
        const result = await updateTool.handler({
          spec_id: specId,
          title: 'Updated Title',
          status: 'todo'
        });

        expect(result.success).toBe(true);
        expect(result.spec.title).toBe('Updated Title');
        expect(result.spec.status).toBe('todo');
      });

      it('should handle non-existent spec', async () => {
        const updateTool = specTools.find(t => t.name === 'update_spec')!;
        
        const result = await updateTool.handler({
          spec_id: 99999,
          title: 'Updated Title'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    describe('get_spec tool', () => {
      let specId: number;

      beforeEach(async () => {
        const createTool = specTools.find(t => t.name === 'create_spec')!;
        const createResult = await createTool.handler({
          title: 'Retrieve Test',
          body_md: 'Content for retrieval'
        });
        specId = createResult.spec.id;
      });

      it('should retrieve spec successfully', async () => {
        const getTool = specTools.find(t => t.name === 'get_spec')!;
        
        const result = await getTool.handler({ spec_id: specId });

        expect(result.success).toBe(true);
        expect(result.spec).toBeDefined();
        expect(result.spec.id).toBe(specId);
        expect(result.spec.title).toBe('Retrieve Test');
      });

      it('should handle non-existent spec', async () => {
        const getTool = specTools.find(t => t.name === 'get_spec')!;
        
        const result = await getTool.handler({ spec_id: 99999 });

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    describe('list_specs tool', () => {
      beforeEach(async () => {
        const createTool = specTools.find(t => t.name === 'create_spec')!;
        
        // Create test specs
        await createTool.handler({
          title: 'Draft Spec',
          body_md: 'Draft content',
          status: 'draft',
          feature_group: 'testing'
        });

        await createTool.handler({
          title: 'Todo Spec',
          body_md: 'Todo content',
          status: 'todo',
          feature_group: 'testing'
        });

        await createTool.handler({
          title: 'Learning Spec',
          body_md: 'Learning content',
          status: 'draft',
          feature_group: 'learning'
        });
      });

      it('should list all specs', async () => {
        const listTool = specTools.find(t => t.name === 'list_specs')!;
        
        const result = await listTool.handler({});

        expect(result.success).toBe(true);
        expect(result.specs).toHaveLength(3);
        expect(result.pagination.total).toBe(3);
      });

      it('should filter by status', async () => {
        const listTool = specTools.find(t => t.name === 'list_specs')!;
        
        const result = await listTool.handler({ status: 'draft' });

        expect(result.success).toBe(true);
        expect(result.specs).toHaveLength(2);
        expect(result.specs.every(s => s.status === 'draft')).toBe(true);
      });

      it('should filter by feature group', async () => {
        const listTool = specTools.find(t => t.name === 'list_specs')!;
        
        const result = await listTool.handler({ feature_group: 'testing' });

        expect(result.success).toBe(true);
        expect(result.specs).toHaveLength(2);
        expect(result.specs.every(s => s.feature_group === 'testing')).toBe(true);
      });

      it('should handle pagination', async () => {
        const listTool = specTools.find(t => t.name === 'list_specs')!;
        
        const result = await listTool.handler({ limit: 2, offset: 0 });

        expect(result.success).toBe(true);
        expect(result.specs).toHaveLength(2);
        expect(result.pagination.has_more).toBe(true);
      });
    });

    describe('search_specs tool', () => {
      beforeEach(async () => {
        const createTool = specTools.find(t => t.name === 'create_spec')!;
        
        await createTool.handler({
          title: 'Authentication System',
          body_md: 'User login and authentication functionality'
        });

        await createTool.handler({
          title: 'Payment Processing',
          body_md: 'Handle user payments and billing'
        });
      });

      it('should search specs by title', async () => {
        const searchTool = specTools.find(t => t.name === 'search_specs')!;
        
        const result = await searchTool.handler({ query: 'Authentication' });

        expect(result.success).toBe(true);
        expect(result.results.length).toBeGreaterThan(0);
        expect(result.results[0].title).toContain('Authentication');
      });

      it('should search specs by content', async () => {
        const searchTool = specTools.find(t => t.name === 'search_specs')!;
        
        const result = await searchTool.handler({ query: 'payment' });

        expect(result.success).toBe(true);
        expect(result.results.length).toBeGreaterThan(0);
      });

      it('should handle empty results', async () => {
        const searchTool = specTools.find(t => t.name === 'search_specs')!;
        
        const result = await searchTool.handler({ query: 'nonexistent' });

        expect(result.success).toBe(true);
        expect(result.results).toHaveLength(0);
      });
    });

    describe('delete_spec tool', () => {
      let specId: number;

      beforeEach(async () => {
        const createTool = specTools.find(t => t.name === 'create_spec')!;
        const createResult = await createTool.handler({
          title: 'To Delete',
          body_md: 'This will be deleted'
        });
        specId = createResult.spec.id;
      });

      it('should delete spec successfully', async () => {
        const deleteTool = specTools.find(t => t.name === 'delete_spec')!;
        
        const result = await deleteTool.handler({ spec_id: specId });

        expect(result.success).toBe(true);
        expect(result.message).toContain('Deleted');

        // Verify deletion
        const getTool = specTools.find(t => t.name === 'get_spec')!;
        const getResult = await getTool.handler({ spec_id: specId });
        expect(getResult.success).toBe(false);
      });

      it('should handle non-existent spec', async () => {
        const deleteTool = specTools.find(t => t.name === 'delete_spec')!;
        
        const result = await deleteTool.handler({ spec_id: 99999 });

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    describe('get_spec_stats tool', () => {
      beforeEach(async () => {
        const createTool = specTools.find(t => t.name === 'create_spec')!;
        
        await createTool.handler({
          title: 'Draft Spec',
          body_md: 'Content',
          status: 'draft',
          feature_group: 'testing'
        });

        await createTool.handler({
          title: 'Todo Spec',
          body_md: 'Content',
          status: 'todo',
          feature_group: 'learning'
        });
      });

      it('should return basic stats', async () => {
        const statsTool = specTools.find(t => t.name === 'get_spec_stats')!;
        
        const result = await statsTool.handler({});

        expect(result.success).toBe(true);
        expect(result.stats).toBeDefined();
        expect(result.stats.total_specs).toBe(2);
        expect(result.stats.by_status).toBeDefined();
        expect(result.stats.by_group).toBeDefined();
      });

      it('should include detailed stats when requested', async () => {
        const statsTool = specTools.find(t => t.name === 'get_spec_stats')!;
        
        const result = await statsTool.handler({ include_details: true });

        expect(result.success).toBe(true);
        expect(result.stats.recent_activity).toBeDefined();
        expect(result.stats.latest_specs).toBeDefined();
      });
    });
  });

  describe('MCP Resources Integration', () => {
    beforeEach(async () => {
      const createTool = specTools.find(t => t.name === 'create_spec')!;
      
      await createTool.handler({
        title: 'Resource Test Spec',
        body_md: '# Resource Test\n\nThis spec is for testing resources.',
        status: 'draft',
        feature_group: 'testing'
      });
    });

    describe('Project Resources', () => {
      it('should list project resources', async () => {
        const resources = await SpecGenResourceHandler.listAllResources();

        expect(resources.length).toBeGreaterThan(0);
        
        const projectInfoResource = resources.find(r => r.uri === 'spec://project/info');
        expect(projectInfoResource).toBeDefined();
        expect(projectInfoResource!.name).toBe('Project Information');

        const projectStatsResource = resources.find(r => r.uri === 'spec://project/stats');
        expect(projectStatsResource).toBeDefined();
        expect(projectStatsResource!.name).toBe('Project Statistics');

        const projectSummaryResource = resources.find(r => r.uri === 'spec://project/summary');
        expect(projectSummaryResource).toBeDefined();
        expect(projectSummaryResource!.mimeType).toBe('text/markdown');
      });

      it('should read project info resource', async () => {
        const resource = await SpecGenResourceHandler.readResource('spec://project/info');

        expect(resource.uri).toBe('spec://project/info');
        expect(resource.mimeType).toBe('application/json');
        
        const projectInfo = JSON.parse(resource.text);
        expect(projectInfo.name).toBe('test-mcp-project');
        expect(projectInfo.version).toBe('1.0.0');
      });

      it('should read project summary resource', async () => {
        const resource = await SpecGenResourceHandler.readResource('spec://project/summary');

        expect(resource.uri).toBe('spec://project/summary');
        expect(resource.mimeType).toBe('text/markdown');
        expect(resource.text).toContain('# test-mcp-project');
        expect(resource.text).toContain('Total Specifications:');
        expect(resource.text).toContain('By Status');
      });
    });

    describe('Spec Resources', () => {
      it('should list spec resources', async () => {
        const resources = await SpecGenResourceHandler.listAllResources();
        
        const specResources = resources.filter(r => r.uri.startsWith('spec://specs/'));
        expect(specResources.length).toBe(1);
        
        const specResource = specResources[0];
        expect(specResource.name).toBe('Resource Test Spec');
        expect(specResource.mimeType).toBe('text/markdown');
        expect(specResource.description).toContain('draft');
        expect(specResource.description).toContain('testing');
      });

      it('should read spec resource with metadata', async () => {
        // Get the spec ID
        const listTool = specTools.find(t => t.name === 'list_specs')!;
        const listResult = await listTool.handler({});
        const specId = listResult.specs[0].id;

        const resource = await SpecGenResourceHandler.readResource(`spec://specs/${specId}`);

        expect(resource.uri).toBe(`spec://specs/${specId}`);
        expect(resource.mimeType).toBe('text/markdown');
        expect(resource.text).toContain('---');
        expect(resource.text).toContain('title: Resource Test Spec');
        expect(resource.text).toContain('status: draft');
        expect(resource.text).toContain('feature_group: testing');
        expect(resource.text).toContain('# Resource Test');
      });

      it('should handle non-existent spec resource', async () => {
        await expect(async () => {
          await SpecGenResourceHandler.readResource('spec://specs/99999');
        }).rejects.toThrow('not found');
      });
    });

    describe('Resource Error Handling', () => {
      it('should handle invalid resource URIs', async () => {
        await expect(async () => {
          await SpecGenResourceHandler.readResource('invalid://uri');
        }).rejects.toThrow('Unknown resource URI');
      });

      it('should handle malformed spec URIs', async () => {
        await expect(async () => {
          await SpecGenResourceHandler.readResource('spec://specs/invalid');
        }).rejects.toThrow('Invalid spec resource URI');
      });
    });
  });

  describe('MCP Integration Error Handling', () => {
    it('should handle database connection errors gracefully', () => {
      // Mock database connection failure
      jest.spyOn(DatabaseConnection, 'getCurrentProjectConnection').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const createTool = specTools.find(t => t.name === 'create_spec')!;
      
      expect(async () => {
        await createTool.handler({
          title: 'Test Spec',
          body_md: 'Test content'
        });
      }).rejects.toThrow();
    });

    it('should handle uninitialized project for resources', async () => {
      mockProjectManager.isProjectInitialized.mockReturnValue(false);

      const resources = await SpecGenResourceHandler.listAllResources();
      expect(resources).toEqual([]);
    });
  });
});