---
description: Test-driven development command for writing failing tests and implementing solutions following TDD principles
allowed-tools: Read, Write, Edit, MultiEdit, Bash, Grep, Glob, TodoWrite, Task, WebSearch
argument-hint: [mode: write|implement] [SPEC-doc] <task-description>
---

# TESTER MODE COMMAND

**Goal**: Systematic test-driven development through write failing tests → implement solutions → validate cycles. Supports both existing SPEC documents and user-described scenarios.

**Usage Pattern**: `/tester [mode: write|implement] [SPEC-doc] <task-description>`

**Variables:**
```
mode: First argument (optional, 'write' or 'implement', defaults to 'write')
spec_file_path: Second argument (optional, path to SPEC document)
task_description: Remaining arguments (task description or scenario description)
```

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. Extract `mode` from first argument if it matches 'write' or 'implement'
2. Extract `spec_file_path` if next argument contains '.md' and exists as file
3. Combine remaining arguments as `task_description`

---

## MODE: WRITE (Default)

Generate failing tests based on requirements from SPEC document or scenario description.

### PHASE 1: INPUT ANALYSIS AND SETUP

1. **Input Type Detection**:
   - Check if `spec_file_path` is provided and exists
   - If SPEC file: Load existing SPEC document for requirements
   - If task description only: Use description as requirements baseline

2. **Testing Framework Detection**:
   - Read `/Users/pawanraviee/.claude/CLAUDE.md` for testing framework preferences
   - Look for patterns like "jest", "pytest", "vitest", "mocha", etc.
   - If not found: Ask user "What testing framework should I use? (jest/pytest/vitest/other)"

3. **Test Document Creation**:
   - Create `docs/SPEC-TEST-YYYYMMDD-[scenario-name].md`
   - Initialize with requirements summary and test plan
   - Derive scenario name from SPEC file or task description

4. **Acknowledge**:
   "TESTER WRITE mode activated - Requirements loaded, testing framework identified as [framework], ready to generate failing tests"

### PHASE 2: FAILING TEST GENERATION

1. **Requirements Analysis**:
   <thinking>
   - What are the core behaviors that need testing?
   - What edge cases should be covered?
   - How can I write tests that will initially fail?
   - What test structure follows [framework] best practices?
   </thinking>

2. **Test Implementation**:
   - Generate failing tests for each identified requirement
   - Follow TDD Red phase - tests should fail initially
   - Cover happy path, edge cases, and error conditions
   - Use appropriate test framework syntax and patterns

3. **Test Validation**:
   - Run tests to confirm they fail as expected
   - Document test failure output in SPEC-TEST document

### PHASE 3: DOCUMENTATION AND HANDOFF

1. **Test Session Logging**:
   ```markdown
   ### Write Session: [YYYY-MM-DD HH:MM:SS]
   - **Requirements Source**: [SPEC file path OR task description]
   - **Testing Framework**: [framework used]
   - **Tests Generated**: [list of test files and descriptions]
   - **Test Status**: All failing as expected ✅
   - **Next Step**: Ready for implement mode
   ```

2. **Handoff Notification**:
   **🔔 TESTER_WRITE_COMPLETE**: Failing tests generated - Ready for implementation phase

---

## MODE: IMPLEMENT

Write minimal code to make existing failing tests pass.

### PHASE 1: TEST CONTEXT LOADING

1. **Load Test Context**:
   - Read corresponding SPEC-TEST document to understand requirements
   - Analyze existing failing tests and their expected behaviors
   - Identify what functionality needs to be implemented

2. **Implementation Planning**:
   <thinking>
   - What minimal code will make these tests pass?
   - What existing patterns should I follow in the codebase?
   - How can I implement just enough to satisfy the tests?
   </thinking>

3. **Acknowledge**:
   "TESTER IMPLEMENT mode activated - Test context loaded, ready to implement solutions"

### PHASE 2: TDD GREEN PHASE

1. **Minimal Implementation**:
   - Write only the code necessary to make tests pass
   - Follow existing codebase patterns and conventions
   - Avoid over-engineering - focus on making tests green

2. **Test Execution Loop**:
   - Run tests after each implementation change
   - Continue until all tests pass
   - If stuck, consider web research for implementation strategies

3. **Validation**:
   - Confirm all tests now pass
   - Run broader test suite to ensure no regressions

### PHASE 3: REFACTOR AND DOCUMENTATION

1. **Code Refactoring** (if needed):
   - Clean up implementation while keeping tests green
   - Improve code quality without changing behavior
   - Ensure adherence to project standards

2. **Implementation Session Logging**:
   ```markdown
   ### Implement Session: [YYYY-MM-DD HH:MM:SS]
   - **Tests Addressed**: [list of test files]
   - **Implementation Summary**: [brief description of what was built]
   - **Test Status**: All passing ✅
   - **Files Modified**: [list of implementation files]
   - **Status**: TDD cycle complete
   ```

3. **Completion Notification**:
   **🔔 TESTER_IMPLEMENT_COMPLETE**: Implementation finished - All tests passing, TDD cycle complete

---

## WEB RESEARCH INTEGRATION

**Trigger**: When stuck on testing strategies or implementation approaches

**Research Protocol**:
```bash
WebSearch(
  query="[testing framework] best practices [specific challenge] TDD 2025"
)
```

**Documentation**: Log research findings in SPEC-TEST document under "Research Notes" section

---

## ERROR HANDLING

**Write Mode Failures**: 
- Framework detection fails → Ask user for framework preference
- Test generation issues → Research testing patterns → Retry

**Implement Mode Failures**:
- Tests remain failing → Analyze test requirements → Research implementation strategies → Retry
- Regression introduced → Revert changes → Implement more carefully

**Escalation**: If multiple cycles fail, document issue and request manual review

---

## USAGE EXAMPLES

```bash
# Default write mode with SPEC document
/tester docs/SPEC-20250102-user-auth.md

# Explicit write mode with SPEC document
/tester write docs/SPEC-20250102-user-auth.md

# Write mode with task description (no SPEC doc)
/tester write User login should validate email format and password strength

# Implement mode with SPEC document
/tester implement docs/SPEC-20250102-user-auth.md

# Implement mode with task description (no SPEC doc)
/tester implement Make user registration form tests pass

# Mixed arguments - mode, SPEC doc, and description
/tester write docs/SPEC-20250102-payment.md Add PayPal integration tests
/tester implement docs/SPEC-20250102-payment.md Fix failing payment validation tests
```

**Argument Resolution Examples**:
- `/tester docs/SPEC-file.md` → mode: 'write', spec_file_path: 'docs/SPEC-file.md', task_description: ''
- `/tester write docs/SPEC-file.md Email validation tests` → mode: 'write', spec_file_path: 'docs/SPEC-file.md', task_description: 'Email validation tests'
- `/tester implement Fix login tests` → mode: 'implement', spec_file_path: '', task_description: 'Fix login tests'
- `/tester write User authentication flow` → mode: 'write', spec_file_path: '', task_description: 'User authentication flow'

---

## SPEC-TEST DOCUMENT STRUCTURE

**Document**: `docs/SPEC-TEST-YYYYMMDD-[scenario].md`
```markdown
# Test Specification: [Scenario Name]

## Requirements Summary
[Requirements from SPEC file or task description]

## Testing Framework
[Framework used: jest/pytest/etc.]

## Write Sessions
[Write session logs]

## Implement Sessions
[Implementation session logs]

## Research Notes
[Web research findings]

## Final Status
[Complete/Partial/Failed with reasons]
```

**🔔 TESTER_COMPLETE**: TDD cycle finished successfully - Tests written and implementation complete