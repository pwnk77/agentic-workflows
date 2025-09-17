#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SpecGenServer } from './core/server.js';

// MCP Usage Instructions - Following MCP Best Practices
const MCP_INSTRUCTIONS = `
# SpecGen MCP Server v3.0.0
## Advanced Specification Management with Tree-Sitter Analysis and Self-Sustained Workflows

### 🔧 AVAILABLE TOOLS (16+ total)

## Legacy Tools (Preserved - 5 tools)
**mcp__specgen-mcp__list_specs** - List all specification files with metadata
**mcp__specgen-mcp__get_spec** - Retrieve full specification content
**mcp__specgen-mcp__search_specs** - Full-text search across specifications
**mcp__specgen-mcp__refresh_metadata** - Scan and update metadata cache
**mcp__specgen-mcp__launch_dashboard** - Start web dashboard interface

## Enhanced Spec Management (2 tools)
**specgen_spec_create** - Create new SPEC document with auto-generated metadata and optional worktree setup
**specgen_spec_orchestrate** - Smart orchestrator that determines next actions based on spec status and user intent

## Self-Sustained Build Orchestrators (3 tools)
**specgen_build_architect** - Multi-phase feature analysis using sequential thinking patterns
**specgen_build_engineer** - Implementation pipeline with debug protocols
**specgen_build_reviewer** - Multi-domain code assessment generating improvement specifications

## Tree-Sitter Research Tools (4 tools)
**specgen_research_analyze** - Language-agnostic codebase analysis using tree-sitter parsing
**specgen_research_search** - Semantic code search across languages using AST queries
**specgen_research_fetch** - Web documentation and API reference gathering with intelligent caching
**specgen_research_dependencies** - Project dependency analysis with cross-language mapping

## Git Worktree Management (6 tools)
**specgen_worktree_create** - Create isolated git worktree for spec development
**specgen_worktree_list** - List all active worktrees with git status and spec metadata
**specgen_worktree_status** - Real-time git status for spec worktree with conflict detection
**specgen_worktree_merge** - Safe merge with pre-validation, conflict detection, and optional PR creation
**specgen_worktree_remove** - Safe removal with validation, backup options, and cleanup
**specgen_worktree_prune** - Intelligent cleanup of stale and orphaned worktrees

### 🧠 SEQUENTIAL THINKING INTEGRATION
All build tools use sequential thinking patterns for transparency:
- Multi-phase workflow coordination
- Transparent reasoning with thought progression
- Dynamic adjustment based on intermediate results
- Clear documentation of AI decision-making process

### 🌳 TREE-SITTER CAPABILITIES
- Language-agnostic symbol extraction (TypeScript, Python, Go, Rust, JavaScript)
- Semantic AST queries for intelligent code search
- Cross-language dependency mapping and analysis
- Pattern recognition and architectural analysis

### 🔧 WORKFLOW ORCHESTRATION
Instead of manual tool selection, use intelligent orchestrators:
- **specgen_build_architect** replaces manual research coordination
- **specgen_build_engineer** replaces manual implementation steps
- **specgen_build_reviewer** replaces manual code assessment
- **specgen_spec_orchestrate** provides smart next-action recommendations

### 🚀 KEY IMPROVEMENTS OVER V2
1. **Self-Sustained Workflows**: Tools coordinate automatically instead of manual orchestration
2. **Tree-Sitter Analysis**: Deep code understanding across multiple languages
3. **Git Worktree Integration**: Parallel development with automatic isolation
4. **Sequential Thinking**: Transparent AI reasoning with step-by-step explanations
5. **Performance Optimization**: Intelligent caching with TTL and invalidation
6. **Enhanced Error Handling**: Structured responses with recovery suggestions

### 📁 COMPATIBILITY & MIGRATION
- ✅ **100% Backward Compatible**: All existing v2 tools preserved with mcp__specgen-mcp__ prefix
- ✅ **Gradual Adoption**: Use new tools alongside existing workflows
- ✅ **Same File Structure**: Uses existing docs/ folder and .spec-metadata.json
- ✅ **Dashboard Integration**: Enhanced dashboard with new capabilities

### 🔒 SECURITY & PERFORMANCE
- Permission validation for destructive operations
- Audit logging for all state changes
- Intelligent caching with configurable TTL
- Timeout protection for long-running operations
- Safe git operations with conflict detection

### 💡 USAGE EXAMPLES

**Traditional Approach (v2):**
\`\`\`
mcp__specgen-mcp__search_specs(query: "authentication")
mcp__specgen-mcp__get_spec(feature: "auth-system")
// Manual analysis and implementation steps...
\`\`\`

**Modern Approach (v3):**
\`\`\`
specgen_build_architect(specId: "auth-system", feature: "JWT authentication with refresh tokens")
// Automatically coordinates research, analysis, and planning
// Returns comprehensive architectural analysis with next steps
\`\`\`

**Worktree Development:**
\`\`\`
specgen_worktree_create(specId: "payment-integration", autoSetup: true)
specgen_build_engineer(specId: "payment-integration", mode: "implement")
specgen_worktree_merge(specId: "payment-integration", createPR: true)
\`\`\`
`;

async function main() {
  const server = new SpecGenServer();
  const transport = new StdioServerTransport();

  await server.start(transport);

  // Output instructions to stderr for Claude
  console.error('SpecGen MCP Server v3.0 started');
  console.error(MCP_INSTRUCTIONS);
}

main().catch(console.error);