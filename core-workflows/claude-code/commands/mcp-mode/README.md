# MCP Mode Commands

Database-first Claude Code commands that integrate with MCP (Model Context Protocol) for intelligent specification management.

## Commands

### `/architect-mcp`

Create comprehensive feature specifications with intelligent grouping and relationship detection.

**Usage**: `/architect-mcp "Feature description"`

**Features**:
- Intelligent feature group detection (auth, ui, api, data, integration)
- Automatic theme categorization (backend, frontend, infrastructure) 
- Priority detection based on content analysis
- Relationship mapping with existing specifications
- Database-first workflow with no file system interaction

**Example**:
```bash
/architect-mcp "User authentication system with JWT tokens"
```

**Output**: `spec://123` URL with detected grouping and relationship suggestions

### `/engineer-mcp`

Execute implementation tasks from database-stored specifications with real-time progress tracking.

**Usage**: 
- `/engineer-mcp spec://123` - Implement specific specification
- `/engineer-mcp "task description"` - Search and implement related task

**Features**:
- Layer-by-layer task execution (Database → Backend → Frontend → Testing)
- Real-time progress updates in database
- Automatic task parsing from specification markdown
- Integration with related specifications
- Execution logging and completion tracking

**Example**:
```bash
/engineer-mcp spec://123
/engineer-mcp "implement user authentication"
```

**Output**: Progress updates and completion summary with next steps

## Architecture

### Database-First Workflow
```
User Command → MCP Tools → Project Database → Progress Tracking
      ↓              ↓            ↓               ↓
   Analysis    Intelligence   Persistence    Real-time Updates
```

### Intelligent Features
- **Grouping Service**: Analyzes content to detect feature groups and themes
- **Relationship Service**: Finds related specs and suggests connections
- **Progress Tracking**: Updates specifications in real-time during implementation
- **Cross-Spec References**: Maintains relationships between related specifications

## Integration

### MCP Tools Used
- `create_spec_with_grouping` - Create specs with intelligent metadata
- `search_related_specs` - Find related specifications  
- `get_spec` - Load specifications with relationships
- `update_spec` - Update progress and add execution logs
- `update_spec_relationships` - Manage spec relationships

### Database Schema
Enhanced specs table with:
- `feature_group` - Auto-detected feature category
- `theme_category` - Implementation theme (backend/frontend/integration)  
- `priority` - Implementation priority (low/medium/high)
- `related_specs` - JSON array of related specification IDs
- `parent_spec_id` - Hierarchy parent specification
- `created_via` - Command that created the specification
- `last_command` - Last command that modified the specification

## Workflow Example

1. **Architecture Phase**:
   ```bash
   /architect-mcp "REST API for user management"
   # → Creates spec://456 with detected group: api, theme: backend
   ```

2. **Implementation Phase**:  
   ```bash
   /engineer-mcp spec://456
   # → Executes tasks layer by layer with real-time updates
   ```

3. **Progress Tracking**:
   ```
   Database Layer: ✓ 3/3 tasks completed
   Backend Layer:  ⚠ 2/4 tasks in progress  
   API Layer:      ⏸ 0/3 tasks pending
   Testing Layer:  ⏸ 0/2 tasks pending
   ```

## Error Handling

- **Specification Not Found**: Clear error with available specs list
- **Invalid Format**: Guidance on proper implementation plan structure  
- **MCP Tool Failures**: Graceful degradation with alternative workflows
- **Database Issues**: Fallback modes with manual sync options
- **Task Execution Failures**: Detailed error logs with recovery suggestions

## Performance

- **Command Execution**: <3s for spec creation, <1s for spec loading
- **Search Performance**: <500ms for cross-spec relationship queries
- **Database Operations**: Optimized with indexes on grouping fields
- **Scale Handling**: 1000+ specs with efficient pagination and search

## Installation

1. Ensure SpecGen MCP server is running in project
2. Place command files in Claude Code commands directory
3. Register commands with Claude Code command system
4. Verify MCP tool connectivity

## Development

### File Structure
```
mcp-mode/
├── architect-mcp.md              # Command documentation
├── engineer-mcp.md               # Command documentation  
├── lib/
│   ├── base-mcp-command.ts       # Base class for MCP commands
│   ├── architect-mcp-command.ts  # Architect implementation
│   ├── engineer-mcp-command.ts   # Engineer implementation
│   └── spec-grouping.ts          # Grouping and analysis utilities
└── README.md                     # This file
```

### Testing
- Unit tests for command logic and MCP integration
- Integration tests with real database and MCP server
- Performance tests for large specification sets
- Error handling tests for various failure scenarios

## Next Steps

1. **Enhanced Intelligence**: Improve grouping accuracy with machine learning
2. **Visual Dashboard**: Add web interface for specification management
3. **Team Collaboration**: Add spec sharing and review workflows  
4. **Advanced Analytics**: Track implementation patterns and success metrics
5. **IDE Integration**: Direct integration with VS Code and other editors