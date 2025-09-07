# Codex Guide – Using AGENTS.md

## Setup
- Place `AGENTS.md` in the project root.
- Organize project with `src/`, `tests/`, `docs/`, `config/`, `scripts/`, `plugins/`.

## Triggers
Use these in Codex CLI to activate modes:
- `ARCHITECT: [feature]` → create SPEC document in `docs/`
- `ENGINEER: [spec-file-or-description]` → implement tasks with logs
- `REVIEWER: [code-or-feature]` → analyze quality, performance, security
- `SCRIPTER: [automation-task]` → generate automation or DevOps script
- `PLUGIN: [plugin-spec]` → design or extend plugin architecture

## SPEC Workflow
- **Architect** creates SPEC in `docs/` using the template.
- **Engineer** implements tasks, updates `## Execution Logs` and `## Debug Logs`.
- **Reviewer** validates and suggests improvements.
- **Scripter** and **Plugin** extend automation and modularity.

## Best Practices
- Always start with a SPEC before coding.
- Keep SPEC updated as a living document.
- Use logs inside SPEC for traceability.
- Stay language-agnostic; adapt commands to your stack.
- Enforce tests, quality checks, and metrics defined in `AGENTS.md`.

## Optional
- MCP servers (SpecGen, Static Analysis, Search, Automation) can extend workflows, but are not required.
