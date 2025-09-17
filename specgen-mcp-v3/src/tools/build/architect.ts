import { z } from 'zod';
import { MetadataManager } from '../../core/metadata-manager.js';
import { StructuredErrorHandler } from '../../core/error-handler.js';

const ArchitectSchema = z.object({
  specId: z.string(),
  feature: z.string().min(10),
  depth: z.enum(['shallow', 'deep', 'comprehensive']).default('deep'),
  autoCreateWorktree: z.boolean().default(false)
});

type ArchitectInput = z.infer<typeof ArchitectSchema>;

export async function buildArchitect(args: ArchitectInput): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    const validated = ArchitectSchema.parse(args);
    const { specId, feature, depth, autoCreateWorktree } = validated;

    // Load spec metadata
    const metadataManager = new MetadataManager();
    await metadataManager.refresh('Architect analysis started');

    const specs = await metadataManager.listSpecs({});
    const spec = specs.find(s => s.title === specId || s.title?.includes(specId));

    if (!spec) {
      throw new Error(`Specification '${specId}' not found. Use list_specs to see available specifications.`);
    }

    // Simple architecture analysis
    const analysis = {
      feature,
      depth,
      complexity: feature.length > 50 ? 'high' : feature.length > 20 ? 'medium' : 'low',
      estimatedEffort: depth === 'comprehensive' ? '3-5 days' : depth === 'deep' ? '1-3 days' : '0.5-1 day',
      recommendations: [
        'Start with database layer if data persistence is needed',
        'Define API contracts before implementation',
        'Consider error handling and edge cases',
        'Plan for testing and validation'
      ]
    };

    return {
      content: [{
        type: 'text',
        text: `🏗️ **Architecture Analysis Complete**

**Feature**: ${feature}
**Spec ID**: ${specId}
**Analysis Depth**: ${depth}
**Complexity**: ${analysis.complexity}
**Estimated Effort**: ${analysis.estimatedEffort}

## 📋 Architecture Recommendations:
${analysis.recommendations.map(r => `• ${r}`).join('\n')}

## 🔧 Implementation Approach:
1. **Database Layer**: Define data models and persistence
2. **Backend Layer**: Implement business logic and APIs
3. **Frontend Layer**: Create user interface components
4. **Integration Layer**: Connect external services
5. **Testing Layer**: Comprehensive test coverage

## 🚀 Next Steps:
- Use \`specgen_build_engineer\` to start implementation
- Consider \`specgen_worktree_create\` for isolated development
- Review existing codebase patterns for consistency

**Architecture analysis ready for implementation planning.**`
      }]
    };

  } catch (error: any) {
    return errorHandler.handleError('specgen_build_architect', error, {
      args,
      context: 'Analyzing feature architecture',
      suggestions: [
        'Ensure the specification ID exists',
        'Provide a detailed feature description',
        'Choose appropriate analysis depth'
      ]
    });
  }
}