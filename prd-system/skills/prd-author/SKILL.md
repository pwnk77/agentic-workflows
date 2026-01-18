---
description: PRD Author skill - Create and manage Product Requirements Documents with structured workflow following PRD → Plan → Todo methodology
mcp:
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/pwnsters-mac/Documents/GitHub/agentic-workflows/prd-system/prds"]
---

# PRD Author Skill

Create, validate, and manage Product Requirements Documents using a structured workflow.

## When to Use
- Starting a new feature or project
- Documenting requirements for complex work
- Creating a shared understanding of what to build

## Workflow: PRD → Plan → Todo

### Step 1: Create PRD
Use this skill to generate a comprehensive PRD document.

### Step 2: Validate Requirements
- Review goals and non-goals
- Confirm acceptance criteria
- Identify dependencies

### Step 3: Extract Tasks
- Break down into actionable todos
- Link tasks to PRD sections
- Set priorities and due dates

## Triggers
- "create PRD"
- "write requirements document"
- "start a new feature"
- "document this feature"

## Output
A markdown file in `prd-system/prds/active/` with:
- Frontmatter metadata
- Structured sections
- Task checklist
- Progress tracking fields

## Example Usage

```
Use prd-author to create a PRD for:
- Project: User Authentication System
- Category: feature
- Priority: high
- Description: OAuth2 login with Google, GitHub, and email/password
```

## Integration
- Links to **task-manager** for task extraction
- Links to **progress-tracker** for status updates
