import { z } from 'zod';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { StructuredErrorHandler } from '../../core/error-handler.js';

// Schema for specgen.worktree.list
const ListWorktreesSchema = z.object({
  includeStatus: z.boolean().default(true),
  filterActive: z.boolean().default(false)
});

type ListWorktreesInput = z.infer<typeof ListWorktreesSchema>;

interface WorktreeInfo {
  specId?: string;
  branch: string;
  path: string;
  isMain: boolean;
  status?: {
    dirty: boolean;
    ahead: number;
    behind: number;
    conflicts: string[];
  };
  metadata?: any;
}

interface ListWorktreesOutput {
  worktrees: WorktreeInfo[];
  metadata: {
    total: number;
    active: number;
    dirty: number;
  };
}

export async function listWorktrees(args: ListWorktreesInput): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    // Validate input
    const validated = ListWorktreesSchema.parse(args);
    const { includeStatus, filterActive } = validated;

    // Get git worktrees
    const worktrees = await getGitWorktrees();

    // Load worktree metadata
    const metadata = await loadWorktreeMetadata();

    // Process each worktree
    const processedWorktrees: WorktreeInfo[] = [];

    for (const worktree of worktrees) {
      const worktreeInfo: WorktreeInfo = {
        branch: worktree.branch || 'detached',
        path: worktree.path,
        isMain: worktree.isMain || false
      };

      // Find associated spec ID from metadata
      const metadataEntry = Object.values(metadata).find((meta: any) =>
        meta.branch === worktree.branch || meta.path === worktree.path
      );

      if (metadataEntry) {
        worktreeInfo.specId = (metadataEntry as any).specId;
        worktreeInfo.metadata = metadataEntry;
      }

      // Get git status if requested
      if (includeStatus) {
        worktreeInfo.status = await getWorktreeStatus(worktree.path);
      }

      // Filter active worktrees if requested
      if (filterActive && (!worktreeInfo.status?.dirty && !worktreeInfo.specId)) {
        continue;
      }

      processedWorktrees.push(worktreeInfo);
    }

    // Generate summary metadata
    const summaryMetadata = {
      total: processedWorktrees.length,
      active: processedWorktrees.filter(wt => wt.status?.dirty || wt.specId).length,
      dirty: processedWorktrees.filter(wt => wt.status?.dirty).length
    };

    const result: ListWorktreesOutput = {
      worktrees: processedWorktrees,
      metadata: summaryMetadata
    };

    return {
      content: [{
        type: 'text',
        text: `📁 **Git Worktrees Status**

## 📊 Overview
**Total Worktrees**: ${result.metadata.total}
**Active Development**: ${result.metadata.active}
**With Uncommitted Changes**: ${result.metadata.dirty}

${result.worktrees.length === 0 ? '⚠️ No worktrees found. Use `specgen.worktree.create` to create one.' : ''}

## 🌳 Worktree Details
${result.worktrees.map((wt, i) => `
### ${i + 1}. ${wt.isMain ? '📂 **MAIN REPOSITORY**' : `🌿 ${wt.specId || 'Unnamed Branch'}`}
**Branch**: ${wt.branch}
**Path**: ${wt.path}
${wt.specId ? `**Spec ID**: ${wt.specId}` : ''}
${wt.status ? `
**Status**: ${wt.status.dirty ? '🔄 **DIRTY**' : '✅ Clean'}
${wt.status.ahead > 0 ? `**Ahead**: ${wt.status.ahead} commits` : ''}
${wt.status.behind > 0 ? `**Behind**: ${wt.status.behind} commits` : ''}
${wt.status.conflicts.length > 0 ? `**Conflicts**: ${wt.status.conflicts.length} files` : ''}
` : ''}
${wt.metadata ? `**Created**: ${wt.metadata.created ? new Date(wt.metadata.created).toLocaleDateString() : 'Unknown'}` : ''}
`).join('')}

${result.metadata.dirty > 0 ? `
## ⚠️ Action Required
${result.worktrees.filter(wt => wt.status?.dirty).map(wt => `
- **${wt.specId || wt.branch}**: Uncommitted changes detected
  - Path: ${wt.path}
  - Action: Commit changes or use \`specgen.worktree.status(specId: "${wt.specId}")\`
`).join('')}
` : ''}

${result.worktrees.filter(wt => wt.status?.conflicts && wt.status.conflicts.length > 0).length > 0 ? `
## 🚨 Conflicts Detected
${result.worktrees.filter(wt => wt.status?.conflicts && wt.status.conflicts.length > 0).map(wt => `
- **${wt.specId || wt.branch}**: ${wt.status?.conflicts.length} conflicted files
  - Resolve conflicts before merging
  - Use \`specgen.worktree.status(specId: "${wt.specId}")\` for details
`).join('')}
` : ''}

## 🚀 Quick Actions
${result.worktrees.filter(wt => !wt.isMain).map(wt => `
- **${wt.specId || wt.branch}**:
  - Status: \`specgen.worktree.status(specId: "${wt.specId}")\`
  - Merge: \`specgen.worktree.merge(specId: "${wt.specId}")\`
  - Remove: \`specgen.worktree.remove(specId: "${wt.specId}")\`
`).join('')}

## 💡 Management Tips
- Use \`specgen.worktree.prune\` to clean up stale worktrees
- Check status regularly to avoid conflicts
- Commit changes frequently to track progress
- Use descriptive commit messages for better tracking

**Total development environments: ${result.worktrees.filter(wt => !wt.isMain).length}**`
      }]
    };

  } catch (error: any) {
    return errorHandler.handleError('specgen.worktree.list', error, {
      args,
      context: 'Listing git worktrees',
      suggestions: [
        'Ensure you are in a git repository',
        'Check git version supports worktrees (2.5+)',
        'Verify read access to .git directory'
      ]
    });
  }
}

