# /architect-mcp Command

**Purpose**: Create comprehensive feature specifications using MCP integration with intelligent grouping and relationship detection.

**Usage**: `/architect-mcp "Feature description"`

**Description**: Generates detailed technical specifications by analyzing requirements, detecting feature groups and themes automatically, and suggesting related specifications from the database. Creates specifications directly in the project's spec database without file system interaction.

## Command Syntax

```bash
/architect-mcp "User authentication system with JWT tokens"
/architect-mcp "Dashboard component for displaying user metrics" 
/architect-mcp "MCP integration for external data synchronization"
```

## Features

- **Intelligent Analysis**: Automatically detects feature groups (auth, ui, api, data, integration) and themes (backend, frontend, infrastructure)
- **Priority Detection**: Analyzes content to determine implementation priority (low, medium, high)
- **Relationship Mapping**: Suggests related specifications from existing database
- **Database-First**: Creates specifications directly in project database via MCP tools
- **Standard Template**: Generates comprehensive specs following established patterns

## Workflow

1. **Requirement Analysis**: Parse user description and extract key information
2. **Content Generation**: Create structured specification using intelligent templates
3. **Group Detection**: Auto-detect feature group and theme category
4. **Relationship Analysis**: Find related specs and suggest connections
5. **Database Creation**: Store spec in database with metadata via MCP tools
6. **Response Formatting**: Return spec URL and detected metadata

## Output

- Specification created in project database
- `spec://ID` URL for immediate reference
- Detected grouping information (feature_group, theme_category, priority)
- Suggested relationships with existing specifications
- Success confirmation with spec title and group

## Example Response

```
✓ Created specification: "User Authentication System" (spec://123)
  
Detected Grouping:
- Feature Group: auth
- Theme Category: backend  
- Priority: high

Suggested Relationships:
- spec://45: "User Management System" (similarity: 0.85)
- spec://67: "Security Infrastructure" (prerequisite: 0.72)

Use `/engineer-mcp spec://123` to begin implementation.
```

## Integration

- Uses MCP `create_spec_with_grouping` tool for intelligent spec creation
- Leverages `search_related_specs` for relationship suggestions
- Stores metadata (`created_via: 'architect-mcp'`) for tracking
- Enables immediate handoff to `/engineer-mcp` command

## Error Handling

- Validates feature description is provided
- Handles MCP tool failures gracefully
- Provides specific error messages for database issues
- Suggests corrective actions for common problems