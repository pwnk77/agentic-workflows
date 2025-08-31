# SpecGen MCP - Project-Scoped Specification Management

[![npm version](https://badge.fury.io/js/specgen-mcp.svg)](https://www.npmjs.com/package/specgen-mcp)

A dramatically simplified, project-scoped specification management system for Claude Code with MCP (Model Context Protocol) integration. Eliminate complexity while providing seamless spec management through auto-detected project databases and global CLI installation.

## Features

- 🚀 **One-Command Setup**: Install globally with `npm install -g specgen-mcp`
- 📁 **Project-Scoped**: Each project gets its own isolated SQLite database
- 🔍 **Smart Import**: Automatically parse and categorize existing SPEC files
- 🤖 **Claude Code Integration**: Full MCP server for seamless Claude Code workflow
- ⚡ **High Performance**: SQLite with FTS5 search, <100ms operations
- 🎯 **Zero Configuration**: Works immediately after installation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Initialize Your Project

```bash
node dist/cli/index.js init
```

### 4. Import Existing SPEC Files

```bash
node dist/cli/index.js import docs/
```

### 5. Start MCP Server for Claude Code

```bash
node dist/cli/index.js start
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