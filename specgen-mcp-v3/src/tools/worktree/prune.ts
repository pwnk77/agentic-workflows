import { z } from 'zod';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { StructuredErrorHandler } from '../../core/error-handler.js';

const PruneWorktreesSchema = z.object({
  dryRun: z.boolean().default(false),
  olderThan: z.string().default('7d')
});

export async function pruneWorktrees(args: z.infer<typeof PruneWorktreesSchema>): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    const { dryRun, olderThan } = PruneWorktreesSchema.parse(args);

    // Parse age threshold
    const ageMs = parseTimeString(olderThan);
    const cutoffTime = Date.now() - ageMs;

    const metadata = await loadWorktreeMetadata();
    const prunedSpecs: string[] = [];
    const orphaned: string[] = [];
    const preserved: string[] = [];

    // Check each worktree
    for (const [sessionId, worktreeInfo] of Object.entries(metadata) as any) {
      const { specId, path: worktreePath, created } = worktreeInfo;
      const createdTime = new Date(created).getTime();

      // Check if worktree path still exists
      try {
        await fs.access(worktreePath);
      } catch (error) {
        orphaned.push(specId || sessionId);
        if (!dryRun) {
          delete metadata[sessionId];
        }
        continue;
      }

      // Check if worktree is stale
      if (createdTime < cutoffTime) {
        // Check for uncommitted changes
        try {
          const statusOutput = execSync('git status --porcelain', {
            cwd: worktreePath,
            encoding: 'utf-8',
            stdio: 'pipe'
          });

          if (!statusOutput.trim()) {
            // Clean worktree, safe to remove
            prunedSpecs.push(specId || sessionId);
            if (!dryRun) {
              execSync(`git worktree remove "${worktreePath}"`, { cwd: process.cwd(), stdio: 'pipe' });
              delete metadata[sessionId];
            }
          } else {
            preserved.push(`${specId} (has changes)`);
          }
        } catch (error) {
          preserved.push(`${specId} (status check failed)`);
        }
      } else {
        preserved.push(`${specId} (recent)`);
      }
    }

    // Update metadata if not dry run
    if (!dryRun && (prunedSpecs.length > 0 || orphaned.length > 0)) {
      const metadataPath = path.join(process.cwd(), '.git', 'worktree-metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    }

    return {
      content: [{
        type: 'text',
        text: `🧹 **Worktree Pruning ${dryRun ? 'Preview' : 'Complete'}**

## 📊 Pruning Summary
**Age Threshold**: ${olderThan}
**Pruned**: ${prunedSpecs.length} stale worktrees
**Orphaned**: ${orphaned.length} broken references
**Preserved**: ${preserved.length} active/recent worktrees

${prunedSpecs.length > 0 ? `## 🗑️ Pruned Worktrees
${prunedSpecs.map(spec => `- ${spec}`).join('\n')}
` : ''}

${orphaned.length > 0 ? `## 🔗 Orphaned References Removed
${orphaned.map(spec => `- ${spec}`).join('\n')}
` : ''}

${preserved.length > 0 ? `## 📁 Preserved Worktrees
${preserved.map(spec => `- ${spec}`).join('\n')}
` : ''}

## 💡 Pruning Rules
- Remove worktrees older than ${olderThan}
- Only clean worktrees (no uncommitted changes)
- Always preserve worktrees with active development
- Remove broken/orphaned metadata references

${dryRun ? `## 🔄 To Execute
Run without dry run flag to apply these changes:
\`specgen_worktree_prune(dryRun: false)\`
` : `## ✅ Cleanup Complete
${prunedSpecs.length + orphaned.length} worktrees cleaned up successfully.
`}

**Pruning ${dryRun ? 'preview' : 'operation'} completed.**`
      }]
    };

  } catch (error: any) {
    return errorHandler.handleError('specgen_worktree_prune', error, { args, context: 'Pruning stale worktrees' });
  }
}

function parseTimeString(timeStr: string): number {
  const match = timeStr.match(/^(\d+)([dhm])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

  const [, amount, unit] = match;
  const num = parseInt(amount);

  switch (unit) {
    case 'm': return num * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'd': return num * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

async function loadWorktreeMetadata() {
  try {
    const metadataPath = path.join(process.cwd(), '.git', 'worktree-metadata.json');
    return JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
  } catch { return {}; }
}