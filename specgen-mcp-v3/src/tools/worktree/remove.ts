import { z } from 'zod';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { StructuredErrorHandler } from '../../core/error-handler.js';

const RemoveWorktreeSchema = z.object({
  specId: z.string(),
  force: z.boolean().default(false),
  cleanup: z.boolean().default(true)
});

export async function removeWorktree(args: z.infer<typeof RemoveWorktreeSchema>): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    const { specId, force, cleanup } = RemoveWorktreeSchema.parse(args);

    const metadata = await loadWorktreeMetadata();
    const worktreeInfo = Object.values(metadata).find((meta: any) => meta.specId === specId);

    if (!worktreeInfo) {
      throw new Error(`Worktree for spec '${specId}' not found.`);
    }

    const { path: worktreePath, branch } = worktreeInfo as any;

    // Safety check for uncommitted changes
    if (!force) {
      const statusOutput = execSync('git status --porcelain', {
        cwd: worktreePath,
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      if (statusOutput.trim()) {
        throw new Error('Worktree has uncommitted changes. Use force flag to override.');
      }
    }

    // Remove worktree
    execSync(`git worktree remove "${worktreePath}" ${force ? '--force' : ''}`, {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    // Cleanup metadata
    if (cleanup) {
      const updatedMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([_, meta]: any) => meta.specId !== specId)
      );
      const metadataPath = path.join(process.cwd(), '.git', 'worktree-metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2), 'utf-8');
    }

    return {
      content: [{
        type: 'text',
        text: `✅ **Worktree Removed Successfully**

**Spec ID**: ${specId}
**Branch**: ${branch}
**Path**: ${worktreePath}
**Force**: ${force ? 'Yes' : 'No'}

## 🧹 Cleanup Summary
- Worktree directory removed
- Git worktree reference cleaned
${cleanup ? '- Metadata updated' : '- Metadata preserved'}

The isolated development environment for ${specId} has been safely removed.`
      }]
    };

  } catch (error: any) {
    return errorHandler.handleError('specgen.worktree.remove', error, { args, context: 'Removing worktree' });
  }
}

async function loadWorktreeMetadata() {
  try {
    const metadataPath = path.join(process.cwd(), '.git', 'worktree-metadata.json');
    return JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
  } catch { return {}; }
}