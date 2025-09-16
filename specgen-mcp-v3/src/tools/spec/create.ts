import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { MetadataManager } from '../../core/metadata-manager.js';
import { StructuredErrorHandler } from '../../core/error-handler.js';
import { config } from '../../core/config.js';

// Schema for specgen.spec.create
const CreateSpecSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10),
  category: z.enum(['Architecture', 'Feature', 'Bugfix', 'Research']).default('Feature'),
  createWorktree: z.boolean().default(false),
  baseBranch: z.string().default('main')
});

type CreateSpecInput = z.infer<typeof CreateSpecSchema>;

interface CreateSpecOutput {
  specId: string;
  path: string;
  metadata: any;
  worktree?: any;
}

export async function createSpec(args: CreateSpecInput): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    // Validate input
    const validated = CreateSpecSchema.parse(args);
    const { title, description, category, createWorktree, baseBranch } = validated;

    // Generate spec ID and filename
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const sanitizedTitle = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    const specId = `SPEC-${timestamp}-${sanitizedTitle}`;
    const filename = `${specId}.md`;
    const specPath = path.join(config.docsPath, filename);

    // Check if spec already exists
    try {
      await fs.access(specPath);
      throw new Error(`Specification ${filename} already exists`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, which is what we want
    }

    // Generate metadata
    const metadata = {
      title: specId,
      status: 'draft' as const,
      category,
      priority: 'medium' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_via: 'specgen.spec.create',
      related_specs: [],
      parent_spec_id: null,
      tags: [category.toLowerCase()],
      effort_estimate: '1-2 days',
      completion: 0
    };

    // Create spec content with frontmatter
    const frontmatter = Object.entries(metadata)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        } else if (typeof value === 'string') {
          return `${key}: "${value}"`;
        } else {
          return `${key}: ${value}`;
        }
      })
      .join('\n');

    const specContent = `---
${frontmatter}
---

# 📋 SPEC: ${title}

## 📊 Executive Summary

${description}

## 📝 Product Specifications

*[Add detailed product specifications here]*

## 🏗️ Architecture Analysis

*[Add architecture analysis here]*

## 🚀 Implementation Plan

### 📋 Task Breakdown by Layer

*[Add implementation tasks here]*

### ⏱️ Timeline and Effort Estimates

*[Add timeline estimates here]*

### ✅ Success Metrics

*[Add success metrics here]*

## 📈 Execution Logs

*[To be updated during implementation]*

## 🐛 Debug Logs

*[To be updated during debugging]*
`;

    // Write spec file
    await fs.writeFile(specPath, specContent, 'utf-8');

    // Update metadata registry
    const metadataManager = new MetadataManager();
    await metadataManager.refresh(`Created new spec: ${specId}`);

    const result: CreateSpecOutput = {
      specId,
      path: specPath,
      metadata
    };

    // Handle worktree creation if requested
    if (createWorktree) {
      try {
        // Note: This is a placeholder for worktree creation
        // The actual worktree.create tool will handle this
        result.worktree = {
          requested: true,
          message: 'Worktree creation requested but not yet implemented. Use specgen.worktree.create after implementation.'
        };
      } catch (error) {
        // Log worktree error but don't fail spec creation
        console.warn('Worktree creation failed:', error);
        result.worktree = {
          error: 'Worktree creation failed',
          message: 'Spec created successfully, but worktree setup failed. Create manually if needed.'
        };
      }
    }

    return {
      content: [{
        type: 'text',
        text: `✅ **Specification Created Successfully**

**Spec ID**: ${specId}
**File**: ${filename}
**Category**: ${category}
**Status**: draft
**Path**: ${specPath}

**Metadata**:
- Priority: ${metadata.priority}
- Effort Estimate: ${metadata.effort_estimate}
- Created: ${metadata.created_at}
- Completion: ${metadata.completion}%

${createWorktree ? `
**Worktree**: ${result.worktree?.error ? 'Creation failed - ' + result.worktree.message : 'Requested but not yet implemented'}
` : ''}

**Next Steps**:
1. Edit the specification content in ${filename}
2. Use \`specgen.spec.orchestrate\` to get recommended next actions
3. Run \`mcp__specgen-mcp__refresh_metadata\` to update the registry${createWorktree && !result.worktree?.error ? `
4. Use \`specgen.worktree.create\` to set up isolated development environment` : ''}

The specification template has been created with standard sections. You can now start filling in the details for your ${category.toLowerCase()} specification.`
      }]
    };

  } catch (error: any) {
    return errorHandler.handleError('specgen.spec.create', error, {
      args,
      context: 'Creating new specification document'
    });
  }
}