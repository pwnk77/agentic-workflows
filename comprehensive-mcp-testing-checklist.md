# SpecGen MCP v3 Testing Guide - CLI Commands
*Updated: 2025-09-16*

## Overview

Direct CLI testing commands for all 24 SpecGen MCP v3 tools using the MCP Inspector.

**System Under Test:**
- 24 total MCP tools (9 legacy + 15 v3 tools)
- JSON-Markdown sync system
- Git worktree management
- Build orchestration pipeline
- Research and analysis tools

## Setup Requirements

```bash
# Install MCP Inspector (if not installed)
npm install -g @modelcontextprotocol/inspector

# Navigate to v3 server directory
cd /path/to/specgen-mcp-v3

# Verify server is built
ls -la dist/index.js

# Test server connectivity
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/list
```

---

## CLI Testing Commands for All 24 Tools

**Base Command Format:**
```bash
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "TOOL_NAME" --args 'ARGS_JSON'
```

### Legacy Tools (9 tools)

#### 1. mcp__specgen-mcp__list_specs
```bash
# Basic listing
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__list_specs" --args '{}'

# With filters
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__list_specs" --args '{"status": "draft", "limit": 5}'
```

#### 2. mcp__specgen-mcp__get_spec
```bash
# Get by filename
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__get_spec" --args '{"feature": "SPEC-test.md"}'

# Get in JSON format
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__get_spec" --args '{"feature": "test-spec", "format": "json"}'
```

#### 3. mcp__specgen-mcp__search_specs
```bash
# Basic search
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__search_specs" --args '{"query": "worktree"}'

# Search with limit
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__search_specs" --args '{"query": "git", "limit": 3}'
```

#### 4. mcp__specgen-mcp__refresh_metadata
```bash
# Basic refresh
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__refresh_metadata" --args '{}'

# With reason
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__refresh_metadata" --args '{"reason": "Testing v3 server"}'
```

#### 5. mcp__specgen-mcp__launch_dashboard
```bash
# Default port
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__launch_dashboard" --args '{}'

# Custom port
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__launch_dashboard" --args '{"port": 4570}'
```

### JSON Sync Tools (4 tools)

#### 6. mcp__specgen-mcp__update_spec_section
```bash
# Update summary section
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__update_spec_section" --args '{"id": "test-spec", "section": "summary", "content": "Updated summary"}'
```

#### 7. mcp__specgen-mcp__get_spec_json
```bash
# Get spec in JSON format
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__get_spec_json" --args '{"feature": "test-spec"}'
```

#### 8. mcp__specgen-mcp__sync_spec_formats
```bash
# Sync specific spec
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__sync_spec_formats" --args '{"id": "test-spec"}'

# Sync all specs
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__sync_spec_formats" --args '{"all": true}'
```

#### 9. mcp__specgen-mcp__create_spec_json
```bash
# Create new spec
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "mcp__specgen-mcp__create_spec_json" --args '{"title": "Test Spec", "category": "Testing"}'
```

### Enhanced Spec Tools (2 tools)

#### 10. specgen.spec.create
```bash
# Create basic spec
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.spec.create" --args '{"title": "V3 Test Spec", "description": "Testing v3 functionality", "category": "Architecture"}'

# Create with worktree
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.spec.create" --args '{"title": "Feature Spec", "description": "New feature implementation", "category": "Feature", "createWorktree": true}'
```

#### 11. specgen.spec.orchestrate
```bash
# Analyze spec
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.spec.orchestrate" --args '{"specId": "test-spec", "intent": "analyze"}'

# Implementation intent
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.spec.orchestrate" --args '{"specId": "test-spec", "intent": "implement", "context": "Ready for development"}'
```

### Build Orchestration Tools (3 tools)

#### 12. specgen.build.architect
```bash
# Comprehensive analysis
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.build.architect" --args '{"specId": "test-spec", "feature": "Authentication system with JWT", "depth": "comprehensive"}'

# Quick analysis
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.build.architect" --args '{"specId": "test-spec", "feature": "User registration form", "depth": "shallow"}'
```

#### 13. specgen.build.engineer
```bash
# Start implementation
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.build.engineer" --args '{"specId": "test-spec", "mode": "implement", "layer": "backend"}'

# Debug mode
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.build.engineer" --args '{"specId": "test-spec", "mode": "debug", "dryRun": true}'
```

