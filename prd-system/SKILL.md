---
description: Create and manage Product Requirements Documents with structured workflow
mcp:
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/pwnsters-mac/Documents/GitHub/agentic-workflows/prd-system"]
---

# PRD Author Skill

Create, validate, and manage Product Requirements Documents in a structured workflow.

## Usage

### Create New PRD
```markdown
Use the prd-author skill to create a PRD with:
- Title: [project name]
- Description: [brief overview]
- Category: [feature|bugfix|enhancement]
- Priority: [high|medium|low]
```

### PRD Structure
Each PRD contains:
- Frontmatter metadata
- Overview (problem, solution, goals)
- Requirements (functional, non-functional)
- Architecture (current, proposed, technical)
- Implementation plan (phases, milestones)
- Success metrics (KPIs, acceptance criteria)
- Task checklist

## Integration
Works with task-manager for task creation and progress-tracker for updates.

## Examples

### Create Feature PRD
```
Use prd-author to create a PRD for user authentication:
- Category: feature
- Priority: high
- Description: Implement OAuth2 login with Google and GitHub
```

### Create Bugfix PRD
```
Use prd-author to create a PRD for fixing the login issue:
- Category: bugfix
- Priority: high
- Description: Fix session timeout redirect loop
```
