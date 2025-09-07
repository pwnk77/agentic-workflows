# SpecGen MCP Server Details

## Overview
SpecGen MCP Server provides specification management capabilities through Model Context Protocol integration. It enables context-aware specification discovery, retrieval, and dashboard management.

## Available Tools (5 total)

### 1. list_specs
**Purpose**: List all specification files with metadata  
**Parameters**:
- `status` (optional): Filter by status (draft, todo, in-progress, done)
- `category` (optional): Filter by category
- `limit` (optional): Limit number of results

**Returns**: All SPEC-*.md files with:
- Title, category, status, priority
- Created/modified timestamps
- File paths and metadata

**Usage Examples**:
```javascript
// Get all specs
list_specs()

// Get specs by status
list_specs(status: "in-progress")

// Get specs by category with limit
list_specs(category: "API", limit: 5)
```

### 2. get_spec  
**Purpose**: Retrieve full specification content by filename or title  
**Parameters**:
- `feature` (required): Filename (SPEC-*.md) or title search term

**Returns**: Complete markdown content of the specification

**Usage Examples**:
```javascript
// By filename
get_spec(feature: "SPEC-20250907-user-auth.md")

// By title search
get_spec(feature: "user authentication")

// By partial filename
get_spec(feature: "user-auth")
```

### 3. search_specs
**Purpose**: Full-text search across all specifications  
**Parameters**:
- `query` (required): Search text/keywords
- `limit` (optional): Maximum results (default: 100)

**Returns**: Matching specs with:
- Relevance scores
- Highlighted context snippets
- Full specification metadata

**Usage Examples**:
```javascript
// Basic search
search_specs(query: "authentication API")

// Limited results
search_specs(query: "database schema", limit: 10)

// Multi-keyword search
search_specs(query: "React components state management")
```

### 4. refresh_metadata
**Purpose**: Scan docs folder and refresh shared JSON metadata cache  
**Parameters**:
- `reason` (optional): Description of why refresh is needed

**Returns**: Status message with scan statistics

**Usage Examples**:
```javascript
// Basic refresh
refresh_metadata()

// With reason
refresh_metadata(reason: "architect command completed")

// After file changes
refresh_metadata(reason: "new SPEC files added")
```

**Important**: Always call after SPEC creation/modification for dashboard synchronization.

### 5. launch_dashboard
**Purpose**: Start web dashboard interface for visual spec management  
**Parameters**:
- `port` (optional): Port number (default: 4567)

**Returns**: Dashboard URL (http://localhost:PORT)

**Usage Examples**:
```javascript
// Default port
launch_dashboard()

// Custom port
launch_dashboard(port: 3000)

// For specific project
launch_dashboard(port: 5678)
```

**Important**: Run `refresh_metadata()` first to populate dashboard with all specs.

## Integration Patterns

### Commands Use MCP For:
- **Context Discovery**: `search_specs()` and `list_specs()` for finding related specifications
- **Category Management**: Understanding existing categories and patterns
- **Metadata Management**: `refresh_metadata()` after SPEC operations
- **Dashboard Access**: `launch_dashboard()` for visual management

### Agents Use Direct Operations:
- **File Reading**: `Glob + Read` pattern instead of MCP calls
- **SPEC Access**: Direct file operations for reliability
- **Context Passing**: Receive context from commands, don't call MCP directly

### Workflow Integration

**After architect command**:
```javascript
refresh_metadata(reason: "architect command completed")
launch_dashboard() // Optional, for immediate visualization
```

**After engineer command**:
```javascript
refresh_metadata(reason: "engineer command completed")
```

**For dashboard access**:
```javascript
refresh_metadata(reason: "preparing dashboard data")
launch_dashboard(port: 3000)
```

## File Structure

### Specifications
- **Location**: `docs/SPEC-*.md`
- **Format**: Markdown with YAML frontmatter
- **Naming**: `SPEC-YYYYMMDD-feature-name.md`

### Metadata Cache
- **File**: `docs/.spec-metadata.json`
- **Purpose**: Shared cache for fast spec operations
- **Updates**: Via `refresh_metadata()` calls

### Dashboard
- **Location**: `.specgen/specdash/`
- **Server**: Node.js Express server
- **Data Source**: Shared metadata JSON file

## Common Use Cases

### 1. Context-Aware Specification Creation
```javascript
// Check existing categories
list_specs()

// Search for related specs
search_specs(query: "authentication patterns")

// Create new spec with category context
// (handled by architect command)
```

### 2. Implementation Context Loading
```javascript
// Find spec for implementation
search_specs(query: "user dashboard API")

// Load specific spec
get_spec(feature: "SPEC-20250907-dashboard-api.md")

// Update metadata after implementation
refresh_metadata(reason: "implementation completed")
```

### 3. Project Overview and Management
```javascript
// Get all specs by status
list_specs(status: "in-progress")

// Launch visual dashboard
refresh_metadata()
launch_dashboard()

// Search across project specs
search_specs(query: "database migration")
```

## Error Handling

### Common Issues
1. **Path Resolution**: Uses current working directory (`process.cwd()`)
2. **Metadata Sync**: Always refresh metadata after file changes
3. **Port Conflicts**: Dashboard checks port availability
4. **File Access**: Validates file paths and permissions

### Troubleshooting
- **"ENOENT" errors**: Check if running from correct directory with `docs/` folder
- **Dashboard not loading**: Run `refresh_metadata()` first
- **Search returns empty**: Ensure SPEC files exist and metadata is current
- **Port issues**: Try different port or check for running processes

## Security & Architecture

### Read-Only MCP Operations
- All MCP tools are read-only for specifications
- Write operations handled by commands (architect/engineer/reviewer)
- Metadata updates via atomic writes
- Path validation and sanitization

### Dashboard Security
- Launches in controlled environment
- Process spawning with limited scope  
- Local access only (localhost)
- No external network access

## Performance Notes

- **Metadata Caching**: Fast operations via shared JSON cache
- **File System Monitoring**: Automatic change detection
- **Glob Patterns**: Efficient file discovery
- **Incremental Updates**: Smart metadata refresh logic

## Version Information

- **Current Version**: 2.2.1
- **MCP Protocol**: JSON-RPC 2.0 compliant
- **Node.js**: Requires 18+ for ES modules
- **Dependencies**: @modelcontextprotocol/sdk, glob, express