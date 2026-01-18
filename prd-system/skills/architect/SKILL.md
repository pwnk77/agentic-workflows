---
description: Architect skill - Systematic feature analysis and SPEC document generation through requirement crystallization and codebase exploration
mcp:
  specgen-mcp:
    command: npx
    args: ["-y", "specgen-mcp@latest"]
  static-analysis:
    command: npx
    args: ["-y", "@r-mcp/static-analysis"]
---

# Architect Skill

Systematic feature analysis and specification document generation for structured development.

## When to Use
- Starting a new feature or project
- Analyzing complex requirements
- Creating comprehensive implementation plans

## Workflow

### Phase 1: Requirement Crystallization
1. Deep analysis of the ask
2. Iterative clarification (target 95%+ confidence)
3. Identify risks and edge cases

### Phase 2: Codebase Exploration
Deploy specialized explorers:
- **backend-explorer**: Service patterns, APIs, authentication
- **frontend-explorer**: Components, state, routing
- **database-explorer**: Schema, migrations, relationships
- **integration-explorer**: External services, deployment
- **researcher**: Best practices, documentation

### Phase 3: Specification Generation
Generate `docs/SPEC-[YYYYMMDD]-[feature-name].md` with:
- Executive summary
- Product specifications
- Technical architecture
- Implementation plan (atomic tasks)
- Success metrics

## Usage
```
Use architect skill to analyze [feature description]
```

## Output
Specification document at `docs/SPEC-[YYYYMMDD]-[feature-name].md`

## Triggers
- "/architect"
- "analyze feature"
- "create specification"
- "plan this feature"

## Integration
- Outputs to **prd-author** for PRD creation
- Feeds **task-manager** for task breakdown
- Uses **specgen-mcp** for specification management
