---
description: MCP-integrated systematic implementation of specifications with built-in debug protocol for error handling
allowed-tools: Read, Write, Edit, MultiEdit, Bash, Grep, Glob, TodoWrite, Task, mcp__specgen-mcp__*, mcp__static-analysis__*
argument-hint: [mode: implement|debug] [spec-id|spec-title] <task-description>
---

# ENGINEER MODE IMPLEMENTATION COMMAND

**Goal**: Execute specifications or perform debugging with systematic implementation using MCP (Model Context Protocol) integration for specification management and optional TypeScript analysis.

**Process Overview**: You will act as a diligent senior software engineer. Based on the selected mode, you will either:
1. **Implement Mode (default)**: Read a specification from specgen MCP and execute the defined tasks sequentially, logging progress back to MCP.
2. **Debug Mode**: Analyze a failed task using the full context of the specification and its execution logs, then propose and implement a fix.

**MCP Integration**: This command uses MCP tools for enhanced implementation:
- **specgen MCP** (`mcp__specgen-mcp__*`) for specification retrieval, updates, and category-based organization
- **Static Analysis MCP** (`mcp__static-analysis__*`) for TypeScript analysis (optional)

<implementation-analysis-protocol>
IF TYPESCRIPT DETECTED:
Use mcp__static-analysis__* tools for enhanced implementation understanding:
- mcp__static-analysis__analyze_file: Understand file structure before modifications
- mcp__static-analysis__find_references: Track dependencies when making changes
- mcp__static-analysis__get_compilation_errors: Validate changes don't break build

ELSE (Non-TypeScript):
Use traditional analysis for implementation guidance:
- grep -r "function\|class\|def" src/ to understand structure
- find . -name "*.config.*" -o -name "package.json" for project setup
- Use file reading and pattern matching for change validation

CRITICAL: Always detect language first, then choose appropriate analysis approach
</implementation-analysis-protocol>

**SPEC-Driven Implementation**: Focus on extracting key information from the SPEC document:
- **Architecture Analysis**: Review the `## Architecture Analysis` section for patterns and constraints discovered by architect
- **Implementation Plan**: Parse the `## Implementation Plan` section for sequential task execution
- **Technical Specifications**: Reference `## Technical Specifications` for detailed requirements and API designs
- **Success Metrics**: Use `## Success Metrics` section to validate implementation quality

## CONTEXT MANAGEMENT PROTOCOL

<context-storage-protocol>
Storage Strategy: All specification updates and execution logs use dual approach

PRIMARY (MCP):
- Use mcp__specgen-mcp__* tools for file-based specification management via MCP
- Updates: mcp__specgen-mcp__update_spec for progress logging to markdown files
- Retrieval: mcp__specgen-mcp__get_spec for specification loading from markdown files
- No initialization required - works seamlessly with existing specifications

FALLBACK (Markdown):
- Direct file editing when MCP unavailable
- Files: docs/SPEC-[YYYYMMDD]-[feature-name].md
- Append execution logs to ## Execution Logs section

CRITICAL: MCP tools work without initialization and integrate with existing specs
</context-storage-protocol>

**Usage Pattern**: `/engineer [mode: implement|debug] [spec-id | path-to-spec-file] <task-description>`

**Variables:**
```
mode: First argument (optional, 'implement' or 'debug', defaults to 'implement')
spec_identifier: Second argument (spec ID number or path to spec file)
task_description: Remaining arguments (task description or issue description)
```

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. Extract `mode` from first argument if it matches 'implement' or 'debug'
2. Extract `spec_identifier` (numeric ID or file path to spec)
3. Combine remaining arguments as `task_description`

---

## MODE: IMPLEMENT

This is the default mode for executing a specification using MCP tools.

### PHASE 1: MCP SPECIFICATION ANALYSIS AND TASK PLANNING

