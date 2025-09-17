import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// Import existing tools (preserved functionality)
import { listSpecs } from '../tools/existing/list-specs.js';
import { getSpec } from '../tools/existing/get-spec.js';
import { searchSpecs } from '../tools/existing/search-specs.js';
import { refreshMetadata } from '../tools/existing/refresh-metadata.js';
import { launchDashboard } from '../tools/existing/launch-dashboard.js';

// Import new JSON tools (v3.1)
import { updateSpecSection } from '../tools/json/update-spec-section.js';
import { getSpecJSON } from '../tools/json/get-spec-json.js';
import { syncSpecFormats } from '../tools/json/sync-spec-formats.js';
import { createSpecJSON } from '../tools/json/create-spec-json.js';

// Import research tools (existing but not registered)
import { analyzeCode } from '../tools/research/analyze.js';
import { searchCode } from '../tools/research/search.js';
import { fetchResearch } from '../tools/research/fetch.js';
import { analyzeDependencies } from '../tools/research/dependencies.js';

// Import new spec management tools
import { createSpec } from '../tools/spec/create.js';
import { orchestrateSpec } from '../tools/spec/orchestrate.js';

// Import new build orchestrator tools
import { buildArchitect } from '../tools/build/architect.js';
import { buildEngineer } from '../tools/build/engineer.js';
import { buildReviewer } from '../tools/build/reviewer.js';

// Import worktree management tools
import { createWorktree } from '../tools/worktree/create.js';
import { listWorktrees } from '../tools/worktree/list.js';
import { worktreeStatus } from '../tools/worktree/status.js';
import { mergeWorktree } from '../tools/worktree/merge.js';
import { removeWorktree } from '../tools/worktree/remove.js';
import { pruneWorktrees } from '../tools/worktree/prune.js';

