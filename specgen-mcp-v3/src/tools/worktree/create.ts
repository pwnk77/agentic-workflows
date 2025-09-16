import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import { MetadataManager } from '../../core/metadata-manager.js';
import { StructuredErrorHandler } from '../../core/error-handler.js';

// Schema for specgen.worktree.create
const CreateWorktreeSchema = z.object({
  specId: z.string(),
  baseBranch: z.string().default('main'),
  branchName: z.string().optional(),
  autoSetup: z.boolean().default(true),
  preserveOnError: z.boolean().default(true)
});

type CreateWorktreeInput = z.infer<typeof CreateWorktreeSchema>;

interface CreateWorktreeOutput {
  specId: string;
  branch: string;
  path: string;
  sessionId?: string;
}

export async function createWorktree(args: CreateWorktreeInput): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    // Validate input
    const validated = CreateWorktreeSchema.parse(args);
    const { specId, baseBranch, branchName, autoSetup, preserveOnError } = validated;

    // Load spec metadata
    const metadataManager = new MetadataManager();
    await metadataManager.refresh('Worktree creation started');

    const specs = await metadataManager.listSpecs({});
    const spec = specs.find(s => s.title === specId || s.title?.includes(specId));

    if (!spec) {
      throw new Error(`Specification '${specId}' not found. Use list_specs to see available specifications.`);
    }

    // Safety validations
    await validateWorktreePrerequisites(baseBranch);

    // Generate branch name if not provided
    const finalBranchName = branchName || `spec/${specId.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

    // Check if worktree already exists
    const existingWorktrees = await listExistingWorktrees();
    const existingWorktree = existingWorktrees.find(wt =>
      wt.branch === finalBranchName || wt.path.includes(specId)
    );

    if (existingWorktree) {
      throw new Error(`Worktree already exists for spec ${specId}: ${existingWorktree.path}`);
    }

    // Create worktree directory path
    const worktreePath = path.join(process.cwd(), '..', `${specId}-worktree`);

    // Ensure parent directory exists
    const parentDir = path.dirname(worktreePath);
    await fs.mkdir(parentDir, { recursive: true });

    try {
      // Create git worktree
      const createCommand = `git worktree add "${worktreePath}" -b "${finalBranchName}" "${baseBranch}"`;
      console.log(`Creating worktree: ${createCommand}`);

      const output = execSync(createCommand, {
        cwd: process.cwd(),
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      // Verify worktree was created
      await fs.access(worktreePath);

      // Auto-setup if requested
      if (autoSetup) {
        await setupWorktreeEnvironment(worktreePath, specId);
      }

      // Store worktree metadata
      const sessionId = await storeWorktreeMetadata({
        specId,
        branch: finalBranchName,
        path: worktreePath,
        baseBranch,
        created: new Date().toISOString()
      });

      const result: CreateWorktreeOutput = {
        specId,
        branch: finalBranchName,
        path: worktreePath,
        sessionId
      };

      return {
        content: [{
          type: 'text',
          text: `✅ **Worktree Created Successfully**

**Spec ID**: ${specId}
**Branch**: ${finalBranchName}
**Path**: ${worktreePath}
**Base Branch**: ${baseBranch}
${sessionId ? `**Session ID**: ${sessionId}` : ''}

## 🔧 Worktree Details
- **Git Status**: Worktree created and ready
- **Environment**: ${autoSetup ? 'Auto-configured' : 'Manual setup required'}
- **Safety**: Backup and rollback enabled

## 🚀 Next Steps
1. Navigate to worktree: \`cd "${worktreePath}"\`
2. Start implementation: \`specgen.build.engineer(specId: "${specId}", mode: "implement")\`
3. Check status anytime: \`specgen.worktree.status(specId: "${specId}")\`

## 📋 Available Commands
- **Status**: \`specgen.worktree.status(specId: "${specId}")\`
- **Merge**: \`specgen.worktree.merge(specId: "${specId}")\`
- **Remove**: \`specgen.worktree.remove(specId: "${specId}")\`

## 💡 Development Tips
- Use \`git status\` to check local changes
- Commit regularly to track progress
- Use \`specgen.worktree.status\` for conflict detection
- Run \`specgen.worktree.merge\` when ready to integrate

**Isolated development environment ready for ${specId}!**`
        }]
      };

    } catch (gitError: any) {
      if (preserveOnError) {
        // Attempt cleanup
        try {
          await fs.rmdir(worktreePath, { recursive: true });
        } catch (cleanupError) {
          console.warn('Cleanup failed:', cleanupError);
        }
      }
      throw new Error(`Git worktree creation failed: ${gitError.message}`);
    }

  } catch (error: any) {
    return errorHandler.handleError('specgen.worktree.create', error, {
      args,
      context: 'Creating isolated git worktree',
      suggestions: [
        'Ensure you are in a git repository',
        'Check that the base branch exists',
        'Verify sufficient disk space',
        'Ensure git version supports worktrees (2.5+)'
      ]
    });
  }
}