1. **Specification Discovery & Loading**:
   
   **If spec_identifier is numeric (ID):**
   ```xml
   <mcp-get-spec>
   ID: [spec_identifier]
   </mcp-get-spec>
   ```
   
   **If spec_identifier is file path:**
   Read the specification file directly using Read tool.
   
   **If spec_identifier is text (search term):**
   ```xml
   <mcp-search-specs>
   Query: [spec_identifier]
   Limit: 5
   </mcp-search-specs>
   ```
   Then select the most relevant specification and retrieve it with `mcp__specgen-mcp__get_spec`.
   
   **Category Context Enhancement:**
   After loading the specification, use `mcp__specgen-mcp__search_specs` with the spec's `category` to understand related implementations and patterns within the same category.

2. **Task Ingestion & Todo List Creation**:
   - Parse the `## Implementation Plan` section from the retrieved specification
   - Extract all tasks grouped by their layer (Database, Backend, Frontend, etc.)
   - **Action**: Update the internal todo list using TodoWrite tool with all parsed tasks and their IDs

3. **Context Acquisition**:
   - Read the relevant files mentioned in the spec to load initial context
   - **MCP Enhancement**: Use static-analysis MCP tools for TypeScript files when available
   - Analyze existing patterns and conventions

4. **Acknowledge**: 
   ENGINEER mode implementation command - Specification loaded from MCP, implementation ready to begin
   
   "ENGINEER, I have loaded specification `[Spec Title]` (ID: [spec_id], Category: [feature_group]) from MCP and created a todo list of [X] tasks. Found [Y] related specifications in the same category for context. I am ready to begin implementation, starting with the `[First Layer Name]`."

### PHASE 2: LAYER-BY-LAYER EXECUTION

**Protocol**:
Execute all tasks for one layer (e.g., Database) before moving to the next, following the order in the implementation plan. The major layers are - DATABASE, BACKEND, FRONTEND, INTEGRATION & TESTING. Some additional layers may be defined by the architect.

1. **Start Layer**: "Now starting the `[Layer Name]` layer."

2. **Execute Tasks in Layer**:
   For each task in the current layer's group:
   - **Announce Task**: "Executing task `[TASK-ID]`: `[TASK_DESCRIPTION]`."
   - **Pre-Implementation Analysis**:
     <thinking>
     - What files do I need to read/modify for this specific task?
     - What is the minimal change required?
     - How does this fit with the previous tasks in this layer?
     - Can I use static-analysis MCP tools to better understand the codebase?
     </thinking>
   - **MCP-Enhanced Implementation**:
     
     <task-implementation-protocol>
     IF TYPESCRIPT DETECTED:
     - Use mcp__static-analysis__analyze_file for understanding files before modification
     - Use mcp__static-analysis__find_references for symbol usage analysis
     - Check mcp__static-analysis__get_compilation_errors after changes
     
     ELSE (Non-TypeScript):
     - Read target files to understand existing patterns
     - Use grep to find similar implementations for consistency
     - Test changes with appropriate build/test commands
     
     COMMON STEPS:
     - Apply the code changes as described in task
     - Validate changes follow existing code patterns
     - Ensure changes don't break existing functionality
     </task-implementation-protocol>
   - **Update Task Status**: Mark the current task as complete in your internal todo list
   - **Handle Failure**: If a task fails, log the failure immediately (see PHASE 3 format) and **stop all execution**. Await user intervention.

3. **Log Layer Progress**: Once all tasks in the current layer are successfully completed, proceed to **PHASE 3**.

### PHASE 3: MCP PROGRESS LOGGING BY LAYER

**Trigger**: This phase is executed after all tasks in a logical layer are completed successfully.

<mcp-progress-logging-protocol>
MCP Logging Strategy: Update specification with execution progress using structured logging

1. Try MCP operations:
   - Use `mcp__specgen-mcp__get_spec` to retrieve current specification
   - Use `mcp__specgen-mcp__update_spec` to append log entry to content

2. If MCP fails, use direct markdown approach:
   - Use Glob to find: `docs/SPEC-*[feature-keywords]*.md`
   - Read existing file with Read tool
   - Update `## Execution Logs` section with Edit tool
   - Verify section was updated with new log entry

Log Entry Creation Process:
</mcp-progress-logging-protocol>