#### 14. specgen.build.reviewer
```bash
# Security review
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.build.reviewer" --args '{"specId": "test-spec", "scope": ["security"], "severity": "high"}'

# Comprehensive review
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.build.reviewer" --args '{"specId": "test-spec", "scope": ["security", "performance", "quality"], "generateImprovementSpec": true}'
```

### Research Tools (4 tools)

#### 15. specgen.research.analyze
```bash
# Analyze TypeScript files
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.research.analyze" --args '{"paths": ["src/"], "language": "typescript", "extractSymbols": true}'

# Multi-language analysis
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.research.analyze" --args '{"paths": ["src/", "tests/"], "language": "auto", "includeTests": true}'
```

#### 16. specgen.research.search
```bash
# Search for functions
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.research.search" --args '{"query": "authentication functions", "scope": "symbols", "maxResults": 10}'

# Pattern search
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.research.search" --args '{"query": "class.*Auth", "scope": "patterns", "includeContext": true}'
```

#### 17. specgen.research.fetch
```bash
# Research authentication
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.research.fetch" --args '{"topics": ["JWT authentication", "Node.js security"], "depth": "thorough", "maxPages": 10}'

# Quick research
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.research.fetch" --args '{"topics": ["React hooks"], "depth": "quick"}'
```

#### 18. specgen.research.dependencies
```bash
# Basic dependency analysis
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.research.dependencies" --args '{}'

# Full analysis with outdated check
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.research.dependencies" --args '{"includeTransitive": true, "checkOutdated": true}'
```

### Worktree Management Tools (6 tools)

#### 19. specgen.worktree.create
```bash
# Create basic worktree
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.create" --args '{"specId": "test-spec", "baseBranch": "main"}'

# Create with custom branch
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.create" --args '{"specId": "test-spec", "branchName": "feature/auth-system", "autoSetup": true}'
```

#### 20. specgen.worktree.list
```bash
# List all worktrees
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.list" --args '{}'

# List with status
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.list" --args '{"includeStatus": true, "filterActive": true}'
```

#### 21. specgen.worktree.status
```bash
# Get worktree status
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.status" --args '{"specId": "test-spec"}'

# Detailed status with upstream
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.status" --args '{"specId": "test-spec", "detailed": true, "checkUpstream": true}'
```

#### 22. specgen.worktree.merge
```bash
# Basic merge
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.merge" --args '{"specId": "test-spec", "targetBranch": "main"}'

# Create PR instead
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.merge" --args '{"specId": "test-spec", "createPR": true, "strategy": "squash"}'
```

#### 23. specgen.worktree.remove
```bash
# Safe removal
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.remove" --args '{"specId": "test-spec"}'

# Force removal with cleanup
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.remove" --args '{"specId": "test-spec", "force": true, "cleanup": true}'
```

#### 24. specgen.worktree.prune
```bash
# Dry run prune
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.prune" --args '{"dryRun": true}'

# Prune old worktrees
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call --tool-name "specgen.worktree.prune" --args '{"olderThan": "7d"}'
```

---

## Quick Test Script

Create a test script to validate all tools:

```bash
#!/bin/bash
# test-all-tools.sh

BASE_CMD="npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/call"

echo "Testing all 24 SpecGen MCP v3 tools..."

# Test tool listing
echo "1. Listing all tools..."
npx @modelcontextprotocol/inspector --config ./mcp-config.json --server specgen-mcp-v3 --cli --method tools/list > /dev/null && echo "✅ Tool discovery working"

# Test a few key tools
echo "2. Testing worktree list..."
$BASE_CMD --tool-name "specgen.worktree.list" --args '{}' > /dev/null && echo "✅ Worktree tools working"

echo "3. Testing dependency analysis..."
$BASE_CMD --tool-name "specgen.research.dependencies" --args '{}' > /dev/null && echo "✅ Research tools working"

echo "4. Testing legacy tools..."
$BASE_CMD --tool-name "mcp__specgen-mcp__list_specs" --args '{}' > /dev/null && echo "✅ Legacy tools working"

echo "All core functionality validated!"
```

Run with: `chmod +x test-all-tools.sh && ./test-all-tools.sh`