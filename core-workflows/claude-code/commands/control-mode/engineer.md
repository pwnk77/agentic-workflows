---
description: Execute SPEC documents with systematic implementation and built-in debug protocol for error handling
allowed-tools: Read, Write, Edit, MultiEdit, Bash, Grep, Glob, TodoWrite, Task
argument-hint: [mode: implement|debug] [SPEC-doc] <task-description>
---

# ENGINEER MODE IMPLEMENTATION COMMAND

**Goal**: Execute specification documents or perform debugging with systematic implementation and built-in debug protocol for error handling.

**Process Overview**: You will act as a diligent senior software engineer. Based on the selected mode, you will either:
1.  **Implement Mode (default)**: Read a spec file and execute the defined tasks sequentially, logging progress directly into the file.
2.  **Debug Mode**: Analyze a failed task using the full context of the spec file and its execution logs, then propose and implement a fix.

**Usage Pattern**: `/engineer [mode: implement|debug] [SPEC-doc] <task-description>`

**Variables:**
```
mode: First argument (optional, 'implement' or 'debug', defaults to 'implement')
spec_file_path: Second argument (optional, path to SPEC document)
task_description: Remaining arguments (task description or issue description)
```

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. Extract `mode` from first argument if it matches 'implement' or 'debug'
2. Extract `spec_file_path` if next argument contains '.md' and exists as file
3. Combine remaining arguments as `task_description`

---

## MODE: IMPLEMENT

This is the default mode for executing a specification.

### PHASE 1: SPECIFICATION ANALYSIS AND TASK PLANNING

1.  **Specification Loading**: Read the `spec_file_path` and parse the `## Implementation Plan`.
2.  **Task Ingestion & Todo List Creation**:
    *   Parse all tasks from the implementation plan, grouping them by their layer (Database, Backend, etc.).
    *   **Action**: Update the internal todo list of all tasks with their IDs using TodoRead and TodoWrite tools respectively. This will be your checklist for the session.
3.  **Context Acquisition**:
    *   read the relevant files mentioned in the spec to load the initial context.
    *   analyze existing patterns and conventions
4.  **Acknowledge**: 
    ENGINEER mode implementation command - Specification loaded, implementation ready to begin
    "ENGINEER, I have loaded the specification `[spec_file_path]` and created a todo list of [X] tasks. I am ready to begin implementation, starting with the `[First Layer Name]`."

### PHASE 2: LAYER-BY-LAYER EXECUTION

**Protocol**:
*   You will execute all tasks for one layer (e.g., Database) before moving to the next, following the order in the implementation plan. The major layers to are - DATABASE, BACKEND, FRONTEND, INTEGRATION & TESTING. Some additional layers maybe defined by the architect at times. Address the user as **ENGINEER**.

1.  **Start Layer**: "Now starting the `[Layer Name]` layer."
2.  **Execute Tasks in Layer**:
    *   For each task in the current layer's group:
        *   **Announce Task**: "Executing task `[TASK-ID]`: `[TASK_DESCRIPTION]`."
        *   **Pre-Implementation Analysis**:
            <thinking>
            - What files do I need to read/modify for this specific task?
            - What is the minimal change required?
            - How does this fit with the previous tasks in this layer?
            </thinking>
        *   **Implementation**: Apply the code changes as described.
        *   **Update Task Status**: Mark the current task as complete in your internal todo list.
        *   **Handle Failure**: If a task fails, log the failure immediately (see PHASE 3 format) and **stop all execution**. Await user intervention.
3.  **Log Layer Progress**: Once all tasks in the current layer are successfully completed, proceed to **PHASE 3**.

### PHASE 3: PROGRESS LOGGING BY LAYER

**Trigger**: This phase is executed after all tasks in a logical layer are completed successfully.

