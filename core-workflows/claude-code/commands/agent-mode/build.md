---
description: Transform brain-dump or execute SPEC documents into production-ready implementation using prime agent coordination
allowed-tools: Task, TodoWrite
argument-hint: [SPEC-file(s)] or <feature-description>
---

# BUILD WORKFLOW COMMAND

**Goal**: Transform brain-dump into production-ready code through `architect` → `engineer` → `debugger` coordination.

**Variables:**
```
arguments: $ARGUMENTS (flexible input - SPEC files, feature description, or --resume)
```

**Usage Modes:**
1. **SPEC Mode**: `/build SPEC-20240115-feature.md` or `/build SPEC-file1.md SPEC-file2.md`
2. **Brain-dump Mode**: `/build "Add user avatar upload with optimization"`
3. **Resume Mode**: `/build --resume [last-spec-file]`

## ORCHESTRATION CHAIN

**SPEC Mode Flow**: Direct `engineer` execution → `debugger` (TDD loops if needed)
**Brain-dump Mode Flow**: `architect` → approval checkpoint → `engineer` (parallel processing) → `debugger` (TDD loops if needed)
**Multi-SPEC Flow**: Sequential SPEC execution with approval breaks between each SPEC
**Documentation**: Master SPEC document coordination (`docs/SPEC-YYYYMMDD-[feature].md`)
**Output**: Production-ready feature with comprehensive documentation
**Resume Support**: Context window management with checkpoint recovery

### Documentation Protocol
- **Architect**: Creates master SPEC with complete specification
- **Engineer**: Updates master SPEC with layer completion, parallel execution results, progress logs
- **Debugger**: Logs TDD sessions in master SPEC Debug Log section with issue resolution details

## PHASE 0: INPUT ANALYSIS & WORKFLOW ROUTING

**Goal**: Analyze `$ARGUMENTS` to determine appropriate workflow path

**Input Analysis**:
- **SPEC Files**: If `$ARGUMENTS` contains `.md` files with SPEC naming pattern → Direct to SPEC execution
- **Resume Request**: If `$ARGUMENTS` starts with `--resume` → Load checkpoint and continue  
- **Feature Description**: If `$ARGUMENTS` is natural language → Route to architect for SPEC generation

**Workflow Preparation**:
- **SPEC Mode**: Validate file paths and determine execution order
- **Resume Mode**: Load checkpoint state and identify remaining work
- **Brain-dump Mode**: Prepare feature description for architect analysis

## PHASE 1: SPEC GENERATION (Brain-dump Mode Only)

**Agent**: `architect`
**Trigger**: Raw feature description
**Output**: Master SPEC with 95%+ confidence

```bash
Task(
  description="Master SPEC generation",
  prompt="Transform brain-dump into master SPEC: '$ARGUMENTS'. 
  
  Requirements: 95%+ confidence validation, complete specification, parallel processing plan, clear handoff protocols.
  Documentation: Create master SPEC document with complete feature specification and implementation plan.",
  subagent_type="architect"
)
```

**Success**: Master SPEC created in `docs/SPEC-YYYYMMDD-[feature].md`
**Handoff**: **🔔 ARCHITECT_COMPLETE** → Engineer execution approved

## PHASE 1.5: MULTI-SPEC EXECUTION MANAGEMENT (SPEC Mode & Multi-SPEC scenarios)

**Goal**: Execute multiple SPEC documents sequentially with human approval breaks

**Multi-SPEC Execution Protocol**:
When `$ARGUMENTS` contains multiple SPEC files:
1. **Parse SPEC Files**: Extract individual SPEC file paths from `$ARGUMENTS`
2. **Sequential Execution**: Process each SPEC file in dependency order
3. **Approval Checkpoints**: Present human approval for each SPEC before execution
4. **Progress Tracking**: Save completion state after each SPEC
5. **Context Management**: Monitor context window and offer resume points

**SPEC Execution Approval Format**:
```markdown
🛑 MULTI-SPEC EXECUTION CHECKPOINT

## NEXT SPEC TO EXECUTE
**File**: [Current SPEC file from $ARGUMENTS]
**Position**: [X of Y] in execution sequence
**Estimated Effort**: [Parse from SPEC file]

## PREVIOUS PROGRESS
**Completed SPECs**: [List of already completed SPEC files]
**Current Context**: [Summary of work done so far]

## APPROVAL REQUIRED
- [ ] Ready to proceed with this SPEC execution
- [ ] Dependencies from previous SPECs are satisfied
- [ ] System context is appropriate for continuation

**Response Required**:
- ✅ **"PROCEED"** - execute this SPEC now
- ⏸️ **"PAUSE"** - stop here and save checkpoint for later resume
- 🔄 **"RESUME LATER"** - create resume point and exit

**Only proceed after explicit "PROCEED" response**
```

**Resume Checkpoint Management**:
- Save execution state after each SPEC completion
- Store remaining SPEC sequence and context summary
- Enable `/build --resume` for continuation

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

**Brain-dump Mode** (creates SPEC first):
```bash
/build "Add user avatar upload with optimization"
/build "Real-time collaborative editing system"  
/build "Stripe billing with webhooks"
```

**SPEC Execution Mode** (executes existing SPECs):
```bash
/build SPEC-20240115-user-avatar.md
/build SPEC-20240115-core-auth.md SPEC-20240115-auth-integration.md
/build docs/SPEC-20240116-billing-system.md
```

**Resume Mode** (continues from checkpoint):
```bash
/build --resume
/build --resume SPEC-20240115-auth-integration.md
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