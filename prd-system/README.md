# PRD System - Product Requirements Document Management

A skill-based PRD system for agentic-workflows that enables task management, progress tracking, and seamless command-to-skill conversion.

## Features

- **PRD Management**: Create, track, and manage Product Requirements Documents
- **Task Tracking**: Link PRDs to actionable tasks with progress updates
- **Skill-Based**: All functionality exposed as reusable skills
- **Markdown-Based**: Pure markdown files for easy versioning and collaboration
- **Progress Automation**: Auto-update progress on task completion

## Usage

### Creating a New PRD
```
Use the prd-author skill to create a new Product Requirements Document
```

### Managing Tasks
```
Use the task-manager skill to create and track tasks
```

### Tracking Progress
```
Use the progress-tracker skill to update and monitor progress
```

## Folder Structure

```
prd-system/
├── README.md              # This file
├── PLAN.md                # Implementation plan
├── SKILL.md               # Main skill definition
├── prds/                  # PRD documents
│   ├── active/            # In-progress PRDs
│   ├── completed/         # Completed PRDs
│   └── archive/           # Archived PRDs
├── tasks/                 # Task tracking
│   └── [project-name]/    # Per-project task management
├── skills/                # Converted skills
│   ├── prd-author/
│   ├── task-manager/
│   └── progress-tracker/
└── templates/             # Document templates
```

## Integration

This system integrates with:
- **specgen-mcp**: For specification management
- **oh-my-opencode**: For agent coordination
- **Claude Code**: For AI-assisted workflow

## Commands → Skills Mapping

| Original Command | Skill | Purpose |
|-----------------|-------|---------|
| /architect | prd-author | PRD creation and architecture |
| /engineer | task-executor | Implementation from specs |
| /reviewer | code-reviewer | Code review workflows |