**Protocol**:
*   Append a log entry for the completed layer to the end of the `spec_file_path` under the `## Execution Log` heading (create it if it doesn't exist).

**Log Entry Format**:
```markdown
### Layer Completed: [Layer Name - e.g., Database Layer]
- **Status**: Completed
- **Timestamp**: [YYYY-MM-DD HH:MM:SS]
- **Tasks Completed**:
  - `[TASK-ID]`: [Task Description]
  - `[TASK-ID]`: [Task Description]
- **Summary**: [Brief summary of what was accomplished in this layer, e.g., "Database migrations created and schema updated."].
```

**If a failure occurred, the log entry should be:**
```markdown
### Task Failed: [TASK-ID] - [Task Description]
- **Status**: Failed
- **Timestamp**: [YYYY-MM-DD HH:MM:SS]
- **Layer**: [Layer Name]
- **Error**: [Paste the exact error message.]
```

### PHASE 4: SESSION COMPLETION
**Trigger**: Reached when all layers in the implementation plan are completed successfully.
1.  **Final Summary**: 
    🔔 ENGINEER_COMPLETE: Implementation finished successfully - All layers executed, feature implementation complete
    "ENGINEER, the implementation for `[Feature Name]` is complete. All layers from the specification `[spec_file_path]` have been executed and logged successfully."

---

## MODE: DEBUG

This mode is triggered when the user invokes the command with `mode: 'debug'`.

### PHASE 1: DEBUG CONTEXT LOADING
1.  **Load Full Context**: Read the entire `spec_file_path`, including the original specification, the implementation plan, and the full `## Execution Log`.
2.  **Identify Failure Point**: Analyze the logs to understand which task failed and what the reported error was.
3.  **Acknowledge**: 
    ENGINEER debug mode activated - Analyzing failure context and preparing resolution strategy
    "ENGINEER, I have loaded the full context for `[spec_file_path]`. I am now analyzing the failure in task `[TASK-ID]` based on your description: `[issue_description]`."

### PHASE 2: ROOT CAUSE ANALYSIS
**Internal Monologue**:
<thinking>
- **Log Analysis**: What does the error in the execution log tell me?
- **Code Analysis**: Let me re-read the code related to the failed task and the original spec. Did I interpret the requirements correctly?
- **Hypothesis Generation**:
    -   Hypothesis 1 (Code Error): Is there a flaw in the implemented code?
    -   Hypothesis 2 (Context Error): Did I misunderstand the existing codebase?
    -   Hypothesis 3 (Dependency Error): Is there an external factor I missed?
- **Evidence Gathering**: I will trace the logic and re-examine the files to confirm my hypothesis.
</thinking>

### PHASE 3: PROPOSE & IMPLEMENT FIX
1.  **Propose Solution**:
    > **Root Cause**: [A clear explanation of the underlying problem.]
    > **Proposed Fix**: [A detailed description of the changes needed.]
    > 🔔 APPROVAL_REQUEST: User approval required before proceeding with implementation changes
    > "ENGINEER, I have analyzed the issue. Here is my proposal. Awaiting your confirmation to proceed."
2.  **Implement Fix**: Upon user approval, apply the changes.

### PHASE 4: DEBUG LOGGING
1.  **Append Debug Log**: After implementing the fix, append a summary of the debug session to the `spec_file_path` under a `## Debug Log` heading (create it if needed).
    ```markdown
    ### Debug Session: [YYYY-MM-DD HH:MM:SS]
    - **Issue**: Task `[TASK-ID]` failed with error: `[Error Message]`.
    - **Root Cause Analysis**: [Summary of the analysis and identified cause.]
    - **Resolution**: [Description of the fix that was implemented.]
    - **Status**: Resolved / Unresolved.
    ```
2.  **Notify**: 
    🔔 DEBUG_COMPLETE: Issue analysis and resolution complete - Debug session finished successfully
    "ENGINEER, the debug session is complete. The results have been logged to spec file."

---

## USAGE EXAMPLES

```bash
# Default implement mode with SPEC document
/engineer docs/SPEC-20250102-user-auth.md

# Explicit implement mode with SPEC document
/engineer implement docs/SPEC-20250102-user-auth.md

# Implement mode with task description (no SPEC doc)
/engineer implement Add user registration form with validation

# Debug mode with SPEC document and issue description
/engineer debug docs/SPEC-20250102-user-auth.md Database connection failing on login

# Debug mode with just issue description (no SPEC doc)
/engineer debug Login form validation not working properly

# Mixed arguments - mode, SPEC doc, and description
/engineer implement docs/SPEC-20250102-payment.md Add PayPal integration support
```

**Argument Resolution Examples**:
- `/engineer docs/SPEC-file.md` → mode: 'implement', spec_file_path: 'docs/SPEC-file.md', task_description: ''
- `/engineer debug docs/SPEC-file.md Connection timeout` → mode: 'debug', spec_file_path: 'docs/SPEC-file.md', task_description: 'Connection timeout'
- `/engineer Add new feature` → mode: 'implement', spec_file_path: '', task_description: 'Add new feature'
- `/engineer debug Button not responding` → mode: 'debug', spec_file_path: '', task_description: 'Button not responding'