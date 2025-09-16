import { z } from 'zod';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { StructuredErrorHandler } from '../../core/error-handler.js';

// Schema for specgen.worktree.status
const StatusWorktreeSchema = z.object({
  specId: z.string(),
  detailed: z.boolean().default(false),
  checkUpstream: z.boolean().default(true)
});

type StatusWorktreeInput = z.infer<typeof StatusWorktreeSchema>;

interface StatusWorktreeOutput {
  specId: string;
  dirty: boolean;
  lastCommit: string;
  baseBranch: string;
  conflicts?: string[];
}

export async function worktreeStatus(args: StatusWorktreeInput): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    const validated = StatusWorktreeSchema.parse(args);
    const { specId, detailed, checkUpstream } = validated;

    // Load worktree metadata
    const metadata = await loadWorktreeMetadata();
    const worktreeInfo = Object.values(metadata).find((meta: any) => meta.specId === specId);

    if (!worktreeInfo) {
      throw new Error(`Worktree for spec '${specId}' not found. Use list to see available worktrees.`);
    }

    const { path: worktreePath, branch, baseBranch } = worktreeInfo as any;

    // Verify worktree path exists
    try {
      await fs.access(worktreePath);
    } catch (error) {
      throw new Error(`Worktree path does not exist: ${worktreePath}`);
    }

    // Get git status
    const statusOutput = execSync('git status --porcelain', {
      cwd: worktreePath,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    const isDirty = statusOutput.trim().length > 0;

    // Get last commit info
    const lastCommitOutput = execSync('git log -1 --pretty=format:"%h %s (%ar)"', {
      cwd: worktreePath,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    // Check for conflicts
    const conflicts: string[] = [];
    const lines = statusOutput.split('\n');
    for (const line of lines) {
      if (line.startsWith('UU ') || line.startsWith('AA ')) {
        conflicts.push(line.slice(3));
      }
    }

    // Get upstream info if requested
    let upstreamInfo = '';
    let aheadBehind = '';
    if (checkUpstream) {
      try {
        const trackingOutput = execSync('git rev-list --left-right --count HEAD...@{u}', {
          cwd: worktreePath,
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        const [ahead, behind] = trackingOutput.trim().split('\t');
        aheadBehind = `${ahead} ahead, ${behind} behind`;
      } catch (error) {
        aheadBehind = 'No upstream branch';
      }
    }

    // Get detailed file status if requested
    let fileDetails = '';
    if (detailed && isDirty) {
      const detailedStatus = execSync('git status --short', {
        cwd: worktreePath,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      fileDetails = detailedStatus;
    }

    return {
      content: [{
        type: 'text',
        text: `📊 **Worktree Status for ${specId}**

## 🌿 Git Information
**Branch**: ${branch}
**Base Branch**: ${baseBranch}
**Path**: ${worktreePath}
**Last Commit**: ${lastCommitOutput}

## 📋 Status Summary
**Clean**: ${isDirty ? '❌ No - Changes detected' : '✅ Yes - No uncommitted changes'}
${checkUpstream ? `**Upstream**: ${aheadBehind}` : ''}
${conflicts.length > 0 ? `**Conflicts**: 🚨 ${conflicts.length} files with conflicts` : '**Conflicts**: ✅ None detected'}

${conflicts.length > 0 ? `## 🚨 Conflicted Files\n${conflicts.map(file => `- ${file}`).join('\n')}\n\n` : ''}

${detailed && fileDetails ? `## 📁 File Changes\n\`\`\`\n${fileDetails}\`\`\`\n\n` : ''}

## 🚀 Available Actions
${isDirty ? '- **Commit Changes**: Use git commands in worktree directory' : ''}
${conflicts.length > 0 ? '- **Resolve Conflicts**: Fix conflicts before merging' : ''}
- **Merge**: \`specgen.worktree.merge(specId: "${specId}")\`
- **Remove**: \`specgen.worktree.remove(specId: "${specId}")\`

## 💡 Next Steps
${isDirty ? '1. Navigate to worktree and commit your changes' : '1. Ready for merge or continued development'}
${conflicts.length > 0 ? '2. Resolve conflicts before proceeding' : ''}
2. Use \`specgen.worktree.merge\` when ready to integrate
3. Use \`specgen.build.engineer\` to continue implementation

**Status**: ${isDirty ? 'Development in progress' : 'Ready for next action'}`
      }]
    };

  } catch (error: any) {
    return errorHandler.handleError('specgen.worktree.status', error, {
      args,
      context: 'Checking worktree git status'
    });
  }
}

async function loadWorktreeMetadata(): Promise<Record<string, any>> {
  try {
    const metadataPath = path.join(process.cwd(), '.git', 'worktree-metadata.json');
    const content = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
}