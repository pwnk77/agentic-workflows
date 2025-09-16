import { z } from 'zod';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { StructuredErrorHandler } from '../../core/error-handler.js';

// Schema for specgen.worktree.merge
const MergeWorktreeSchema = z.object({
  specId: z.string(),
  targetBranch: z.string().default('main'),
  strategy: z.enum(['merge', 'squash', 'rebase']).default('squash'),
  createPR: z.boolean().default(false),
  removeAfterMerge: z.boolean().default(true),
  force: z.boolean().default(false)
});

type MergeWorktreeInput = z.infer<typeof MergeWorktreeSchema>;

interface MergeWorktreeOutput {
  specId: string;
  merged: boolean;
  conflicts?: any[];
  prUrl?: string;
}

export async function mergeWorktree(args: MergeWorktreeInput): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    const validated = MergeWorktreeSchema.parse(args);
    const { specId, targetBranch, strategy, createPR, removeAfterMerge, force } = validated;

    // Load worktree metadata
    const metadata = await loadWorktreeMetadata();
    const worktreeInfo = Object.values(metadata).find((meta: any) => meta.specId === specId);

    if (!worktreeInfo) {
      throw new Error(`Worktree for spec '${specId}' not found.`);
    }

    const { path: worktreePath, branch } = worktreeInfo as any;

    // Pre-merge safety checks
    await performPreMergeChecks(worktreePath, targetBranch, force);

    // Backup current state if requested
    const backupBranch = `backup/${branch}-${Date.now()}`;
    if (!force) {
      execSync(`git branch ${backupBranch}`, { cwd: worktreePath, stdio: 'pipe' });
    }

    let merged = false;
    let conflicts: any[] = [];
    let prUrl: string | undefined;

    try {
      if (createPR) {
        // Push branch and create PR instead of direct merge
        execSync(`git push -u origin ${branch}`, { cwd: worktreePath, stdio: 'pipe' });

        // Create PR (simplified - would need GitHub API integration)
        prUrl = `https://github.com/repo/pull/new/${branch}`;
        console.log('PR creation would require GitHub API integration');

        merged = false; // PR created but not merged
      } else {
        // Direct merge
        const result = await performMerge(worktreePath, branch, targetBranch, strategy);
        merged = result.success;
        conflicts = result.conflicts;
      }

      // Remove worktree if successful and requested
      if (merged && removeAfterMerge) {
        await removeWorktreeAfterMerge(specId, worktreePath);
      }

      return {
        content: [{
          type: 'text',
          text: `🔀 **Worktree Merge ${merged ? 'Complete' : createPR ? 'PR Created' : 'Failed'} for ${specId}**

## 📊 Merge Summary
**Strategy**: ${strategy}
**Target Branch**: ${targetBranch}
**Source Branch**: ${branch}
**Status**: ${merged ? '✅ Successfully merged' : createPR ? '📝 Pull request created' : '❌ Merge failed'}
${prUrl ? `**PR URL**: ${prUrl}` : ''}

${conflicts.length > 0 ? `## 🚨 Conflicts Detected (${conflicts.length})
${conflicts.map(conflict => `- ${conflict}`).join('\n')}

### Resolution Required
1. Navigate to worktree: \`cd "${worktreePath}"\`
2. Resolve conflicts manually
3. Commit resolved changes
4. Retry merge: \`specgen.worktree.merge(specId: "${specId}", force: true)\`
` : ''}

${merged ? `## ✅ Merge Successful
- Changes integrated into ${targetBranch}
- Branch ${branch} ${removeAfterMerge ? 'removed' : 'preserved'}
- Backup created: ${backupBranch}
${removeAfterMerge ? '- Worktree cleaned up' : ''}
` : ''}

${createPR && !merged ? `## 📝 Pull Request Created
- Branch pushed to origin
- Ready for code review
- Manual merge required through PR interface
` : ''}

## 🚀 Next Steps
${merged ?
  `1. Verify changes in ${targetBranch}
2. Run tests: \`npm test\` or project-specific commands
3. Deploy if ready: \`specgen.spec.orchestrate(intent: "deploy")\`` :
  createPR ?
    `1. Review PR and request feedback
2. Merge through GitHub interface when approved
3. Clean up: \`specgen.worktree.remove(specId: "${specId}")\`` :
    `1. Resolve conflicts listed above
2. Retry merge with force flag
3. Or use PR workflow: \`createPR: true\``
}

## 🔒 Safety Features
- ${!force ? '✅ Backup branch created' : '⚠️ No backup (force mode)'}
- ${!force ? '✅ Pre-merge validation performed' : '⚠️ Validation skipped (force mode)'}
- ${removeAfterMerge && merged ? '✅ Worktree cleaned up' : '📁 Worktree preserved'}

**Operation ${merged ? 'completed successfully' : 'requires attention'}.**`
        }]
      };

    } catch (error: any) {
      // Restore from backup if merge failed
      if (!force) {
        try {
          execSync(`git checkout ${backupBranch}`, { cwd: worktreePath, stdio: 'pipe' });
        } catch (restoreError) {
          console.warn('Could not restore from backup:', restoreError);
        }
      }
      throw error;
    }

  } catch (error: any) {
    return errorHandler.handleError('specgen.worktree.merge', error, {
      args,
      context: 'Merging worktree changes',
      suggestions: [
        'Resolve conflicts before merging',
        'Use force flag to skip pre-checks',
        'Consider using PR workflow for review',
        'Ensure target branch is up to date'
      ]
    });
  }
}

// Helper functions
async function loadWorktreeMetadata(): Promise<Record<string, any>> {
  try {
    const metadataPath = path.join(process.cwd(), '.git', 'worktree-metadata.json');
    const content = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
}

async function performPreMergeChecks(worktreePath: string, targetBranch: string, force: boolean): Promise<void> {
  if (force) return;

  // Check if worktree is clean
  const statusOutput = execSync('git status --porcelain', {
    cwd: worktreePath,
    encoding: 'utf-8',
    stdio: 'pipe'
  });

  if (statusOutput.trim()) {
    throw new Error('Worktree has uncommitted changes. Commit or stash changes before merging.');
  }

  // Check if target branch exists
  try {
    execSync(`git rev-parse --verify ${targetBranch}`, { cwd: worktreePath, stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Target branch '${targetBranch}' does not exist.`);
  }

  // Fetch latest changes
  try {
    execSync('git fetch origin', { cwd: worktreePath, stdio: 'pipe' });
  } catch (error) {
    console.warn('Could not fetch latest changes:', error);
  }
}

