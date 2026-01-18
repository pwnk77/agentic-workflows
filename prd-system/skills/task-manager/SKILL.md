---
description: Task Manager skill - Create, track, and manage development tasks linked to PRDs
mcp:
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/pwnsters-mac/Documents/GitHub/agentic-workflows/prd-system/tasks"]
---

# Task Manager Skill

Create, assign, and track development tasks with PRD linking.

## When to Use
- Breaking down a PRD into actionable tasks
- Tracking individual work items
- Managing task dependencies

## Core Features

### Task Creation
- Auto-link to PRD
- Set priority and due dates
- Define acceptance criteria

### Task Tracking
- Update status (pending → in-progress → completed)
- Log progress notes
- Handle blockers

### Dependency Management
- Link related tasks
- Track blocking relationships
- Visualize dependency chains

## Triggers
- "create task"
- "break down this PRD"
- "add a todo"
- "track this task"

## Output
Markdown files in `prd-system/tasks/[project-name]/`

## Example Usage

```
Use task-manager to create tasks from PRD-20250118-user-auth:
- Task 1: Set up OAuth2 provider configuration
- Task 2: Create login UI components
- Task 3: Implement session management
- Task 4: Add logout functionality
```

## Task Status Flow
```
pending → in-progress → review → completed
                  ↓
              blocked
```

## Integration
- Reads from **prd-author** for context
- Updates **progress-tracker** on completion
