# Save Engine - Context Preservation and Progress Tracking

## Usage
/save - Automatically saves data into  `docs/execution.md` (create if file not found) and performs git commits

## Comprehensive State Preservation

## Session Overview

**Session State Summary**: [X] tasks finished, [Y] files modified, [Z]% project completion"

## Actions performed
- **[filename]**: [specific changes with line count]
  - Functions added/modified: [function_names]
  - Purpose: [why changes were made]
  - Impact: [what this enables or fixes]

## Task Progress Status
**Current Task**: [active_task_id] - [status]
**Next Priority**: [upcoming_task_id] - [brief description]
**Blocked Tasks**: [task_ids] - [blocking reasons]
**Ready Tasks**: [task_ids_now_unblocked]

## Development Environment
**Dependencies Changed**: [package updates, new libraries]
**Configuration Updates**: [env variables, config files]
**Build/Test Status**: [last build result, test pass rate]

## Next Session Priorities
1. [next_task] - [estimated effort and approach]
2. [follow_up_items] - [dependencies and blockers]
3. [technical_debt] - [refactoring or optimization opportunities]

## Notes and Observations
- [Important insights or lessons learned]
- [Any changes to requirements, PRD, or implementation plans]
- [Patterns or anti-patterns discovered]

## Task Status Management
- Update `docs/tasks.json` with completion status to done, when available

# Commit with comprehensive session message
git commit -m "session: [brief session description]

## Pre-save validation:
- All intended changes committed with clear messages
- No work-in-progress or temporary debug code left in codebase
- Task status accurately reflects actual completion state
- Documentation updated to reflect changes
- Next session priorities clearly defined

