# MCP Server Installation Guide for Claude Code

## Overview
MCP (Model Context Protocol) servers can be configured in three ways in Claude Code:

## 1. Local stdio servers
- Run as local processes
- Ideal for tools needing direct system access
- Example command: `claude mcp add airtable --env AIRTABLE_API_KEY=YOUR_KEY -- npx -y airtable-mcp-server`

## 2. Remote SSE (Server-Sent Events) servers
- Provide real-time streaming connections
- Example command: `claude mcp add --transport sse linear https://mcp.linear.app/sse`

## 3. Remote HTTP servers
- Use standard request/response patterns
- Example command: `claude mcp add --transport http notion https://mcp.notion.com/mcp`

## Configuration Scopes
- **"Local" (default)**: Private to current project
- **"Project"**: Shared via `.mcp.json` file
- **"User"**: Available across all projects

## Important Installation Tips
- Use `--` to separate Claude's flags from server command
- Set environment variables with `--env` flags
- Use `/mcp` to authenticate servers requiring OAuth
- Windows users need `cmd /c` wrapper for `npx` commands

## Management Commands
- `claude mcp list` - List all configured MCP servers
- `claude mcp get github` - Get details of a specific server
- `claude mcp remove github` - Remove a server
- `claude mcp add` - Add a new server

## Static Analysis MCP Server Installation
Based on the fetched repository, to install the static-analysis MCP server:

```bash
# Install to Claude Code CLI
cd static-analysis
npm install
npm run install-code
```

This will:
1. Build the TypeScript project
2. Configure Claude Code to use `npx -y @r-mcp/static-analysis@latest`
3. Update the `~/.claude/mcp.json` configuration file
4. Restart Claude Code CLI to load the new configuration

## Available Tools in Static Analysis Server
1. **analyze_file** - Extract symbols, imports, and exports from TypeScript files
2. **analyze_symbol** - Get detailed information about functions, classes, interfaces
3. **find_references** - Track all usages of a symbol across codebase
4. **get_compilation_errors** - Get TypeScript compilation diagnostics