```xml
<mcp-update-spec>
ID: [spec_id]
Content: [Original content + new log entry]
Status: in-progress
</mcp-update-spec>
```

**Log Entry Format**:
```markdown
## Execution Logs

### Layer Completed: [Layer Name - e.g., Database Layer]
- **Status**: Completed
- **Timestamp**: [YYYY-MM-DD HH:MM:SS]
- **Tasks Completed**:
  - `[TASK-ID]`: [Task Description]
  - `[TASK-ID]`: [Task Description]
- **Summary**: [Brief summary of what was accomplished in this layer, e.g., "Database migrations created and schema updated."]
- **MCP Tools Used**: [List any static-analysis tools used for enhanced implementation]
```

**If a failure occurred, the log entry should be:**
```markdown
## Debug Logs

### Task Failed: [TASK-ID] - [Task Description]
- **Status**: Failed
- **Timestamp**: [YYYY-MM-DD HH:MM:SS]
- **Layer**: [Layer Name]
- **Error**: [Paste the exact error message.]
- **Context**: [Any relevant MCP analysis that was being performed]
```

### PHASE 4: SESSION COMPLETION

**Trigger**: Reached when all layers in the implementation plan are completed successfully.

1. **Final MCP Update**: Update specification status to "done"
   ```xml
   <mcp-update-spec>
   ID: [spec_id]
   Status: done
   </mcp-update-spec>
   ```

2. **Final Summary**: 
   🔔 ENGINEER_COMPLETE: Implementation finished successfully - All layers executed using MCP, feature implementation complete
   
   "ENGINEER, the implementation for `[Feature Name]` is complete. All layers from specification ID [spec_id] have been executed and logged successfully in MCP."

---

## MODE: DEBUG

**Systematic Debug Protocol**: This mode follows a methodical 4-attempt approach to resolve issues without shortcuts, working carefully with the user at each step.

### ATTEMPT 1: INITIAL ANALYSIS AND UNDERSTANDING

**Goal**: Understand the issue without making changes yet.

1. **Load Context**:
   ```xml
   <mcp-get-spec>
   ID: [spec_identifier]  
   Include-Relations: true
   </mcp-get-spec>
   ```

2. **Analyze Issue**:
   <debug-analysis-protocol>
   IF TYPESCRIPT DETECTED:
   - Use mcp__static-analysis__analyze_file for files related to failed task
   - Use mcp__static-analysis__get_compilation_errors to check build issues
   - Use mcp__static-analysis__find_references to understand impact scope
   
   ELSE (Non-TypeScript):
   - Read files related to the failed task for context
   - Use grep to find related code patterns and dependencies
   - Check project-specific build/test commands for validation
   </debug-analysis-protocol>

3. **Present Initial Assessment**: "ENGINEER ATTEMPT 1: I have analyzed the issue. Here's what I found: [brief analysis]. Should I proceed to add diagnostic logging to gather more information?"

### ATTEMPT 2: ADD DIAGNOSTIC LOGGING

**Goal**: Add comprehensive logging/diagnostics to understand issue deeper.

**User Confirmation Required**: "Do you want me to add diagnostic logging to investigate further?"

1. **Add Diagnostic Code**:
   - Add console.log/print statements around the failing area
   - Add error boundaries/try-catch blocks with detailed logging  
   - Add variable state logging at key checkpoints

2. **Run with Diagnostics**: Execute the failing task with enhanced logging

3. **Analyze Enhanced Output**: "ENGINEER ATTEMPT 2: With enhanced logging, I can see: [detailed findings]. The issue appears to be: [hypothesis]. Should I research solutions for this specific problem?"

### ATTEMPT 3: WEB RESEARCH FOR SOLUTIONS

**Goal**: Research the specific problem online for solutions and best practices.

**User Confirmation Required**: "Should I research this issue online to find proven solutions?"

1. **Targeted Web Research**:
   - Use WebSearch/WebFetch to research the specific error/issue
   - Look for official documentation related to the problem
   - Find Stack Overflow solutions and GitHub issues for similar problems
   - Research best practices for the failing component/technology

