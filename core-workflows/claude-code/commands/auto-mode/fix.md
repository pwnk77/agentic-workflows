---
description: Test-driven development workflow for systematic bug resolution through debugger ↔ engineer loops
allowed-tools: Task, TodoWrite
argument-hint: <bug-description>
---

# FIX WORKFLOW COMMAND

**Goal**: Systematic TDD bug resolution through `debugger` → `engineer` → `debugger` ↔ `engineer` loops.

**Variables:**
```
bug_description: $ARGUMENTS (required: bug symptoms, scope, and impact)
```

## ORCHESTRATION CHAIN

**Flow**: `debugger` (diagnosis) → `engineer` (failing tests) → `debugger` ↔ `engineer` (TDD loops)
**Documentation**: DEBUG document coordination (`docs/DEBUG-YYYYMMDD-[bug].md`)
**Output**: Complete bug resolution with permanent test coverage

### Documentation Protocol
- **Debugger**: Creates DEBUG document with diagnostic analysis, logs test validation and TDD feedback
- **Engineer**: Updates DEBUG document with test generation details and implementation iterations
- **Both**: Maintain complete TDD session history with iteration results and final resolution

## PHASE 1: DIAGNOSIS

**Agent**: `debugger`
**Trigger**: Bug description
**Output**: Comprehensive diagnostic analysis

```bash
Task(
  description="Bug diagnosis",
  prompt="Diagnose bug: '${bug_description}'.
  
  Requirements: Root cause analysis, reproduction steps, impact assessment, TDD protocol setup.
  Documentation: Create DEBUG document with comprehensive diagnostic analysis and reproduction framework.",
  subagent_type="debugger"
)
```

**Success**: DEBUG document created in `docs/DEBUG-YYYYMMDD-[bug].md`
**Handoff**: **🔔 DIAGNOSIS_COMPLETE** → Test generation approved

## PHASE 2: FAILING TESTS

**Agent**: `engineer`
**Trigger**: Approved diagnosis
**Output**: Failing tests that expose the bug

```bash
Task(
  description="TDD failing test generation",
  prompt="Create failing tests based on: 'docs/DEBUG-YYYYMMDD-[bug].md'.
  
  Requirements: Expose bug behavior, realistic scenarios, integrate with test suite, NO fixes yet.
  Documentation: Update DEBUG document with test generation details and validation framework.",
  subagent_type="engineer"
)
```

**Success**: Failing tests created that reliably expose bug
**Handoff**: **🔔 FAILING_TESTS_COMPLETE** → TDD loops approved

## PHASE 3: TDD LOOPS

**Agents**: `debugger` ↔ `engineer`
**Trigger**: Approved failing tests
**Output**: Bug resolution through continuous TDD collaboration

### TDD Protocol
```bash
# 1. Test Validation
Task(
  description="TDD test validation",
  prompt="Validate failing tests for 'docs/DEBUG-YYYYMMDD-[bug].md'. 
  Confirm tests expose bug accurately.
  Documentation: Log test validation results in DEBUG document.",
  subagent_type="debugger"
)

# 2. Implementation Loop (repeat until tests pass)
Task(
  description="TDD fix implementation",
  prompt="Make failing tests pass for bug in 'docs/DEBUG-YYYYMMDD-[bug].md'.
  DO NOT modify tests - focus only on implementation.
  Documentation: Update DEBUG document with implementation approach and iteration results.",
  subagent_type="engineer"
)

Task(
  description="TDD validation feedback",
  prompt="Validate implementation for 'docs/DEBUG-YYYYMMDD-[bug].md'.
  Continue loop if tests fail, provide specific feedback.
  Documentation: Log validation feedback and iteration status in DEBUG document.",
  subagent_type="debugger"
)

# 3. Final Validation
Task(
  description="TDD completion validation",
  prompt="Final validation of TDD resolution for 'docs/DEBUG-YYYYMMDD-[bug].md'.
  Verify root cause addressed, no regression, maintainable solution.
  Documentation: Document complete TDD resolution with final implementation summary in DEBUG document.",
  subagent_type="debugger"
)
```

**Success**: All tests passing, root cause addressed, no regression
**Handoff**: **🔔 TDD_COMPLETE** → Bug resolved with permanent test coverage

## ERROR HANDLING

**Phase 1**: Incomplete diagnosis → Request additional context → Retry
**Phase 2**: Inadequate tests → Debugger guidance → Refine tests
**Phase 3**: TDD stagnation → Escalate → Manual review

## USAGE

```bash
/fix "Form submit broken on mobile - button unresponsive"
/fix "Dashboard slow with large datasets - 8+ second load"
/fix "Payment webhooks failing intermittently"
```

## BUG PRIORITY

**Critical**: Security, data corruption, system down, payment failures
**High**: Core features broken, performance degradation, mobile issues
**Medium**: UI/UX issues, edge cases, browser compatibility

**🔔 TDD_FIX_COMPLETE**: Bug systematically resolved with permanent test coverage

## DOCUMENTATION STRUCTURE

**DEBUG Document**: `docs/DEBUG-YYYYMMDD-[bug].md`
```markdown
## Bug Diagnosis
[Debugger root cause analysis, reproduction steps, impact assessment]

## TDD Test Generation
[Engineer failing test creation details and validation framework]

## TDD Loop Session History
[Complete iteration history with implementation approaches and validation results]

## Final Resolution
[Implementation summary, test coverage, and bug resolution confirmation]
```