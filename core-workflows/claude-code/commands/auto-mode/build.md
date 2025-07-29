---
description: Brain-dump to production-ready implementation using prime agent coordination
allowed-tools: Task, TodoWrite
argument-hint: <feature-description>
---

# BUILD WORKFLOW COMMAND

**Goal**: Transform brain-dump into production-ready code through `architect` → `engineer` → `debugger` coordination.

**Variables:**
```
feature_description: $ARGUMENTS (required: natural language feature description)
```

## ORCHESTRATION CHAIN

**Flow**: `architect` → `engineer` (parallel processing) → `debugger` (TDD loops if needed)
**Documentation**: Master SPEC document coordination (`docs/SPEC-YYYYMMDD-[feature].md`)
**Output**: Production-ready feature with comprehensive documentation

### Documentation Protocol
- **Architect**: Creates master SPEC with complete specification
- **Engineer**: Updates master SPEC with layer completion, parallel execution results, progress logs
- **Debugger**: Logs TDD sessions in master SPEC Debug Log section with issue resolution details

## PHASE 1: SPEC GENERATION

**Agent**: `architect`
**Trigger**: Raw feature description
**Output**: Master SPEC with 95%+ confidence

```bash
Task(
  description="Master SPEC generation",
  prompt="Transform brain-dump into master SPEC: '${feature_description}'. 
  
  Requirements: 95%+ confidence validation, complete specification, parallel processing plan, clear handoff protocols.
  Documentation: Create master SPEC document with complete feature specification and implementation plan.",
  subagent_type="architect"
)
```

**Success**: Master SPEC created in `docs/SPEC-YYYYMMDD-[feature].md`
**Handoff**: **🔔 ARCHITECT_COMPLETE** → Engineer execution approved

## PHASE 2: IMPLEMENTATION

**Agent**: `engineer`
**Trigger**: Approved master SPEC
**Output**: Layer-by-layer implementation with parallel processing

```bash
Task(
  description="Parallel implementation execution",
  prompt="Execute master SPEC: 'docs/SPEC-YYYYMMDD-[feature].md'.
  
  Order: Database → Backend → API → Frontend → Integration → Testing
  Protocol: Parallel processing, efficiency logging, immediate TDD handoff on failure.
  Documentation: Update master SPEC with layer completion status, parallel execution results, and progress logs.",
  subagent_type="engineer"
)
```

**Success**: All layers complete, tests passing, parallel efficiency documented
**Handoff**: **🔔 ENGINEER_COMPLETE** OR **🔔 TDD_REQUIRED** → Debugger

## PHASE 3: TDD FIX LOOP (IF NEEDED)

**Agents**: `debugger` ↔ `engineer`
**Trigger**: Implementation failure or test failure
**Output**: Issue resolution through TDD collaboration

### TDD Protocol
```bash
# 1. Failing Test Generation
Task(
  description="TDD test generation",
  prompt="Create failing tests for issue in 'docs/SPEC-YYYYMMDD-[feature].md'. 
  Task: '[TASK-ID]', Error: '[ERROR-MESSAGE]'
  Documentation: Log TDD session in master SPEC Debug Log section.",
  subagent_type="debugger"
)

# 2. Implementation Loop (repeat until tests pass)
Task(
  description="TDD fix implementation",
  prompt="Make failing tests pass for '[TASK-ID]'. DO NOT modify tests.
  Documentation: Update master SPEC with implementation approach and results.",
  subagent_type="engineer"
)

Task(
  description="TDD validation",
  prompt="Validate implementation for '[TASK-ID]'. Continue loop if tests fail.
  Documentation: Log validation results and feedback in master SPEC Debug Log.",
  subagent_type="debugger"
)
```

**Success**: All tests passing, root cause addressed
**Handoff**: **🔔 TDD_COMPLETE** → Implementation resumes

## ERROR HANDLING

**Phase 1**: Architect <95% confidence → Request clarification → Retry
**Phase 2**: Engineer failure → Automatic TDD loop → Resume implementation  
**Phase 3**: TDD stagnation → Escalate → Manual intervention

## USAGE

```bash
/build "Add user avatar upload with optimization"
/build "Real-time collaborative editing system"  
/build "Stripe billing with webhooks"
```

**🔔 BUILD_COMPLETE**: Feature implemented with master SPEC documentation

## DOCUMENTATION STRUCTURE

**Master SPEC Document**: `docs/SPEC-YYYYMMDD-[feature].md`
```markdown
## Feature Specification
[Architect-generated requirements and implementation plan]

## Implementation Progress
[Engineer layer-by-layer completion logs with parallel execution results]

## Debug Log (if applicable)
[Debugger TDD session history with issue resolution details]
```