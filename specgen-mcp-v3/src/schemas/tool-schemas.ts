import { z } from 'zod';

// Research tool schemas
export const AnalyzeSchema = z.object({
  paths: z.array(z.string()).min(1),
  language: z.enum(['typescript', 'python', 'go', 'rust', 'javascript', 'auto']).default('auto'),
  extractSymbols: z.boolean().default(true),
  findPatterns: z.array(z.string()).optional(),
  includeTests: z.boolean().default(false)
});

export const SearchSchema = z.object({
  query: z.string().min(3),
  scope: z.enum(['symbols', 'imports', 'patterns', 'all']).default('all'),
  language: z.string().optional(),
  maxResults: z.number().min(1).max(100).default(20),
  includeContext: z.boolean().default(true)
});

export const FetchSchema = z.object({
  topics: z.array(z.string()).min(1),
  sources: z.array(z.string()).optional(),
  depth: z.enum(['quick', 'thorough', 'comprehensive']).default('thorough'),
  maxPages: z.number().min(1).max(50).default(10)
});

export const DependenciesSchema = z.object({
  includeTransitive: z.boolean().default(false),
  checkOutdated: z.boolean().default(true),
  language: z.string().optional()
});

// Build tool schemas
export const ArchitectSchema = z.object({
  specId: z.string(),
  feature: z.string().min(10),
  depth: z.enum(['shallow', 'deep', 'comprehensive']).default('deep'),
  autoCreateWorktree: z.boolean().default(true)
});

export const EngineerSchema = z.object({
  specId: z.string(),
  mode: z.enum(['implement', 'debug', 'continue']).default('implement'),
  layer: z.enum(['database', 'backend', 'frontend', 'integration', 'testing', 'all']).default('all'),
  dryRun: z.boolean().default(false)
});

export const ReviewerSchema = z.object({
  specId: z.string(),
  scope: z.array(z.enum(['security', 'performance', 'quality', 'architecture'])),
  generateImprovementSpec: z.boolean().default(true),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'all']).default('high')
});

// Spec management schemas
export const CreateSpecSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10),
  category: z.enum(['Architecture', 'Feature', 'Bugfix', 'Research']),
  createWorktree: z.boolean().default(false),
  baseBranch: z.string().default('main')
});

export const OrchestrateSchema = z.object({
  specId: z.string(),
  intent: z.enum(['analyze', 'implement', 'review', 'deploy']),
  context: z.string().optional()
});

// Worktree schemas
export const CreateWorktreeSchema = z.object({
  specId: z.string(),
  baseBranch: z.string().default('main'),
  branchName: z.string().optional(),
  autoSetup: z.boolean().default(true),
  preserveOnError: z.boolean().default(true)
});

export const ListWorktreeSchema = z.object({
  includeStatus: z.boolean().default(true),
  filterActive: z.boolean().default(false)
});

export const StatusWorktreeSchema = z.object({
  specId: z.string(),
  detailed: z.boolean().default(false),
  checkUpstream: z.boolean().default(true)
});

export const MergeWorktreeSchema = z.object({
  specId: z.string(),
  targetBranch: z.string().default('main'),
  strategy: z.enum(['merge', 'squash', 'rebase']).default('squash'),
  createPR: z.boolean().default(false),
  removeAfterMerge: z.boolean().default(true),
  force: z.boolean().default(false)
});

export const RemoveWorktreeSchema = z.object({
  specId: z.string(),
  force: z.boolean().default(false),
  cleanup: z.boolean().default(true)
});

export const PruneWorktreeSchema = z.object({
  dryRun: z.boolean().default(false),
  olderThan: z.string().default('7d')
});

// Type exports
export type AnalyzeArgs = z.infer<typeof AnalyzeSchema>;
export type SearchArgs = z.infer<typeof SearchSchema>;
export type FetchArgs = z.infer<typeof FetchSchema>;
export type DependenciesArgs = z.infer<typeof DependenciesSchema>;
export type ArchitectArgs = z.infer<typeof ArchitectSchema>;
export type EngineerArgs = z.infer<typeof EngineerSchema>;
export type ReviewerArgs = z.infer<typeof ReviewerSchema>;
export type CreateSpecArgs = z.infer<typeof CreateSpecSchema>;
export type OrchestrateArgs = z.infer<typeof OrchestrateSchema>;
export type CreateWorktreeArgs = z.infer<typeof CreateWorktreeSchema>;
export type ListWorktreeArgs = z.infer<typeof ListWorktreeSchema>;
export type StatusWorktreeArgs = z.infer<typeof StatusWorktreeSchema>;
export type MergeWorktreeArgs = z.infer<typeof MergeWorktreeSchema>;
export type RemoveWorktreeArgs = z.infer<typeof RemoveWorktreeSchema>;
export type PruneWorktreeArgs = z.infer<typeof PruneWorktreeSchema>;