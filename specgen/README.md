# SpecGen MCP - Project-Scoped Specification Management

[![npm version](https://badge.fury.io/js/specgen-mcp.svg)](https://www.npmjs.com/package/specgen-mcp)

A dramatically simplified, project-scoped specification management system for Claude Code with MCP (Model Context Protocol) integration. Eliminate complexity while providing seamless spec management through auto-detected project databases and global CLI installation.

## Features

- 🚀 **One-Command Setup**: Install via `claude mcp add` or `npx specgen-mcp`
- 📁 **Project-Scoped**: Each project gets its own isolated SQLite database
- 🔍 **Smart Import**: Automatically parse and categorize existing SPEC files
- 🤖 **Claude Code Integration**: Full MCP server for seamless Claude Code workflow
- ⚡ **High Performance**: SQLite with FTS5 search, <100ms operations
- 🎯 **Zero Configuration**: Works immediately after installation

## Quick Start

### 1. Install for Claude Code

```bash
# One-command installation via Claude Code CLI
claude mcp add specgen -s user -- npx -y specgen-mcp@latest
```

### 2. Initialize Your Project

```bash
# Initialize SpecGen in your project directory
npx specgen-mcp init
```

### 3. Import Existing SPEC Files

```bash
# Import existing specification files
npx specgen-mcp import docs/
```

### 4. Start MCP Server (Optional)

```bash
# Start standalone MCP server if needed
npx specgen-mcp start
```

### Alternative: Global Installation

```bash
# Install globally for direct CLI access
npm install -g specgen-mcp

# Then use directly
specgen init
specgen import docs/
```

## CLI Commands

- `init [directory]`: Initialize a new SpecGen project
- `import <directory> [pattern]`: Import SPEC files with smart parsing
- `start`: Start the MCP server for Claude Code integration
- `status`: Show project status and statistics

## MCP Tools

- `create_spec`: Create a new specification
- `update_spec`: Update an existing specification
- `get_spec`: Retrieve a specification by ID
- `delete_spec`: Delete a specification
- `list_specs`: List specifications with filtering and pagination
- `search_specs`: Full-text search across specifications
- `get_spec_stats`: Get project statistics

## Development

### Run Tests

```bash
npm test
```

---

**SpecGen Clean Architecture** - Simplifying specification management for Claude Code.