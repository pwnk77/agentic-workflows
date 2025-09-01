import { MCPCommand, CommandResult } from './base-mcp-command';
import { SpecAnalyzer } from './spec-grouping';

/**
 * Architect MCP Command Implementation
 * Creates comprehensive feature specifications with intelligent grouping
 */
export class ArchitectMCPCommand extends MCPCommand {
  async execute(args: string[]): Promise<CommandResult> {
    try {
      // Validate input
      if (args.length === 0) {
        return {
          success: false,
          message: 'Feature description is required',
          error: 'Usage: /architect-mcp "Feature description"'
        };
      }

      const featureDescription = args.join(' ');
      this.log(`Starting architecture analysis for: ${featureDescription}`);

      // Phase 1: Requirement analysis
      const requirements = await this.analyzeRequirements(featureDescription);
      this.log(`Analyzed requirements: ${requirements.detectedGroup} (${requirements.detectedTheme})`);

      // Phase 2: Search for related specs
      const relatedSpecs = await this.searchRelatedSpecs(requirements.keywords);
      this.log(`Found ${relatedSpecs.length} related specifications`);

      // Phase 3: Generate comprehensive spec content
      const implementationPlan = SpecAnalyzer.generateImplementationPlan(requirements);
      const specContent = SpecAnalyzer.formatSpecContent(requirements, implementationPlan);

      // Phase 4: Create spec in database with intelligent grouping
      const createResult = await this.mcpTools.create_spec_with_grouping({
        title: requirements.title,
        body_md: specContent,
        feature_group: requirements.detectedGroup,
        theme_category: requirements.detectedTheme,
        priority: this.determinePriority(requirements),
        related_specs: relatedSpecs.map(s => s.id).slice(0, 5), // Limit to top 5
        created_via: 'architect-mcp'
      });

      if (!createResult.success) {
        return {
          success: false,
          message: 'Failed to create specification',
          error: createResult.error || 'Unknown MCP tool error'
        };
      }

      // Phase 5: Format success response
      return {
        success: true,
        spec_id: createResult.spec_id,
        spec_url: createResult.spec_url,
        message: this.formatSuccessMessage(
          createResult.spec.title,
          createResult.spec_id,
          `${requirements.detectedGroup} specification with ${implementationPlan.estimatedTasks} tasks`
        ),
        data: {
          detected_grouping: createResult.detected_grouping,
          suggested_relationships: createResult.suggested_relationships,
          implementation_plan: implementationPlan,
          related_specs: relatedSpecs.slice(0, 3), // Show top 3 in response
          next_steps: [
            `Use /engineer-mcp ${createResult.spec_url} to begin implementation`,
            'Review suggested relationships and update if needed',
            'Consider breaking down complex tasks into smaller specifications'
          ]
        }
      };

    } catch (error) {
      this.log(`Error in architect command: ${error}`);
      return {
        success: false,
        message: 'Architecture analysis failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Analyze requirements and extract key information
   */
  private async analyzeRequirements(description: string): Promise<{
    title: string;
    keywords: string[];
    detectedGroup: string;
    detectedTheme: string;
    complexity: 'simple' | 'moderate' | 'complex';
  }> {
    return SpecAnalyzer.analyzeRequirements(description);
  }

  /**
   * Search for related specifications in the database
   */
  private async searchRelatedSpecs(keywords: string[]): Promise<Array<{ id: number; title: string; score: number }>> {
    try {
      const searchQuery = keywords.slice(0, 5).join(' '); // Use top 5 keywords
      const searchResult = await this.mcpTools.search_related_specs({
        query: searchQuery,
        limit: 10
      });

      if (searchResult.success && searchResult.specs) {
        return searchResult.specs.map((spec: any) => ({
          id: spec.id,
          title: spec.title,
          score: spec.score || spec.relationship_score || 0.5
        }));
      }

      return [];
    } catch (error) {
      this.log(`Error searching related specs: ${error}`);
      return [];
    }
  }

  /**
   * Determine priority based on requirements analysis
   */
  private determinePriority(requirements: {
    keywords: string[];
    detectedGroup: string;
    complexity: string;
  }): string {
    const { keywords, detectedGroup, complexity } = requirements;
    
    // High priority indicators
    const highPriorityKeywords = ['critical', 'security', 'auth', 'urgent', 'blocker'];
    const hasHighPriority = keywords.some(k => highPriorityKeywords.includes(k.toLowerCase()));
    
    // Security and auth are typically high priority
    if (detectedGroup === 'auth' || hasHighPriority) {
      return 'high';
    }
    
    // Complex features are typically medium priority
    if (complexity === 'complex') {
      return 'medium';
    }
    
    // UI and general features default to medium
    if (['ui', 'api'].includes(detectedGroup)) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Format the success message with comprehensive information
   */
  protected formatSuccessMessage(title: string, specId: number, additionalInfo: string): string {
    return [
      `✓ Created specification: "${title}" (spec://${specId})`,
      '',
      additionalInfo,
      '',
      `Next: /engineer-mcp spec://${specId}`
    ].join('\n');
  }

  /**
   * Enhanced logging with timestamp and context
   */
  protected log(message: string): void {
    super.log(`[ARCHITECT-MCP] ${message}`);
  }
}