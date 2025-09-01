# 🚀 Quick Installation Guide

*One-command setup for specgen MCP, Static Analysis MCP, and Claude Code Workflows*

## 📦 MCP Tools Installation

### SpecGen MCP - Project Specification Management

**Install globally via npx:**
```bash
# Install SpecGen MCP for Claude Code
claude mcp add specgen -s user -- npx -y specgen-mcp@latest
```

**Usage after installation:**
```bash
# In any project directory
npx specgen-mcp init
npx specgen-mcp import docs/
npx specgen-mcp start
```

**Features:**
- 📁 Project-scoped SQLite databases
- 🔍 Smart import of existing SPEC files  
- 🤖 Full MCP integration with Claude Code
- ⚡ FTS5 search with <100ms operations

### Static Analysis MCP - TypeScript Code Analysis

**Install for Claude Code:**
```bash
# Install Static Analysis MCP
claude mcp add static-analysis -s user -- npx -y @r-mcp/static-analysis@latest
```

**Features:**
- 🔍 Deep TypeScript file analysis
- 📊 Symbol analysis with type information
- 🔗 Reference finding across codebase
- ⚠️ Compilation error detection
- 🚀 Intelligent caching and performance optimization

**Requirements:**
- Node.js 18+
- TypeScript project with `tsconfig.json`

### Popular Additional MCP Tools

**Filesystem Operations:**
```bash
claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem ~/Documents ~/Desktop ~/Downloads ~/Projects
```

**Web Automation (Playwright):**
```bash
claude mcp add playwright -s user -- npx -y @executeautomation/playwright-mcp-server
```

**Sequential Thinking:**
```bash
claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking
```

## 🤖 Claude Code Workflows Setup

### Complete Configuration
```bash
# Copy all configurations to your project
cp -r /path/to/agentic-workflows/core-workflows/claude-code/.claude/ .

# Start with auto mode
/build "your feature description"
```

### Individual Components
```bash
# Just the workflows
cp /path/to/agentic-workflows/core-workflows/claude-code/commands/* .claude/commands/
cp /path/to/agentic-workflows/core-workflows/claude-code/agents/* .claude/agents/

# Add intelligent hooks
cp /path/to/agentic-workflows/core-workflows/claude-code/hooks/notification.sh .claude/hooks/
cp /path/to/agentic-workflows/core-workflows/claude-code/settings.local.json .claude/
```

## 🔧 Auto Mode Commands

**Available Commands:**
- **`/build`**: Complete feature development (architecture → implementation → testing)
- **`/fix`**: Systematic bug resolution with quality verification
- **`/quality-check`**: Parallel security, performance, and code quality analysis  
- **`/user-check`**: UX validation with authentic user behavior simulation

**Example Usage:**
```bash
# Complete feature development
/build "add user authentication with OAuth and JWT tokens"

# Bug resolution
/fix "checkout process fails on mobile Safari with payment validation errors"

# Quality assurance
/quality-check "review entire payment system before production deployment"
```

## ⚙️ Control Mode Workflows

**Available Workflows:**
- **`architect`**: System design and feature planning
- **`engineer`**: Implementation execution from specifications
- **`security`**: Security audits and compliance validation
- **`performance`**: Performance optimization and scalability analysis
- **`quality`**: Code maintainability and technical debt assessment
- **`user`**: UX testing with realistic user scenarios

## 🔍 Verification

**Check MCP installations:**
```bash
# List all installed MCP servers
claude mcp list

# In Claude Code, verify tools are available
/mcp
```

**Test SpecGen:**
```bash
# Initialize in a project
npx specgen-mcp init

# Check status
npx specgen-mcp status
```

**Test Static Analysis:**
```bash
# Should work automatically in TypeScript projects
# Try asking Claude to analyze a .ts file
```

## 🔒 Security Configuration

The workflows include granular permission controls:

```json
{
  "permissions": {
    "allow": [
      "Read:*", "Write:*", "Edit:*", "MultiEdit:*",
      "Bash(git status:*)", "Bash(npm test:*)", "Bash(npm run build:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)", "Bash(sudo:*)", "Bash(git push:*)",
      "Bash(npm run dev:*)", "Bash(kill:*)"
    ]
  }
}
```

## 🆘 Troubleshooting

**MCP Tools Not Working:**
- Restart Claude Code CLI after installation
- Verify Node.js 18+ is installed
- Check MCP server status with `claude mcp list`

**specgen Issues:**
- Ensure you're in a project directory for `init`
- Check SQLite database permissions
- Verify TypeScript compilation for MCP integration

**Static Analysis Issues:**
- Confirm `tsconfig.json` exists in project
- Check TypeScript project structure
- Verify file paths are accessible
