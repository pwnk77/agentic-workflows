import { EngineerMCPCommand } from '../engineer-mcp-command';

// Mock the base MCP command and tools
jest.mock('../base-mcp-command', () => ({
  MCPCommand: jest.fn().mockImplementation(() => ({
    projectRoot: '/mock/project',
    mcpTools: {
      get_spec: jest.fn(),
      search_related_specs: jest.fn(),
      update_spec: jest.fn()
    },
    log: jest.fn(),
    updateTaskProgressInContent: jest.fn()
  }))
}));

describe('EngineerMCPCommand', () => {
  let command: EngineerMCPCommand;
  let mockMcpTools: any;

  beforeEach(() => {
    command = new EngineerMCPCommand();
    mockMcpTools = (command as any).mcpTools;
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return error when no arguments provided', async () => {
      const result = await command.execute([]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Specification URL or task description is required');
      expect(result.error).toContain('Usage:');
    });

    it('should handle invalid spec URL format', async () => {
      const result = await command.execute(['spec://invalid']);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid specification URL format');
      expect(result.error).toBe('Expected format: spec://123');
    });

    it('should handle specification not found', async () => {
      mockMcpTools.get_spec.mockResolvedValue({
        success: false,
        error: 'Specification not found'
      });

      const result = await command.execute(['spec://999']);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Specification not found: spec://999');
      expect(result.error).toBe('Specification not found');
    });

    it('should successfully execute specification with implementation plan', async () => {
      const mockSpec = {
        id: 123,
        title: 'User Authentication System',
        body_md: `# User Authentication System

## Implementation Plan

#### Database Layer (DB-XXX)
- [ ] **DB-001**: Create user schema migration [Estimate: 2hr]
- [ ] **DB-002**: Add authentication indexes [Estimate: 1hr]

#### Backend Layer (API-XXX)
- [ ] **API-001**: Implement authentication service [Estimate: 3hr]
- [ ] **API-002**: Add JWT token management [Estimate: 2hr]
`
      };

      mockMcpTools.get_spec.mockResolvedValue({
        success: true,
        spec: mockSpec
      });

      mockMcpTools.update_spec.mockResolvedValue({
        success: true
      });

      const result = await command.execute(['spec://123']);

      expect(result.success).toBe(true);
      expect(result.spec_id).toBe(123);
      expect(result.spec_url).toBe('spec://123');
      expect(result.data?.spec_title).toBe('User Authentication System');
      expect(result.data?.layers_completed).toBe(2);
      expect(result.data?.total_tasks).toBe(4);
      expect(result.data?.completed_tasks).toBe(4);
    });

    it('should handle specification without implementation plan', async () => {
      const mockSpec = {
        id: 456,
        title: 'Simple Spec',
        body_md: '# Simple Spec\n\nJust a description without implementation plan.'
      };

      mockMcpTools.get_spec.mockResolvedValue({
        success: true,
        spec: mockSpec
      });

      const result = await command.execute(['spec://456']);

      expect(result.success).toBe(false);
      expect(result.message).toBe('No implementation plan found in specification');
      expect(result.error).toContain('## Implementation Plan');
    });

    it('should search and implement by description', async () => {
      const mockSearchResult = {
        success: true,
        specs: [
          { id: 789, title: 'Matching Spec', score: 0.9 }
        ]
      };

      const mockSpec = {
        id: 789,
        title: 'Matching Spec',
        body_md: `# Matching Spec

## Implementation Plan

#### Backend Layer (API-XXX)
- [ ] **API-001**: Implement feature [Estimate: 2hr]
`
      };

      mockMcpTools.search_related_specs.mockResolvedValue(mockSearchResult);
      mockMcpTools.get_spec.mockResolvedValue({
        success: true,
        spec: mockSpec
      });
      mockMcpTools.update_spec.mockResolvedValue({ success: true });

      const result = await command.execute(['implement user feature']);

      expect(result.success).toBe(true);
      expect(result.spec_id).toBe(789);
      expect(mockMcpTools.search_related_specs).toHaveBeenCalledWith({
        query: 'implement user feature',
        limit: 5
      });
    });

    it('should handle search with no results', async () => {
      mockMcpTools.search_related_specs.mockResolvedValue({
        success: false,
        specs: []
      });

      const result = await command.execute(['implement unknown feature']);

      expect(result.success).toBe(false);
      expect(result.message).toBe('No related specifications found');
      expect(result.error).toContain('/architect-mcp');
    });
  });

  describe('implementation plan parsing', () => {
    it('should parse implementation plan correctly', () => {
      const bodyMd = `# Test Spec

## Implementation Plan

#### Database Layer (DB-XXX)
- [ ] **DB-001**: Create schema migration [Estimate: 2hr]
- [x] **DB-002**: Add indexes [Estimate: 1hr]

#### API Layer (API-XXX)
- [ ] **API-001**: Implement endpoints [Estimate: 3hr]

## Other Section
- This should not be included
`;

      const layers = (command as any).parseImplementationPlan(bodyMd);

      expect(layers).toHaveLength(2);
      expect(layers[0].name).toBe('Database Layer');
      expect(layers[0].tasks).toHaveLength(2);
      expect(layers[0].tasks[0].id).toBe('DB-001');
      expect(layers[0].tasks[0].status).toBe('pending');
      expect(layers[0].tasks[1].id).toBe('DB-002');
      expect(layers[0].tasks[1].status).toBe('completed');
      expect(layers[1].name).toBe('API Layer');
      expect(layers[1].tasks).toHaveLength(1);
    });

    it('should handle malformed implementation plan', () => {
      const bodyMd = `# Test Spec

## Implementation Plan

Some text without proper task format.
`;

      const layers = (command as any).parseImplementationPlan(bodyMd);

      expect(layers).toHaveLength(0);
    });
  });

  describe('task execution', () => {
    it('should execute tasks and update progress', async () => {
      const mockSpec = { id: 123, title: 'Test Spec', body_md: 'test content' };
      const mockTask = { id: 'TEST-001', description: 'Test task', status: 'pending', layer: 'Test Layer' };

      const taskResult = await (command as any).executeTask(mockTask, mockSpec);

      expect(taskResult.success).toBe(true);
    });

    it('should update task progress in specification', async () => {
      const originalContent = `- [ ] **TEST-001**: Test task [Estimate: 1hr]`;
      const expectedContent = `- [x] **TEST-001**: Test task [Estimate: 1hr]`;

      const updatedContent = (command as any).updateTaskProgressInContent(
        originalContent,
        'TEST-001',
        'completed'
      );

      expect(updatedContent).toBe(expectedContent);
    });
  });

  describe('error handling', () => {
    it('should handle task execution failure', async () => {
      const mockSpec = {
        id: 123,
        title: 'Test Spec',
        body_md: `## Implementation Plan

#### Test Layer (TEST-XXX)
- [ ] **TEST-001**: Test task [Estimate: 1hr]
`
      };

      mockMcpTools.get_spec.mockResolvedValue({
        success: true,
        spec: mockSpec
      });

      // Mock task execution failure
      jest.spyOn(command as any, 'executeTask').mockResolvedValue({
        success: false,
        error: 'Task execution failed'
      });

      const result = await command.execute(['spec://123']);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Implementation failed at task TEST-001');
      expect(result.error).toBe('Task execution failed');
    });

    it('should handle MCP update failures gracefully', async () => {
      const mockSpec = {
        id: 123,
        title: 'Test Spec',
        body_md: `## Implementation Plan

#### Test Layer (TEST-XXX)
- [ ] **TEST-001**: Test task [Estimate: 1hr]
`
      };

      mockMcpTools.get_spec.mockResolvedValue({
        success: true,
        spec: mockSpec
      });

      mockMcpTools.update_spec.mockRejectedValue(new Error('Update failed'));

      const result = await command.execute(['spec://123']);

      // Should continue despite update failures (logged as warnings)
      expect(result.success).toBe(true);
    });
  });

  describe('execution time formatting', () => {
    it('should format execution time correctly', () => {
      const startTime = Date.now() - 65000; // 1 minute 5 seconds ago
      const formatted = (command as any).formatExecutionTime(startTime);

      expect(formatted).toMatch(/1m \d+s/);
    });

    it('should format short execution time correctly', () => {
      const startTime = Date.now() - 30000; // 30 seconds ago
      const formatted = (command as any).formatExecutionTime(startTime);

      expect(formatted).toMatch(/30s/);
    });
  });
});