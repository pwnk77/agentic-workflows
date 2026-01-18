---
description: Progress Tracker skill - Monitor and update project progress with automated status tracking
mcp:
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/pwnsters-mac/Documents/GitHub/agentic-workflows/prd-system/tasks"]
---

# Progress Tracker Skill

Monitor, update, and report on project progress across all tasks.

## When to Use
- Checking overall project status
- Updating task completion
- Generating progress reports

## Core Features

### Status Monitoring
- Real-time progress percentage
- Task completion tracking
- Blocker identification

### Progress Updates
- Auto-calculate completion rate
- Update status timestamps
- Generate activity logs

### Reporting
- Summary reports
- Activity history
- Burndown visualization

## Triggers
- "show progress"
- "update progress"
- "track status"
- "generate report"

## Output
Updates to:
- `progress.md` in task folders
- Task status in individual task files

## Progress Dashboard

| Metric | Description |
|--------|-------------|
| Overall Status | on-track / at-risk / delayed |
| Completion % | Percentage of tasks complete |
| Active Tasks | Currently in progress |
| Completed Tasks | Finished tasks |
| Blocked Tasks | Tasks waiting on dependencies |

## Integration
- Reads from **task-manager** task files
- Updates **prd-author** PRD status