// Helper functions
async function getGitWorktrees(): Promise<Array<{ branch?: string; path: string; isMain?: boolean }>> {
  try {
    const output = execSync('git worktree list --porcelain', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    const worktrees: Array<{ branch?: string; path: string; isMain?: boolean }> = [];
    const lines = output.split('\n');
    let currentWorktree: any = {};

    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        currentWorktree.path = line.replace('worktree ', '');
        currentWorktree.isMain = currentWorktree.path === process.cwd();
      } else if (line.startsWith('branch ')) {
        currentWorktree.branch = line.replace('branch refs/heads/', '');
      } else if (line.startsWith('detached') || line === '') {
        if (currentWorktree.path) {
          worktrees.push({ ...currentWorktree });
          currentWorktree = {};
        }
      }
    }

    // Add the last worktree if it exists
    if (currentWorktree.path) {
      worktrees.push(currentWorktree);
    }

    return worktrees;
  } catch (error: any) {
    if (error.message.includes('not a git repository')) {
      throw new Error('Not a git repository. Initialize git first.');
    }
    throw new Error(`Failed to list worktrees: ${error.message}`);
  }
}

async function loadWorktreeMetadata(): Promise<Record<string, any>> {
  try {
    const metadataPath = path.join(process.cwd(), '.git', 'worktree-metadata.json');
    const content = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // Metadata file doesn't exist or is invalid
    return {};
  }
}

async function getWorktreeStatus(worktreePath: string): Promise<{
  dirty: boolean;
  ahead: number;
  behind: number;
  conflicts: string[];
}> {
  try {
    // Check if path exists
    await fs.access(worktreePath);

    // Get status
    const statusOutput = execSync('git status --porcelain', {
      cwd: worktreePath,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    const isDirty = statusOutput.trim().length > 0;

    // Get ahead/behind info
    let ahead = 0;
    let behind = 0;
    try {
      const trackingOutput = execSync('git rev-list --left-right --count HEAD...@{u}', {
        cwd: worktreePath,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      const [aheadStr, behindStr] = trackingOutput.trim().split('\t');
      ahead = parseInt(aheadStr) || 0;
      behind = parseInt(behindStr) || 0;
    } catch (error) {
      // No upstream branch or other error
    }

    // Check for conflicts
    const conflicts: string[] = [];
    const lines = statusOutput.split('\n');
    for (const line of lines) {
      if (line.startsWith('UU ') || line.startsWith('AA ') || line.startsWith('DD ')) {
        conflicts.push(line.slice(3));
      }
    }

    return {
      dirty: isDirty,
      ahead,
      behind,
      conflicts
    };
  } catch (error) {
    // If we can't get status, assume clean
    return {
      dirty: false,
      ahead: 0,
      behind: 0,
      conflicts: []
    };
  }
}