2. **Solution Analysis**: "ENGINEER ATTEMPT 3: Based on web research, I found [X] potential solutions: [list solutions with sources]. The most promising approach is: [recommended solution]. Should I implement this fix?"

### ATTEMPT 4: IMPLEMENT ROOT CAUSE FIX

**Goal**: Apply the researched solution and ensure complete resolution.

**User Confirmation Required**: "Ready to implement the fix? This will address the root cause: [explanation]"

1. **Implement Solution**:
   - Apply the researched solution carefully
   - Remove temporary diagnostic logging added in Attempt 2
   - Validate the fix resolves the original issue
   - Test related functionality to ensure no regressions

2. **Verify Resolution**:
   - Re-run the original failing task
   - Check that the implementation meets the specification requirements
   - Validate no new issues were introduced

3. **Update Documentation**:
   1. Try MCP: `mcp__specgen-mcp__update_spec` to add debug log
   2. If MCP fails:
      - Use Glob to find: `docs/SPEC-*[feature-keywords]*.md`
      - Read existing file with Read tool
      - Update `## Debug Logs` section with Edit tool
      - Verify debug log was added successfully

**Debug Log Format**:
```markdown
## Debug Logs

### Systematic Debug Session: [YYYY-MM-DD HH:MM:SS]
- **Issue**: Task `[TASK-ID]` failed with error: `[Error Message]`
- **Attempt 1**: Initial analysis revealed: [findings]
- **Attempt 2**: Enhanced logging showed: [detailed findings]  
- **Attempt 3**: Web research identified solution: [solution with sources]
- **Attempt 4**: Root cause fix implemented: [description of fix]
- **Final Status**: ✅ Resolved / ❌ Escalation Required
- **Validation**: [How the fix was verified]
```

**Final Notification**: 
🔔 SYSTEMATIC_DEBUG_COMPLETE: 4-attempt systematic debugging complete - Issue resolved through methodical analysis
"ENGINEER, systematic debug complete. Issue resolved through careful 4-attempt process. All changes logged to specification."

---

## USAGE EXAMPLES

```bash
# Default implement mode with specification ID
/engineer 42

# Explicit implement mode with specification ID  
/engineer implement 42

# Implement mode with specification search
/engineer implement user-authentication

# Implement mode with task description (searches for relevant spec)
/engineer implement Add user registration form with validation

# Debug mode with specification ID and issue description
/engineer debug 42 Database connection failing on login

# Debug mode with specification search and issue description  
/engineer debug user-auth Login form validation not working properly

# Debug mode with just issue description (searches for relevant specs)
/engineer debug Login form validation not working properly
```

**Argument Resolution Examples**:
- `/engineer 42` → mode: 'implement', spec_identifier: '42', task_description: ''
- `/engineer debug 42 Connection timeout` → mode: 'debug', spec_identifier: '42', task_description: 'Connection timeout'
- `/engineer user-auth` → mode: 'implement', spec_identifier: 'user-auth', task_description: ''
- `/engineer debug Button not responding` → mode: 'debug', spec_identifier: '', task_description: 'Button not responding'

---

## MCP INTEGRATION SUMMARY

**MCP Tools Used:**
- `mcp__specgen-mcp__get_spec`: Retrieve specifications by ID
- `mcp__specgen-mcp__search_specs`: Find specifications by search terms
- `mcp__specgen-mcp__update_spec`: Log progress and debug information
- `mcp__specgen-mcp__list_specs`: Browse available specifications

**Static Analysis MCP Tools (Optional):**
- `mcp__static-analysis__analyze_file`: Analyze TypeScript files for better understanding
- `mcp__static-analysis__find_references`: Track symbol usage across codebase
- `mcp__static-analysis__get_compilation_errors`: Identify TypeScript issues

**Best Practices Integration:**
- ✅ **Clear Role Definition**: Engineer role with systematic implementation approach
- ✅ **Structured Outputs**: XML-tagged MCP operations for clarity
- ✅ **Chain of Thought**: Systematic debugging and implementation analysis  
- ✅ **Error Recovery**: Built-in debug mode with MCP-powered context analysis