import { ArchitectMCPCommand } from '../architect-mcp-command';
import { SpecAnalyzer } from '../spec-grouping';

// Mock the base MCP command and tools
jest.mock('../base-mcp-command', () => ({
  MCPCommand: jest.fn().mockImplementation(() => ({
    projectRoot: '/mock/project',
    mcpTools: {
      create_spec_with_grouping: jest.fn(),
      search_related_specs: jest.fn()
    },
    log: jest.fn()
  }))
}));

describe('ArchitectMCPCommand', () => {
  let command: ArchitectMCPCommand;
  let mockMcpTools: any;

  beforeEach(() => {
    command = new ArchitectMCPCommand();
    mockMcpTools = (command as any).mcpTools;
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return error when no arguments provided', async () => {
      const result = await command.execute([]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Feature description is required');
      expect(result.error).toContain('Usage:');
    });

    it('should successfully create specification with detected grouping', async () => {
      const mockSpec = {
        id: 123,
        title: 'User Authentication System',
        feature_group: 'auth',
        theme_category: 'backend'
      };

      mockMcpTools.search_related_specs.mockResolvedValue({
        success: true,
        specs: [
          { id: 45, title: 'User Management', score: 0.8 },
          { id: 67, title: 'Security Framework', score: 0.7 }
        ]
      });

      mockMcpTools.create_spec_with_grouping.mockResolvedValue({
        success: true,
        spec: mockSpec,
        spec_id: 123,
        spec_url: 'spec://123',
        detected_grouping: {
          feature_group: 'auth',
          theme_category: 'backend',
          priority: 'high'
        },
        suggested_relationships: {
          suggested_related: [
            { spec_id: 45, title: 'User Management', score: 0.8, reason: 'Similar functionality' }
          ]
        }
      });

      const result = await command.execute(['User authentication system']);

      expect(result.success).toBe(true);
      expect(result.spec_id).toBe(123);
      expect(result.spec_url).toBe('spec://123');
      expect(result.message).toContain('User Authentication System');
      expect(result.data?.detected_grouping.feature_group).toBe('auth');
      expect(result.data?.next_steps).toContain('/engineer-mcp spec://123');
    });

    it('should handle MCP tool failure gracefully', async () => {
      mockMcpTools.search_related_specs.mockResolvedValue({
        success: true,
        specs: []
      });

      mockMcpTools.create_spec_with_grouping.mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      });

      const result = await command.execute(['Test feature']);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create specification');
      expect(result.error).toBe('Database connection failed');
    });

    it('should analyze complex requirements correctly', async () => {
      const complexDescription = 'REST API endpoints for user management with authentication, role-based permissions, and audit logging';
      
      mockMcpTools.search_related_specs.mockResolvedValue({
        success: true,
        specs: []
      });

      mockMcpTools.create_spec_with_grouping.mockResolvedValue({
        success: true,
        spec: { id: 456, title: 'User Management API' },
        spec_id: 456,
        spec_url: 'spec://456',
        detected_grouping: {
          feature_group: 'api',
          theme_category: 'backend',
          priority: 'high'
        },
        suggested_relationships: { suggested_related: [] }
      });

      const result = await command.execute([complexDescription]);

      expect(result.success).toBe(true);
      expect(mockMcpTools.create_spec_with_grouping).toHaveBeenCalledWith(
        expect.objectContaining({
          feature_group: 'api',
          theme_category: 'backend',
          priority: 'high',
          created_via: 'architect-mcp'
        })
      );
    });
  });

  describe('requirement analysis', () => {
    it('should detect auth features correctly', async () => {
      const requirements = SpecAnalyzer.analyzeRequirements('User login with JWT tokens and password reset');
      
      expect(requirements.detectedGroup).toBe('auth');
      expect(requirements.detectedTheme).toBe('backend');
      expect(requirements.keywords).toContain('login');
    });

    it('should detect UI features correctly', async () => {
      const requirements = SpecAnalyzer.analyzeRequirements('Dashboard component with charts and user metrics');
      
      expect(requirements.detectedGroup).toBe('ui');
      expect(requirements.detectedTheme).toBe('frontend');
      expect(requirements.keywords).toContain('dashboard');
    });

    it('should detect API features correctly', async () => {
      const requirements = SpecAnalyzer.analyzeRequirements('REST endpoints for data management');
      
      expect(requirements.detectedGroup).toBe('api');
      expect(requirements.detectedTheme).toBe('backend');
      expect(requirements.complexity).toBe('simple');
    });

    it('should handle general features with fallback', async () => {
      const requirements = SpecAnalyzer.analyzeRequirements('Some general functionality');
      
      expect(requirements.detectedGroup).toBe('general');
      expect(requirements.detectedTheme).toBe('general');
      expect(requirements.complexity).toBe('simple');
    });
  });

  describe('priority determination', () => {
    it('should assign high priority to security features', async () => {
      const mockRequirements = {
        keywords: ['security', 'auth', 'critical'],
        detectedGroup: 'auth',
        complexity: 'moderate' as const
      };

      const priority = (command as any).determinePriority(mockRequirements);
      expect(priority).toBe('high');
    });

    it('should assign medium priority to complex features', async () => {
      const mockRequirements = {
        keywords: ['feature', 'implementation'],
        detectedGroup: 'api',
        complexity: 'complex' as const
      };

      const priority = (command as any).determinePriority(mockRequirements);
      expect(priority).toBe('medium');
    });

    it('should assign low priority to simple features', async () => {
      const mockRequirements = {
        keywords: ['simple', 'basic'],
        detectedGroup: 'general',
        complexity: 'simple' as const
      };

      const priority = (command as any).determinePriority(mockRequirements);
      expect(priority).toBe('low');
    });
  });

  describe('error handling', () => {
    it('should handle search failures gracefully', async () => {
      mockMcpTools.search_related_specs.mockRejectedValue(new Error('Search failed'));
      mockMcpTools.create_spec_with_grouping.mockResolvedValue({
        success: true,
        spec: { id: 789, title: 'Test Spec' },
        spec_id: 789,
        spec_url: 'spec://789',
        detected_grouping: { feature_group: 'general', theme_category: 'general', priority: 'low' },
        suggested_relationships: { suggested_related: [] }
      });

      const result = await command.execute(['Test feature']);

      expect(result.success).toBe(true); // Should continue despite search failure
      expect(result.spec_id).toBe(789);
    });

    it('should handle unexpected errors', async () => {
      mockMcpTools.search_related_specs.mockRejectedValue(new Error('Unexpected error'));
      mockMcpTools.create_spec_with_grouping.mockRejectedValue(new Error('Critical failure'));

      const result = await command.execute(['Test feature']);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Architecture analysis failed');
      expect(result.error).toContain('Critical failure');
    });
  });
});