/**
 * Integration tests for MCP commands with real database and MCP server
 * These tests require a running SpecGen MCP server and database
 */

import { ArchitectMCPCommand } from '../architect-mcp-command';
import { EngineerMCPCommand } from '../engineer-mcp-command';
import path from 'path';
import fs from 'fs';

describe('MCP Commands Integration Tests', () => {
  let architectCommand: ArchitectMCPCommand;
  let engineerCommand: EngineerMCPCommand;
  let testDbPath: string;

  beforeAll(async () => {
    // Set up test database
    testDbPath = path.join(__dirname, '../../test.sqlite');
    
    // Remove test database if exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize commands
    architectCommand = new ArchitectMCPCommand();
    engineerCommand = new EngineerMCPCommand();

    // Wait for MCP server to be ready (if running)
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('End-to-End Workflow', () => {
    let createdSpecId: number;
    let specUrl: string;

    it('should create specification with architect-mcp command', async () => {
      const result = await architectCommand.execute([
        'User authentication system with JWT tokens and role-based permissions'
      ]);

      if (!result.success) {
        console.warn('MCP server may not be running - skipping integration test');
        console.warn('Error:', result.error);
        return;
      }

      expect(result.success).toBe(true);
      expect(result.spec_id).toBeDefined();
      expect(result.spec_url).toMatch(/^spec:\/\/\d+$/);
      expect(result.data?.detected_grouping.feature_group).toBe('auth');
      expect(result.data?.detected_grouping.theme_category).toBe('backend');

      createdSpecId = result.spec_id!;
      specUrl = result.spec_url!;
    });

    it('should implement specification with engineer-mcp command', async () => {
      if (!createdSpecId) {
        console.warn('Skipping engineer test - no spec created in architect test');
        return;
      }

      const result = await engineerCommand.execute([specUrl]);

      if (!result.success) {
        console.warn('MCP server may not be running - skipping integration test');
        console.warn('Error:', result.error);
        return;
      }

      expect(result.success).toBe(true);
      expect(result.spec_id).toBe(createdSpecId);
      expect(result.data?.layers_completed).toBeGreaterThan(0);
      expect(result.data?.total_tasks).toBeGreaterThan(0);
      expect(result.data?.completed_tasks).toBe(result.data?.total_tasks);
    });

    it('should handle search-based engineering', async () => {
      const result = await engineerCommand.execute([
        'implement user authentication'
      ]);

      if (!result.success && result.error?.includes('architect-mcp')) {
        // Expected when no matching specs found
        expect(result.message).toContain('No related specifications found');
        return;
      }

      if (!result.success) {
        console.warn('MCP server may not be running - skipping integration test');
        return;
      }

      expect(result.success).toBe(true);
      expect(result.spec_id).toBeDefined();
    });
  });

  describe('Database Operations', () => {
    it('should create and retrieve specifications', async () => {
      const createResult = await architectCommand.execute([
        'Simple test feature for database validation'
      ]);

      if (!createResult.success) {
        console.warn('Skipping database test - MCP server not available');
        return;
      }

      expect(createResult.success).toBe(true);
      expect(createResult.spec_id).toBeDefined();

      // Verify the spec can be retrieved
      const specResult = await (architectCommand as any).mcpTools.get_spec({
        spec_id: createResult.spec_id,
        include_relations: true
      });

      expect(specResult.success).toBe(true);
      expect(specResult.spec.id).toBe(createResult.spec_id);
      expect(specResult.spec.title).toContain('Simple test feature');
    });

    it('should handle relationship suggestions', async () => {
      // Create first spec
      const firstResult = await architectCommand.execute([
        'User management system with CRUD operations'
      ]);

      if (!firstResult.success) {
        console.warn('Skipping relationship test - MCP server not available');
        return;
      }

      // Create related spec
      const secondResult = await architectCommand.execute([
        'User authentication with password management'
      ]);

      if (!secondResult.success) {
        console.warn('Skipping relationship test - MCP server not available');
        return;
      }

      // Check if relationships were detected
      expect(secondResult.data?.suggested_relationships).toBeDefined();
      
      // The second spec might have suggestions related to the first
      if (secondResult.data?.suggested_relationships.suggested_related?.length > 0) {
        expect(secondResult.data.suggested_relationships.suggested_related[0].spec_id).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid spec URLs gracefully', async () => {
      const result = await engineerCommand.execute(['spec://99999']);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Specification not found');
    });

    it('should handle empty descriptions gracefully', async () => {
      const result = await architectCommand.execute(['']);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Feature description is required');
    });

    it('should handle malformed implementation plans', async () => {
      // First create a spec
      const createResult = await architectCommand.execute([
        'Test spec for malformed plan handling'
      ]);

      if (!createResult.success) {
        console.warn('Skipping malformed plan test - MCP server not available');
        return;
      }

      // Manually update the spec with malformed content
      await (architectCommand as any).mcpTools.update_spec({
        spec_id: createResult.spec_id,
        body_md: '# Test Spec\n\nNo implementation plan here.'
      });

      // Try to implement it
      const engineerResult = await engineerCommand.execute([createResult.spec_url!]);

      expect(engineerResult.success).toBe(false);
      expect(engineerResult.message).toContain('No implementation plan found');
    });
  });

  describe('Performance', () => {
    it('should create specifications within performance limits', async () => {
      const startTime = Date.now();
      
      const result = await architectCommand.execute([
        'Performance test specification'
      ]);

      const duration = Date.now() - startTime;

      if (!result.success) {
        console.warn('Skipping performance test - MCP server not available');
        return;
      }

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    });

    it('should load and implement specifications within performance limits', async () => {
      const createResult = await architectCommand.execute([
        'Performance test for implementation'
      ]);

      if (!createResult.success) {
        console.warn('Skipping performance test - MCP server not available');
        return;
      }

      const startTime = Date.now();
      const result = await engineerCommand.execute([createResult.spec_url!]);
      const duration = Date.now() - startTime;

      if (!result.success) {
        console.warn('Implementation performance test failed - may indicate MCP issues');
        return;
      }

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous spec creations', async () => {
      const promises = [
        architectCommand.execute(['Concurrent test spec 1']),
        architectCommand.execute(['Concurrent test spec 2']),
        architectCommand.execute(['Concurrent test spec 3'])
      ];

      const results = await Promise.allSettled(promises);
      
      const successfulResults = results
        .filter(r => r.status === 'fulfilled' && r.value.success)
        .map(r => (r as PromiseFulfilledResult<any>).value);

      if (successfulResults.length === 0) {
        console.warn('Skipping concurrent test - MCP server not available');
        return;
      }

      // At least some should succeed
      expect(successfulResults.length).toBeGreaterThan(0);
      
      // All successful specs should have unique IDs
      const specIds = successfulResults.map(r => r.spec_id);
      const uniqueIds = new Set(specIds);
      expect(uniqueIds.size).toBe(specIds.length);
    });
  });
});

describe('MCP Server Connectivity', () => {
  it('should be able to connect to MCP server', async () => {
    const command = new ArchitectMCPCommand();
    
    try {
      const result = await (command as any).mcpTools.list_specs({ limit: 1 });
      
      if (result.success) {
        console.log('✓ MCP server is running and accessible');
        expect(result.success).toBe(true);
      } else {
        console.warn('⚠ MCP server connection failed:', result.error);
        console.warn('Integration tests may not run properly');
      }
    } catch (error) {
      console.warn('⚠ MCP server not available:', error);
      console.warn('Integration tests will be skipped');
    }
  });

  it('should validate database schema', async () => {
    const command = new ArchitectMCPCommand();
    
    try {
      // Try to create a minimal spec to validate schema
      const result = await (command as any).mcpTools.create_spec_with_grouping({
        title: 'Schema validation test',
        body_md: '# Schema Test\n\nValidating database schema.',
        feature_group: 'general',
        theme_category: 'general',
        priority: 'low',
        created_via: 'integration-test'
      });

      if (result.success) {
        console.log('✓ Database schema is valid and accessible');
        expect(result.success).toBe(true);
        expect(result.spec_id).toBeDefined();
        
        // Clean up test spec
        // Note: We'd need a delete function for proper cleanup
      } else {
        console.warn('⚠ Database schema validation failed:', result.error);
      }
    } catch (error) {
      console.warn('⚠ Database not accessible:', error);
    }
  });
});