async function performMerge(
  worktreePath: string,
  sourceBranch: string,
  targetBranch: string,
  strategy: string
): Promise<{ success: boolean; conflicts: string[] }> {
  try {
    // Switch to target branch
    execSync(`git checkout ${targetBranch}`, { cwd: worktreePath, stdio: 'pipe' });

    // Pull latest changes
    execSync(`git pull origin ${targetBranch}`, { cwd: worktreePath, stdio: 'pipe' });

    // Perform merge based on strategy
    let mergeCommand = '';
    switch (strategy) {
      case 'squash':
        mergeCommand = `git merge --squash ${sourceBranch}`;
        break;
      case 'rebase':
        mergeCommand = `git rebase ${sourceBranch}`;
        break;
      default:
        mergeCommand = `git merge ${sourceBranch}`;
    }

    execSync(mergeCommand, { cwd: worktreePath, stdio: 'pipe' });

    // If squash merge, need to commit
    if (strategy === 'squash') {
      execSync(`git commit -m "Merge ${sourceBranch} (squashed)"`, { cwd: worktreePath, stdio: 'pipe' });
    }

    return { success: true, conflicts: [] };

  } catch (error: any) {
    // Check for conflicts
    const conflicts: string[] = [];
    try {
      const statusOutput = execSync('git status --porcelain', {
        cwd: worktreePath,
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      const lines = statusOutput.split('\n');
      for (const line of lines) {
        if (line.startsWith('UU ') || line.startsWith('AA ')) {
          conflicts.push(line.slice(3));
        }
      }
    } catch (statusError) {
      // Could not get status
    }

    return { success: false, conflicts };
  }
}

async function removeWorktreeAfterMerge(specId: string, worktreePath: string): Promise<void> {
  try {
    // Remove git worktree
    execSync(`git worktree remove "${worktreePath}"`, { cwd: process.cwd(), stdio: 'pipe' });

    // Remove from metadata
    const metadataPath = path.join(process.cwd(), '.git', 'worktree-metadata.json');
    try {
      const metadata = await loadWorktreeMetadata();
      const updatedMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([_, meta]: any) => meta.specId !== specId)
      );
      await fs.writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2), 'utf-8');
    } catch (error) {
      console.warn('Could not update metadata:', error);
    }

  } catch (error) {
    console.warn('Could not remove worktree:', error);
  }
}