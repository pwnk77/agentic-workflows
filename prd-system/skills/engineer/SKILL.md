---
description: Engineer skill - MCP-integrated systematic implementation of specifications with built-in debug protocol
mcp:
  specgen-mcp:
    command: npx
    args: ["-y", "specgen-mcp@latest"]
  static-analysis:
    command: npx
    args: ["-y", "@r-mcp/static-analysis"]
---

# Engineer Skill

Systematic implementation of specifications with debug protocol support.

## When to Use
- Implementing feature specifications
- Debugging and fixing issues
- Following architecture plans

## Modes

### Implement Mode (Default)
1. Read specification from MCP
2. Execute tasks sequentially
3. Log progress to MCP
4. Update task status

### Debug Mode
1. Analyze failed task
2. Review specification context
3. Identify root cause
4. Propose and implement fix

## Workflow

### Phase 1: Specification Loading
- Load spec from specgen MCP
- Parse architecture and implementation plan
- Identify technical requirements

### Phase 2: Task Execution
1. Execute atomic tasks in order
2. Update progress in spec document
3. Validate against acceptance criteria
4. Log execution details

### Phase 3: Validation
- Verify all requirements met
- Check test coverage
- Update success metrics

## Usage
```
Use engineer skill to implement [spec-file|spec-title]
Use engineer skill to debug [spec-file|spec-title] [issue-description]
```

## Output
- Implemented feature
- Updated spec document with execution logs
- Completed tasks

## Triggers
- "/engineer"
- "implement this spec"
- "build this feature"
- "debug this issue"

## Integration
- Reads from **architect** specs
- Creates tasks via **task-manager**
- Updates **progress-tracker**