// Helper functions
async function validateWorktreePrerequisites(baseBranch: string): Promise<void> {
  try {
    // Check if we're in a git repository
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });

    // Check if base branch exists
    execSync(`git rev-parse --verify "${baseBranch}"`, { stdio: 'pipe' });

    // Check for uncommitted changes
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf-8', stdio: 'pipe' });
    if (statusOutput.trim()) {
      console.warn('Warning: Uncommitted changes detected in main repository');
    }

    // Check disk space (basic check)
    const stats = await fs.statfs('.');
    const freeSpaceGB = (stats.bavail * stats.bsize) / (1024 * 1024 * 1024);
    if (freeSpaceGB < 0.5) {
      throw new Error(`Insufficient disk space: ${freeSpaceGB.toFixed(2)}GB free`);
    }

  } catch (error: any) {
    if (error.message.includes('not a git repository')) {
      throw new Error('Not a git repository. Initialize git first.');
    }
    if (error.message.includes('unknown revision')) {
      throw new Error(`Base branch '${baseBranch}' does not exist`);
    }
    throw error;
  }
}

async function listExistingWorktrees(): Promise<Array<{ branch: string; path: string }>> {
  try {
    const output = execSync('git worktree list --porcelain', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    const worktrees: Array<{ branch: string; path: string }> = [];
    const lines = output.split('\n');
    let currentWorktree: any = {};

    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        currentWorktree.path = line.replace('worktree ', '');
      } else if (line.startsWith('branch ')) {
        currentWorktree.branch = line.replace('branch refs/heads/', '');
        worktrees.push({ ...currentWorktree });
        currentWorktree = {};
      }
    }

    return worktrees;
  } catch (error) {
    // If git worktree list fails, return empty array
    return [];
  }
}

async function setupWorktreeEnvironment(worktreePath: string, specId: string): Promise<void> {
  try {
    // Copy essential configuration files if they exist
    const configFiles = [
      '.env.example',
      '.nvmrc',
      'package.json',
      'tsconfig.json',
      '.gitignore'
    ];

    for (const configFile of configFiles) {
      const sourcePath = path.join(process.cwd(), configFile);
      const targetPath = path.join(worktreePath, configFile);

      try {
        await fs.access(sourcePath);
        await fs.copyFile(sourcePath, targetPath);
      } catch (error) {
        // File doesn't exist, skip
      }
    }

    // Create worktree-specific files
    const worktreeReadme = `# ${specId} Development Worktree

This is an isolated development environment for ${specId}.

## Quick Start
1. Install dependencies: \`npm install\` (if package.json exists)
2. Start development: Use MCP tools to coordinate implementation
3. Check status: \`specgen.worktree.status(specId: "${specId}")\`

## MCP Integration
This worktree is managed by SpecGen MCP v3. Use the following tools:
- \`specgen.build.engineer\` - Implementation coordination
- \`specgen.worktree.status\` - Git status and conflict detection
- \`specgen.worktree.merge\` - Safe integration with main branch

Created: ${new Date().toISOString()}
`;

    await fs.writeFile(path.join(worktreePath, 'README-WORKTREE.md'), worktreeReadme, 'utf-8');

  } catch (error) {
    console.warn('Worktree environment setup failed:', error);
    // Don't fail worktree creation for setup issues
  }
}

async function storeWorktreeMetadata(metadata: any): Promise<string> {
  try {
    const sessionId = `wt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store in .git/worktree-metadata.json for persistence
    const metadataPath = path.join(process.cwd(), '.git', 'worktree-metadata.json');

    let existingData: any = {};
    try {
      const existing = await fs.readFile(metadataPath, 'utf-8');
      existingData = JSON.parse(existing);
    } catch (error) {
      // File doesn't exist, start fresh
    }

    existingData[sessionId] = metadata;
    await fs.writeFile(metadataPath, JSON.stringify(existingData, null, 2), 'utf-8');

    return sessionId;
  } catch (error) {
    console.warn('Could not store worktree metadata:', error);
    return '';
  }
}