export class SpecGenServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'specgen-mcp-v3',
        version: '3.0.0',
        description: 'Advanced SpecGen MCP Server with tree-sitter analysis and self-sustained workflows'
      },
      { capabilities: { tools: {} } }
    );

    this.setupTools();
  }

  private setupTools() {
    // Register all tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Legacy tools (preserved with mcp__specgen-mcp__ prefix for backward compatibility)
        {
          name: 'mcp__specgen-mcp__list_specs',
          description: 'List all specification files with metadata from shared JSON',
          inputSchema: {
            type: 'object',
            properties: {
              status: { type: 'string', description: 'Filter by status (draft, todo, in-progress, done)' },
              category: { type: 'string', description: 'Filter by category' },
              limit: { type: 'number', description: 'Limit results' }
            },
            required: []
          }
        },
        {
          name: 'mcp__specgen-mcp__get_spec',
          description: 'Get specification content by filename or title',
          inputSchema: {
            type: 'object',
            properties: {
              feature: { type: 'string', description: 'Filename (SPEC-*.md) or title to search for' },
              format: { type: 'string', enum: ['markdown', 'json', 'auto'], description: 'Output format (default: auto)' }
            },
            required: ['feature']
          }
        },
        {
          name: 'mcp__specgen-mcp__search_specs',
          description: 'Search specifications by text query using shared JSON metadata',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              limit: { type: 'number', description: 'Limit results (default: 100)' }
            },
            required: ['query']
          }
        },
        {
          name: 'mcp__specgen-mcp__refresh_metadata',
          description: 'Scan docs folder and refresh shared JSON metadata',
          inputSchema: {
            type: 'object',
            properties: {
              reason: { type: 'string', description: 'Reason for refresh (optional)' }
            },
            required: []
          }
        },
        {
          name: 'mcp__specgen-mcp__launch_dashboard',
          description: 'Launch web dashboard for visual spec management',
          inputSchema: {
            type: 'object',
            properties: {
              port: { type: 'number', description: 'Port number (default: 3000)' }
            },
            required: []
          }
        },

        // New JSON tools (v3.1)
        {
          name: 'mcp__specgen-mcp__update_spec_section',
          description: 'Update a specific section of a JSON spec (solves token limits)',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Spec ID' },
              section: { type: 'string', enum: ['summary', 'requirements', 'architecture', 'implementation', 'execution_logs', 'debug_logs'], description: 'Section to update' },
              content: { type: 'string', description: 'New content for the section' },
              sync_to_markdown: { type: 'boolean', description: 'Sync to markdown after update (default: true)' }
            },
            required: ['id', 'section', 'content']
          }
        },
        {
          name: 'mcp__specgen-mcp__get_spec_json',
          description: 'Get spec in JSON format for LLM operations',
          inputSchema: {
            type: 'object',
            properties: {
              feature: { type: 'string', description: 'Filename or title to search for' },
              format: { type: 'string', enum: ['pretty', 'compact'], description: 'JSON formatting (default: pretty)' }
            },
            required: ['feature']
          }
        },
        {
          name: 'mcp__specgen-mcp__sync_spec_formats',
          description: 'Manual sync trigger between JSON and Markdown formats',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Spec ID to sync (required if all=false)' },
              direction: { type: 'string', enum: ['json-to-md', 'md-to-json', 'auto'], description: 'Sync direction (default: auto)' },
              all: { type: 'boolean', description: 'Sync all specs (default: false)' }
            },
            required: []
          }
        },
        {
          name: 'mcp__specgen-mcp__create_spec_json',
          description: 'Create a new spec in JSON format',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Spec title' },
              category: { type: 'string', description: 'Spec category (default: General)' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priority level (default: medium)' },
              summary: { type: 'string', description: 'Executive summary' },
              requirements: { type: 'string', description: 'Requirements section' },
              architecture: { type: 'string', description: 'Architecture section' },
              sync_to_markdown: { type: 'boolean', description: 'Sync to markdown after creation (default: true)' }
            },
            required: ['title']
          }
        },

        // NEW v3.0 TOOLS - Enhanced Specification Management (2 tools)
        {
          name: 'specgen_spec_create',
          description: 'Create new SPEC document with auto-generated metadata and optional worktree setup',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', minLength: 5, maxLength: 100, description: 'Specification title' },
              description: { type: 'string', minLength: 10, description: 'Feature description' },
              category: { type: 'string', enum: ['Architecture', 'Feature', 'Bugfix', 'Research'], description: 'Spec category' },
              createWorktree: { type: 'boolean', description: 'Create isolated worktree for development' },
              baseBranch: { type: 'string', description: 'Base branch for worktree' }
            },
            required: ['title', 'description']
          }
        },
        {
          name: 'specgen_spec_orchestrate',
          description: 'Smart orchestrator that determines next actions based on spec status and user intent',
          inputSchema: {
            type: 'object',
            properties: {
              specId: { type: 'string', description: 'Specification ID' },
              intent: { type: 'string', enum: ['analyze', 'implement', 'review', 'deploy'], description: 'User intent' },
              context: { type: 'string', description: 'Additional context (optional)' }
            },
            required: ['specId', 'intent']
          }
        },

        // Self-Sustained Build Orchestrators (3 tools)
        {
          name: 'specgen_build_architect',
          description: 'Multi-phase feature analysis using sequential thinking patterns',
          inputSchema: {
            type: 'object',
            properties: {
              specId: { type: 'string', description: 'Specification ID' },
              feature: { type: 'string', minLength: 10, description: 'Feature description for analysis' },
              depth: { type: 'string', enum: ['shallow', 'deep', 'comprehensive'], description: 'Analysis depth' },
              autoCreateWorktree: { type: 'boolean', description: 'Auto-create worktree for development' }
            },
            required: ['specId', 'feature']
          }
        },
        {
          name: 'specgen_build_engineer',
          description: 'Implementation pipeline with debug protocols',
          inputSchema: {
            type: 'object',
            properties: {
              specId: { type: 'string', description: 'Specification ID' },
              mode: { type: 'string', enum: ['implement', 'debug', 'continue'], description: 'Implementation mode' },
              layer: { type: 'string', enum: ['database', 'backend', 'frontend', 'integration', 'testing', 'all'], description: 'Implementation layer' },
              dryRun: { type: 'boolean', description: 'Simulate implementation without changes' }
            },
            required: ['specId']
          }
        },
        {
          name: 'specgen_build_reviewer',
          description: 'Multi-domain code assessment generating improvement specifications',
          inputSchema: {
            type: 'object',
            properties: {
              specId: { type: 'string', description: 'Specification ID' },
              scope: { type: 'array', items: { enum: ['security', 'performance', 'quality', 'architecture'] }, description: 'Review scope' },
              generateImprovementSpec: { type: 'boolean', description: 'Auto-generate improvement specification' },
              severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'all'], description: 'Minimum severity level' }
            },
            required: ['specId']
          }
        },

        // Tree-Sitter Research Tools (4 tools)
        {
          name: 'specgen_research_analyze',
          description: 'Language-agnostic codebase analysis using tree-sitter parsing',
          inputSchema: {
            type: 'object',
            properties: {
              paths: { type: 'array', items: { type: 'string' }, description: 'File/directory paths to analyze' },
              language: { type: 'string', enum: ['typescript', 'python', 'go', 'rust', 'javascript', 'auto'], description: 'Target language' },
              extractSymbols: { type: 'boolean', description: 'Extract symbol information' },
              findPatterns: { type: 'array', items: { type: 'string' }, description: 'Patterns to search for' },
              includeTests: { type: 'boolean', description: 'Include test files' }
            },
            required: ['paths']
          }
        },
        {
          name: 'specgen_research_search',
          description: 'Semantic code search across languages using AST queries',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', minLength: 3, description: 'Search query' },
              scope: { type: 'string', enum: ['symbols', 'imports', 'patterns', 'all'], description: 'Search scope' },
              language: { type: 'string', description: 'Target language (optional)' },
              maxResults: { type: 'number', minimum: 1, maximum: 100, description: 'Maximum results' },
              includeContext: { type: 'boolean', description: 'Include code context' }
            },
            required: ['query']
          }
        },
        {
          name: 'specgen_research_fetch',
          description: 'Web documentation and API reference gathering with intelligent caching',
          inputSchema: {
            type: 'object',
            properties: {
              topics: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Research topics' },
              sources: { type: 'array', items: { type: 'string' }, description: 'Preferred sources (optional)' },
              depth: { type: 'string', enum: ['quick', 'thorough', 'comprehensive'], description: 'Research depth' },
              maxPages: { type: 'number', minimum: 1, maximum: 50, description: 'Maximum pages to fetch' }
            },
            required: ['topics']
          }
        },
        {
          name: 'specgen_research_dependencies',
          description: 'Project dependency analysis with cross-language mapping',
          inputSchema: {
            type: 'object',
            properties: {
              includeTransitive: { type: 'boolean', description: 'Include transitive dependencies' },
              checkOutdated: { type: 'boolean', description: 'Check for outdated packages' },
              language: { type: 'string', description: 'Target language (optional)' }
            }
          }
        },

        // Git Worktree Management (6 tools)
        {
          name: 'specgen_worktree_create',
          description: 'Create isolated git worktree for spec development',
          inputSchema: {
            type: 'object',
            properties: {
              specId: { type: 'string', description: 'Specification ID' },
              baseBranch: { type: 'string', description: 'Base branch for worktree' },
              branchName: { type: 'string', description: 'Branch name (auto-generated if not provided)' },
              autoSetup: { type: 'boolean', description: 'Auto-configure worktree environment' },
              preserveOnError: { type: 'boolean', description: 'Preserve worktree on creation errors' }
            },
            required: ['specId']
          }
        },
        {
          name: 'specgen_worktree_list',
          description: 'List all active worktrees with git status and spec metadata',
          inputSchema: {
            type: 'object',
            properties: {
              includeStatus: { type: 'boolean', description: 'Include git status information' },
              filterActive: { type: 'boolean', description: 'Filter to active/dirty worktrees only' }
            }
          }
        },
        {
          name: 'specgen_worktree_status',
          description: 'Real-time git status for spec worktree with conflict detection',
          inputSchema: {
            type: 'object',
            properties: {
              specId: { type: 'string', description: 'Specification ID' },
              detailed: { type: 'boolean', description: 'Include detailed file changes' },
              checkUpstream: { type: 'boolean', description: 'Check upstream branch status' }
            },
            required: ['specId']
          }
        },
        {
          name: 'specgen_worktree_merge',
          description: 'Safe merge with pre-validation and conflict detection',
          inputSchema: {
            type: 'object',
            properties: {
              specId: { type: 'string', description: 'Specification ID' },
              targetBranch: { type: 'string', description: 'Target branch for merge' },
              strategy: { type: 'string', enum: ['merge', 'squash', 'rebase'], description: 'Merge strategy' },
              createPR: { type: 'boolean', description: 'Create pull request instead of direct merge' },
              removeAfterMerge: { type: 'boolean', description: 'Remove worktree after successful merge' },
              force: { type: 'boolean', description: 'Force merge (skip pre-checks)' }
            },
            required: ['specId']
          }
        },
        {
          name: 'specgen_worktree_remove',
          description: 'Safe removal with validation and cleanup',
          inputSchema: {
            type: 'object',
            properties: {
              specId: { type: 'string', description: 'Specification ID' },
              force: { type: 'boolean', description: 'Force removal (ignore uncommitted changes)' },
              cleanup: { type: 'boolean', description: 'Clean up metadata references' }
            },
            required: ['specId']
          }
        },
        {
          name: 'specgen_worktree_prune',
          description: 'Intelligent cleanup of stale and orphaned worktrees',
          inputSchema: {
            type: 'object',
            properties: {
              dryRun: { type: 'boolean', description: 'Preview changes without applying' },
              olderThan: { type: 'string', description: 'Age threshold (e.g., "7d", "2h", "30m")' }
            }
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Debug logging removed - CLI parameter parsing issue confirmed to be in MCP Inspector, not server

      try {
        switch (name) {
          // Legacy tools
          case 'mcp__specgen-mcp__list_specs':
            return await listSpecs(args);
          case 'mcp__specgen-mcp__get_spec':
            return await getSpec(args as any || {});
          case 'mcp__specgen-mcp__search_specs':
            return await searchSpecs(args as any || {});
          case 'mcp__specgen-mcp__refresh_metadata':
            return await refreshMetadata(args);
          case 'mcp__specgen-mcp__launch_dashboard':
            return await launchDashboard(args);

          // New v3.1 JSON tools
          case 'mcp__specgen-mcp__update_spec_section':
            return await updateSpecSection(args as any);
          case 'mcp__specgen-mcp__get_spec_json':
            return await getSpecJSON(args as any);
          case 'mcp__specgen-mcp__sync_spec_formats':
            return await syncSpecFormats(args as any);
          case 'mcp__specgen-mcp__create_spec_json':
            return await createSpecJSON(args as any);

          // Enhanced Specification Management Tools
          case 'specgen_spec_create':
            return await createSpec(args as any);
          case 'specgen_spec_orchestrate':
            return await orchestrateSpec(args as any);

          // Build Orchestrator Tools
          case 'specgen_build_architect':
            return await buildArchitect(args as any);
          case 'specgen_build_engineer':
            return await buildEngineer(args as any);
          case 'specgen_build_reviewer':
            return await buildReviewer(args as any);

          // Research Tools
          case 'specgen_research_analyze':
            return await analyzeCode(args as any);
          case 'specgen_research_search':
            return await searchCode(args as any);
          case 'specgen_research_fetch':
            return await fetchResearch(args as any);
          case 'specgen_research_dependencies':
            return await analyzeDependencies(args as any);

          // Worktree Management Tools
          case 'specgen_worktree_create':
            return await createWorktree(args as any);
          case 'specgen_worktree_list':
            return await listWorktrees(args as any);
          case 'specgen_worktree_status':
            return await worktreeStatus(args as any);
          case 'specgen_worktree_merge':
            return await mergeWorktree(args as any);
          case 'specgen_worktree_remove':
            return await removeWorktree(args as any);
          case 'specgen_worktree_prune':
            return await pruneWorktrees(args as any);

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Tool ${name} failed:`, error);
        throw new McpError(ErrorCode.InternalError, `Tool ${name} failed: ${error}`);
      }
    });
  }

  async start(transport: StdioServerTransport) {
    await this.server.connect(transport);
  }
}