import { z } from 'zod';
import { MetadataManager } from '../../core/metadata-manager.js';
import { StructuredErrorHandler } from '../../core/error-handler.js';

const EngineerSchema = z.object({
  specId: z.string(),
  mode: z.enum(['implement', 'debug', 'continue']).default('implement'),
  layer: z.enum(['database', 'backend', 'frontend', 'integration', 'testing', 'all']).default('all'),
  dryRun: z.boolean().default(false)
});

type EngineerInput = z.infer<typeof EngineerSchema>;

export async function buildEngineer(args: EngineerInput): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    const validated = EngineerSchema.parse(args);
    const { specId, mode, layer, dryRun } = validated;

    // Load spec metadata
    const metadataManager = new MetadataManager();
    await metadataManager.refresh('Engineer implementation started');

    const specs = await metadataManager.listSpecs({});
    const spec = specs.find(s => s.title === specId || s.title?.includes(specId));

    if (!spec) {
      throw new Error(`Specification '${specId}' not found. Use list_specs to see available specifications.`);
    }

    // Implementation guidance based on layer and mode
    const implementationPlan = {
      database: [
        'Review existing schema and models',
        'Create new tables/collections as needed',
        'Add indexes for performance',
        'Test migrations and rollbacks'
      ],
      backend: [
        'Define API endpoints and routes',
        'Implement business logic',
        'Add input validation and error handling',
        'Write unit tests for critical paths'
      ],
      frontend: [
        'Create UI components',
        'Implement state management',
        'Add responsive design',
        'Test user interactions'
      ],
      integration: [
        'Connect frontend to backend APIs',
        'Add external service integrations',
        'Implement authentication flows',
        'Test end-to-end scenarios'
      ],
      testing: [
        'Write comprehensive unit tests',
        'Add integration test coverage',
        'Perform manual testing',
        'Validate against requirements'
      ]
    };

    const selectedSteps = layer === 'all'
      ? Object.values(implementationPlan).flat()
      : implementationPlan[layer as keyof typeof implementationPlan];

    return {
      content: [{
        type: 'text',
        text: `⚙️ **Engineering Implementation Pipeline**

**Spec ID**: ${specId}
**Mode**: ${mode}
**Layer**: ${layer}
**Dry Run**: ${dryRun}

## 🔧 Implementation Steps for ${layer === 'all' ? 'All Layers' : `${layer.charAt(0).toUpperCase() + layer.slice(1)} Layer`}:
${selectedSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## 📋 Implementation Guidelines:
- Follow existing code patterns and conventions
- Write tests before or alongside implementation
- Document complex business logic
- Handle error cases gracefully
- Consider performance and scalability

## 🚨 ${mode === 'debug' ? 'Debug Mode' : mode === 'continue' ? 'Continue Mode' : 'Implement Mode'} Instructions:
${mode === 'debug'
  ? '• Identify failing tests or broken functionality\n• Add diagnostic logging\n• Isolate problem areas\n• Fix root causes systematically'
  : mode === 'continue'
  ? '• Resume from last checkpoint\n• Review previous implementation\n• Continue with next planned tasks\n• Maintain consistency with existing work'
  : '• Start fresh implementation\n• Follow specification requirements\n• Implement layer by layer\n• Test as you build'
}

${dryRun ? '⚠️ **DRY RUN MODE**: This is a simulation - no actual changes will be made.' : ''}

## 🚀 Next Steps:
- Use appropriate development tools for your stack
- Run tests frequently during development
- Use \`specgen.worktree.status\` to track changes
- Review with \`specgen.build.reviewer\` when complete

**Implementation pipeline ready for execution.**`
      }]
    };

  } catch (error: any) {
    return errorHandler.handleError('specgen.build.engineer', error, {
      args,
      context: 'Setting up implementation pipeline',
      suggestions: [
        'Ensure the specification ID exists',
        'Choose appropriate implementation mode',
        'Select the right layer for your current task'
      ]
    });
  }
}