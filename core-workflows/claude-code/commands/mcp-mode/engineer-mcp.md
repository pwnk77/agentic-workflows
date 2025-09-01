# /engineer-mcp Command  

**Purpose**: Execute implementation tasks from database-stored specifications with real-time progress tracking.

**Usage**: 
- `/engineer-mcp spec://123` - Implement specific specification
- `/engineer-mcp "task description"` - Search and implement related task

**Description**: Loads specifications from the project database, parses implementation plans, executes tasks systematically, and updates progress in real-time. Follows the established engineer command pattern with database-first workflow.

## Command Syntax

```bash
/engineer-mcp spec://123
/engineer-mcp "implement user authentication"
/engineer-mcp spec://456
```

## Features

- **Database Loading**: Retrieves specifications directly from project database
- **Task Parsing**: Extracts implementation tasks from spec markdown content
- **Progress Tracking**: Updates task completion status in database in real-time  
- **Layer-by-Layer**: Executes tasks grouped by implementation layers
- **Spec Search**: Finds relevant specs when description provided instead of spec URL
- **Related Specs**: Loads and suggests related specifications during implementation
- **Logging Integration**: Updates spec with execution logs and timestamps

## Workflow

### Spec URL Mode (`spec://123`)
1. **Load Specification**: Retrieve spec from database with relationships
2. **Parse Tasks**: Extract implementation plan and task breakdown
3. **Layer Execution**: Execute tasks grouped by layers (Database → Backend → Frontend)
4. **Progress Updates**: Mark completed tasks in database after each completion
5. **Final Summary**: Report completion status and next steps

### Description Mode (`"implement feature"`)
1. **Spec Search**: Find relevant specifications using content search
2. **Spec Selection**: Present options or auto-select best match
3. **Task Creation**: Generate ad-hoc implementation tasks if no spec found
4. **Execution**: Follow same layer-by-layer approach
5. **Spec Updates**: Update or create specification with implementation details

## Task Execution Process

```
Database Layer → Backend Layer → Frontend Layer → Integration Layer → Testing Layer
     ↓                ↓               ↓                 ↓                ↓
  Task-001        Task-002        Task-003          Task-004         Task-005
     ↓                ↓               ↓                 ↓                ↓
  [COMPLETED]     [IN_PROGRESS]   [PENDING]         [PENDING]        [PENDING]
```

## Output

- Real-time task completion updates
- Layer completion summaries
- Database progress synchronization
- Related specification suggestions
- Implementation verification
- Next steps and recommendations

## Example Response

```
Loading specification: spec://123 "User Authentication System"

Implementation Plan Found:
- Database Layer: 3 tasks  
- Backend Layer: 4 tasks
- Frontend Layer: 2 tasks

Starting Database Layer...
✓ Executing DB-001: Create user schema migration
✓ Executing DB-002: Add authentication indexes  
✓ Executing DB-003: Create session management tables
✓ Database Layer completed (3/3 tasks)

Starting Backend Layer...
✓ Executing API-001: Implement authentication service
⚠ Executing API-002: Add JWT token management
✓ Executing API-003: Create login endpoints
✓ Executing API-004: Add password validation
✓ Backend Layer completed (4/4 tasks)

Implementation completed successfully!
- Total tasks: 9/9 completed
- Specification updated with progress logs
- Ready for testing and deployment

Next steps:
- Run test suite to verify implementation
- Review security configuration
- Deploy to staging environment
```

## Database Integration

- **Progress Tracking**: Updates `last_command: 'engineer-mcp'` with timestamps
- **Task Status**: Modifies spec body_md to mark completed tasks with `[x]`
- **Execution Logs**: Appends execution log section to specification
- **Related Updates**: Updates related specs with cross-references

## Error Handling

- Specification not found → Clear error with available specs list
- Invalid spec format → Guidance on proper implementation plan format  
- Task execution failure → Stops execution, logs failure, provides debug info
- Database connection issues → Fallback to local mode with sync later
- MCP tool failures → Graceful degradation with manual alternatives

## Integration with Architect

- Seamless handoff from `/architect-mcp` created specifications
- Maintains relationship data and grouping information
- Preserves detection metadata throughout implementation
- Enables iterative spec refinement during implementation