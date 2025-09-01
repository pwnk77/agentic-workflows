import { SpecAnalyzer } from '../spec-grouping';

describe('SpecAnalyzer', () => {
  describe('analyzeRequirements', () => {
    it('should detect auth features correctly', () => {
      const requirements = SpecAnalyzer.analyzeRequirements('User authentication system with JWT tokens and session management');

      expect(requirements.detectedGroup).toBe('auth');
      expect(requirements.detectedTheme).toBe('backend');
      expect(requirements.keywords).toContain('authentication');
      expect(requirements.keywords).toContain('tokens');
      expect(requirements.complexity).toBe('moderate');
    });

    it('should detect UI features correctly', () => {
      const requirements = SpecAnalyzer.analyzeRequirements('Dashboard component with interactive charts');

      expect(requirements.detectedGroup).toBe('ui');
      expect(requirements.detectedTheme).toBe('frontend');
      expect(requirements.keywords).toContain('dashboard');
      expect(requirements.keywords).toContain('component');
    });

    it('should detect API features correctly', () => {
      const requirements = SpecAnalyzer.analyzeRequirements('REST API endpoints for user management');

      expect(requirements.detectedGroup).toBe('api');
      expect(requirements.detectedTheme).toBe('backend');
      expect(requirements.keywords).toContain('endpoints');
    });

    it('should detect data features correctly', () => {
      const requirements = SpecAnalyzer.analyzeRequirements('Database schema migration for user storage');

      expect(requirements.detectedGroup).toBe('data');
      expect(requirements.detectedTheme).toBe('backend');
      expect(requirements.keywords).toContain('database');
      expect(requirements.keywords).toContain('migration');
    });

    it('should detect integration features correctly', () => {
      const requirements = SpecAnalyzer.analyzeRequirements('MCP integration for external data synchronization');

      expect(requirements.detectedGroup).toBe('integration');
      expect(requirements.detectedTheme).toBe('integration');
      expect(requirements.keywords).toContain('integration');
      expect(requirements.keywords).toContain('external');
    });

    it('should handle complex descriptions', () => {
      const complexDescription = 'Comprehensive user authentication system with JWT tokens, OAuth integration, role-based permissions, audit logging, password reset functionality, and real-time session management across multiple devices';

      const requirements = SpecAnalyzer.analyzeRequirements(complexDescription);

      expect(requirements.detectedGroup).toBe('auth');
      expect(requirements.complexity).toBe('complex');
      expect(requirements.title.length).toBeGreaterThan(0);
      expect(requirements.keywords.length).toBeGreaterThan(5);
    });

    it('should fallback to general for unrecognized features', () => {
      const requirements = SpecAnalyzer.analyzeRequirements('Some random business logic');

      expect(requirements.detectedGroup).toBe('general');
      expect(requirements.detectedTheme).toBe('general');
      expect(requirements.complexity).toBe('simple');
    });
  });

  describe('generateImplementationPlan', () => {
    it('should generate appropriate plan for UI features', () => {
      const requirements = {
        detectedGroup: 'ui',
        detectedTheme: 'frontend',
        complexity: 'moderate' as const,
        title: 'Dashboard Component',
        keywords: ['dashboard', 'component', 'frontend']
      };

      const plan = SpecAnalyzer.generateImplementationPlan(requirements);

      expect(plan.layers).toContain('Component Layer');
      expect(plan.layers).toContain('Frontend Layer');
      expect(plan.estimatedTasks).toBe(5);
      expect(plan.recommendedApproach).toBe('incremental');
    });

    it('should generate appropriate plan for API features', () => {
      const requirements = {
        detectedGroup: 'api',
        detectedTheme: 'backend',
        complexity: 'complex' as const,
        title: 'User Management API',
        keywords: ['api', 'endpoints', 'backend']
      };

      const plan = SpecAnalyzer.generateImplementationPlan(requirements);

      expect(plan.layers).toContain('Database Layer');
      expect(plan.layers).toContain('Backend Layer');
      expect(plan.layers).toContain('API Layer');
      expect(plan.estimatedTasks).toBe(10);
    });

    it('should generate appropriate plan for auth features', () => {
      const requirements = {
        detectedGroup: 'auth',
        detectedTheme: 'backend',
        complexity: 'complex' as const,
        title: 'Authentication System',
        keywords: ['auth', 'security', 'login']
      };

      const plan = SpecAnalyzer.generateImplementationPlan(requirements);

      expect(plan.layers).toContain('Security Layer');
      expect(plan.recommendedApproach).toBe('security-first');
      expect(plan.estimatedTasks).toBe(12);
    });

    it('should generate appropriate plan for integration features', () => {
      const requirements = {
        detectedGroup: 'integration',
        detectedTheme: 'integration',
        complexity: 'moderate' as const,
        title: 'MCP Integration',
        keywords: ['mcp', 'integration', 'external']
      };

      const plan = SpecAnalyzer.generateImplementationPlan(requirements);

      expect(plan.layers).toContain('MCP Layer');
      expect(plan.layers).toContain('Integration Layer');
      expect(plan.recommendedApproach).toBe('prototype-first');
    });

    it('should generate appropriate plan for data features', () => {
      const requirements = {
        detectedGroup: 'data',
        detectedTheme: 'backend',
        complexity: 'moderate' as const,
        title: 'Data Management',
        keywords: ['database', 'schema', 'migration']
      };

      const plan = SpecAnalyzer.generateImplementationPlan(requirements);

      expect(plan.layers).toContain('Database Layer');
      expect(plan.layers).toContain('Migration Layer');
      expect(plan.recommendedApproach).toBe('schema-first');
    });
  });

  describe('formatSpecContent', () => {
    it('should generate complete spec content', () => {
      const requirements = {
        title: 'User Authentication System',
        detectedGroup: 'auth',
        detectedTheme: 'backend',
        complexity: 'moderate' as const,
        keywords: ['auth', 'security', 'jwt']
      };

      const plan = {
        layers: ['Security Layer', 'Backend Layer'],
        estimatedTasks: 8,
        recommendedApproach: 'security-first'
      };

      const content = SpecAnalyzer.formatSpecContent(requirements, plan);

      expect(content).toContain('# SPEC-');
      expect(content).toContain('User Authentication System');
      expect(content).toContain('## Executive Summary');
      expect(content).toContain('## Product Specifications');
      expect(content).toContain('## Technical Specifications');
      expect(content).toContain('## Implementation Plan');
      expect(content).toContain('## Success Metrics');
      expect(content).toContain('## Timeline');
      expect(content).toContain('Security Layer');
      expect(content).toContain('Backend Layer');
      expect(content).toContain('security-first');
    });

    it('should include appropriate content for different feature types', () => {
      const uiRequirements = {
        title: 'Dashboard Component',
        detectedGroup: 'ui',
        detectedTheme: 'frontend',
        complexity: 'simple' as const,
        keywords: ['ui', 'component', 'dashboard']
      };

      const uiPlan = {
        layers: ['Frontend Layer'],
        estimatedTasks: 3,
        recommendedApproach: 'incremental'
      };

      const uiContent = SpecAnalyzer.formatSpecContent(uiRequirements, uiPlan);

      expect(uiContent).toContain('frontend solution');
      expect(uiContent).toContain('user interface');
      expect(uiContent).toContain('Component-based architecture');
    });
  });

  describe('edge cases', () => {
    it('should handle empty description', () => {
      const requirements = SpecAnalyzer.analyzeRequirements('');

      expect(requirements.detectedGroup).toBe('general');
      expect(requirements.detectedTheme).toBe('general');
      expect(requirements.complexity).toBe('simple');
      expect(requirements.keywords).toEqual([]);
    });

    it('should handle very long descriptions', () => {
      const longDescription = 'authentication '.repeat(100);
      const requirements = SpecAnalyzer.analyzeRequirements(longDescription);

      expect(requirements.detectedGroup).toBe('auth');
      expect(requirements.complexity).toBe('complex');
      expect(requirements.keywords.length).toBeLessThanOrEqual(10);
    });

    it('should handle special characters in description', () => {
      const requirements = SpecAnalyzer.analyzeRequirements('API with @mentions, #tags, and $variables');

      expect(requirements.detectedGroup).toBe('api');
      expect(requirements.title).toBeDefined();
      expect(requirements.keywords).toBeDefined();
    });
  });
});