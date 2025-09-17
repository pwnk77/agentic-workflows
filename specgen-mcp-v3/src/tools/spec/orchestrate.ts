import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import { MetadataManager } from '../../core/metadata-manager.js';
import { StructuredErrorHandler } from '../../core/error-handler.js';
import { config } from '../../core/config.js';

// Schema for specgen_spec_orchestrate
const OrchestrateSpecSchema = z.object({
  specId: z.string(),
  intent: z.enum(['analyze', 'implement', 'review', 'deploy']),
  context: z.string().optional()
});

type OrchestrateSpecInput = z.infer<typeof OrchestrateSpecSchema>;

interface OrchestrateSpecOutput {
  specId: string;
  recommendedTools: string[];
  workflowPlan: {
    phase: string;
    description: string;
    tools: string[];
    estimated_time: string;
  }[];
  nextActions: string[];
}

export async function orchestrateSpec(args: OrchestrateSpecInput): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    // Validate input
    const validated = OrchestrateSpecSchema.parse(args);
    const { specId, intent, context } = validated;

    // Load spec metadata
    const metadataManager = new MetadataManager();
    await metadataManager.refresh('Orchestration analysis');

    const specs = await metadataManager.listSpecs({});
    const spec = specs.find(s => s.title === specId || s.title?.includes(specId));

    if (!spec) {
      throw new Error(`Specification '${specId}' not found. Use list_specs to see available specifications.`);
    }

    // Load spec content to analyze current state
    const specPath = path.join(config.docsPath, spec.filename);
    let specContent = '';
    try {
      specContent = await fs.readFile(specPath, 'utf-8');
    } catch (error) {
      console.warn('Could not read spec content:', error);
    }

    // Analyze spec completeness
    const hasExecutionLogs = specContent.includes('## 📈 Execution Logs') &&
      !specContent.includes('*[To be updated during implementation]*');
    const hasArchitecture = specContent.includes('## 🏗️ Architecture Analysis') &&
      !specContent.includes('*[Add architecture analysis here]*');
    const hasImplementation = specContent.includes('## 🚀 Implementation Plan') &&
      !specContent.includes('*[Add implementation tasks here]*');

    // Determine workflow based on intent and current state
    const result: OrchestrateSpecOutput = {
      specId: spec.title,
      recommendedTools: [],
      workflowPlan: [],
      nextActions: []
    };

    switch (intent) {
      case 'analyze':
        if (!hasArchitecture) {
          result.recommendedTools = [
            'specgen_build_architect',
            'specgen_research_analyze',
            'specgen_research_search',
            'specgen_research_dependencies'
          ];
          result.workflowPlan = [
            {
              phase: 'Requirements Analysis',
              description: 'Analyze requirements and existing codebase patterns',
              tools: ['specgen_build_architect'],
              estimated_time: '30-45 minutes'
            },
            {
              phase: 'Research & Discovery',
              description: 'Research similar patterns and dependencies',
              tools: ['specgen_research_analyze', 'specgen_research_search'],
              estimated_time: '15-30 minutes'
            },
            {
              phase: 'Architecture Design',
              description: 'Create comprehensive architecture analysis',
              tools: ['specgen_research_dependencies'],
              estimated_time: '20-30 minutes'
            }
          ];
          result.nextActions = [
            `Run: specgen_build_architect(specId: "${specId}", feature: "${spec.title}", depth: "comprehensive")`,
            'This will automatically coordinate all research tools and generate architecture analysis'
          ];
        } else {
          result.recommendedTools = ['specgen_research_search', 'specgen_research_fetch'];
          result.workflowPlan = [
            {
              phase: 'Enhanced Analysis',
              description: 'Deep dive into specific areas of the existing architecture',
              tools: ['specgen_research_search', 'specgen_research_fetch'],
              estimated_time: '15-20 minutes'
            }
          ];
          result.nextActions = [
            'Specification already has architecture analysis',
            'Use research tools for specific deep dives or proceed to implementation'
          ];
        }
        break;

      case 'implement':
        if (!hasArchitecture) {
          result.recommendedTools = ['specgen_build_architect'];
          result.workflowPlan = [
            {
              phase: 'Prerequisites',
              description: 'Complete architecture analysis before implementation',
              tools: ['specgen_build_architect'],
              estimated_time: '45-60 minutes'
            }
          ];
          result.nextActions = [
            'Architecture analysis required before implementation',
            `Run: specgen_build_architect(specId: "${specId}", feature: "${spec.title}")`,
            'Then return to implementation intent'
          ];
        } else if (!hasImplementation) {
          result.recommendedTools = ['specgen_build_engineer'];
          result.workflowPlan = [
            {
              phase: 'Implementation Setup',
              description: 'Set up implementation environment and begin coding',
              tools: ['specgen_build_engineer', 'specgen_worktree_create'],
              estimated_time: '2-4 hours'
            }
          ];
          result.nextActions = [
            `Run: specgen_worktree_create(specId: "${specId}", autoSetup: true)`,
            `Then: specgen_build_engineer(specId: "${specId}", mode: "implement")`,
            'Engineer tool will coordinate layer-by-layer implementation'
          ];
        } else if (hasExecutionLogs) {
          result.recommendedTools = ['specgen_build_engineer'];
          result.workflowPlan = [
            {
              phase: 'Continue Implementation',
              description: 'Resume ongoing implementation work',
              tools: ['specgen_build_engineer'],
              estimated_time: '1-2 hours'
            }
          ];
          result.nextActions = [
            `Run: specgen_build_engineer(specId: "${specId}", mode: "continue")`,
            'This will resume from where implementation left off'
          ];
        } else {
          result.recommendedTools = ['specgen_build_engineer'];
          result.workflowPlan = [
            {
              phase: 'Begin Implementation',
              description: 'Start implementation with worktree setup',
              tools: ['specgen_build_engineer', 'specgen_worktree_create'],
              estimated_time: '2-4 hours'
            }
          ];
          result.nextActions = [
            `Run: specgen_build_engineer(specId: "${specId}", mode: "implement")`,
            'Engineer will handle worktree setup and implementation coordination'
          ];
        }
        break;

      case 'review':
        if (!hasExecutionLogs) {
          result.recommendedTools = ['specgen_build_engineer'];
          result.workflowPlan = [
            {
              phase: 'Implementation Required',
              description: 'Complete implementation before review',
              tools: ['specgen_build_engineer'],
              estimated_time: '2-4 hours'
            }
          ];
          result.nextActions = [
            'Implementation must be completed before review',
            'Switch to "implement" intent first'
          ];
        } else {
          result.recommendedTools = ['specgen_build_reviewer'];
          result.workflowPlan = [
            {
              phase: 'Multi-Domain Assessment',
              description: 'Comprehensive code review across security, performance, quality',
              tools: ['specgen_build_reviewer'],
              estimated_time: '30-45 minutes'
            }
          ];
          result.nextActions = [
            `Run: specgen_build_reviewer(specId: "${specId}", scope: ["security", "performance", "quality"])`,
            'This will generate improvement specifications automatically'
          ];
        }
        break;

      case 'deploy':
        if (!hasExecutionLogs) {
          result.recommendedTools = ['specgen_build_engineer'];
          result.workflowPlan = [
            {
              phase: 'Implementation Required',
              description: 'Complete implementation before deployment',
              tools: ['specgen_build_engineer'],
              estimated_time: '2-4 hours'
            }
          ];
          result.nextActions = [
            'Implementation must be completed before deployment',
            'Switch to "implement" intent first'
          ];
        } else {
          result.recommendedTools = ['specgen_worktree_merge'];
          result.workflowPlan = [
            {
              phase: 'Pre-Deployment Review',
              description: 'Final review and testing before merge',
              tools: ['specgen_build_reviewer', 'specgen_worktree_status'],
              estimated_time: '20-30 minutes'
            },
            {
              phase: 'Deployment',
              description: 'Merge changes and deploy',
              tools: ['specgen_worktree_merge'],
              estimated_time: '10-15 minutes'
            }
          ];
          result.nextActions = [
            `Run: specgen_worktree_status(specId: "${specId}")`,
            `Then: specgen_worktree_merge(specId: "${specId}", createPR: true)`,
            'This will create PR and handle safe merging'
          ];
        }
        break;
    }

    // Add contextual recommendations
    if (context) {
      result.nextActions.unshift(`Context: ${context}`);
    }

    return {
      content: [{
        type: 'text',
        text: `🎯 **Workflow Orchestration for ${spec.title}**

**Intent**: ${intent.toUpperCase()}
**Status**: ${spec.status}
**Category**: ${spec.category}
**Completion**: ${spec.completion}%

${context ? `**Context**: ${context}\n` : ''}

## 🔧 Recommended Tools
${result.recommendedTools.map(tool => `- \`${tool}\``).join('\n')}

## 📋 Workflow Plan
${result.workflowPlan.map(phase => `
### ${phase.phase}
- **Description**: ${phase.description}
- **Tools**: ${phase.tools.map(t => `\`${t}\``).join(', ')}
- **Estimated Time**: ${phase.estimated_time}
`).join('')}

## 🚀 Next Actions
${result.nextActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

## 📊 Workflow Efficiency
- **Primary Tool**: \`${result.recommendedTools[0]}\`
- **Coordination**: Tools will coordinate automatically
- **Progress Tracking**: Real-time updates to spec execution logs
- **Error Handling**: Built-in recovery and continuation capabilities

**Pro Tip**: Use the primary tool first - it will coordinate other tools automatically for maximum efficiency.`
      }]
    };

  } catch (error: any) {
    return errorHandler.handleError('specgen_spec_orchestrate', error, {
      args,
      context: 'Orchestrating specification workflow'
    });
  }
}