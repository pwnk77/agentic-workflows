---
description: MCP-integrated systematic feature analysis and specification generation through requirement crystallization and codebase exploration
allowed-tools: Task, TodoWrite, Read, Glob, Grep, WebFetch, mcp__specgen-mcp__*, mcp__static-analysis__*
argument-hint: <feature-description>
---

# ARCHITECT MODE SPECIFICATION COMMAND

**Goal**: This command guides the AI through a structured process to analyze a feature request, explore the codebase, and create detailed specifications using MCP (Model Context Protocol) integration.

**Process Overview**: You will act as a senior architect. You will perform requirement crystallization, codebase exploration, and specification generation using MCP tools. The analysis leverages SpecGen MCP for specification management and optionally Static Analysis MCP for TypeScript codebases.

**MCP Integration**: This command uses MCP tools for enhanced specification management:
- **specgen MCP** (`mcp__specgen-mcp__*`) for specification management with auto-categorization
- **Static Analysis MCP** (`mcp__static-analysis__*`) for TypeScript analysis (optional)

<codebase-analysis-protocol>
IF TYPESCRIPT DETECTED:
Use mcp__static-analysis__* tools for enhanced code understanding:
- mcp__static-analysis__analyze_file: Analyze individual TypeScript files for symbols, imports, exports
- mcp__static-analysis__find_references: Track symbol usage across codebase  
- mcp__static-analysis__get_compilation_errors: Identify TypeScript compilation issues

Usage: Start with key files (main.ts, app.ts, index.ts), trace dependencies, check compilation errors

ELSE (Non-TypeScript):
Use traditional bash commands for code discovery:
- find . -name "*.js" -o -name "*.py" -o -name "*.php" | head -20
- grep -r "function\|class\|def" src/ | head -10
- find . -name "package.json" -o -name "requirements.txt" -o -name "composer.json"

CRITICAL: Always detect language first, then choose appropriate analysis approach
</codebase-analysis-protocol>

**Auto-Categorization**: SpecGen now automatically categorizes specifications based on:
- **Folder Structure**: `docs/articles/SPEC-*.md` → `articles` category
- **Content Analysis**: Keywords and patterns automatically detect feature groups
- **Category Organization**: Dashboard groups specs by categories for better organization

## CONTEXT MANAGEMENT PROTOCOL

<context-storage-protocol>
Storage Strategy: All specifications and architecture contexts use dual approach

PRIMARY (MCP):
- Use mcp__specgen-mcp__* tools for SQLite database via MCP
- Naming: SPEC-[YYYYMMDD]-[feature-name]
- Auto-organized by feature_group, searchable, real-time updates

FALLBACK (Markdown):
- Use docs/ folder when MCP unavailable
- Create docs/ folder if missing (new repositories)  
- Files: docs/SPEC-[YYYYMMDD]-[feature-name].md
- Sub-contexts: docs/tasks/{task-id}-context.md

CRITICAL: Always attempt MCP first, fallback only when MCP tools fail
</context-storage-protocol>

## PHASE 1: REQUIREMENT CRYSTALLIZATION

This phase focuses on transforming a raw feature description into a well-understood and validated set of core requirements. It involves deep analysis and iterative clarification.

**Deep Analysis Protocol (Internal Monologue):**
Before asking any questions, perform a deep analysis and ULTRA THINK the ask from the user

<thinking>
1. **Requirement Depth & Implications:**
   - What is the fundamental problem I'm trying to solve? What is the "job to be done" for the user?
   - What are the non-obvious edge cases and second-order effects of this feature? (e.g., how does it affect other teams, existing user habits, or system load?)
   - How might this feature evolve? What's the V2 or V3 of this idea? Should I design for that now?
   - What are the security, privacy, and compliance implications?

2. **Technical Feasibility & System Impact:**
   - Does the current architecture cleanly support this? If not, what's the simplest architectural change required?
   - What are the performance risks? (e.g., database query load, API response times, UI rendering speed).
   - Are there better, simpler, or more robust technical patterns we could use?
   - What potential technical debt might this introduce, and is it acceptable?

3. **Comprehensive Coverage & Risk Mitigation:**
   - Who are all the stakeholders? (e.g., end-users, support team, marketing, finance). Have their needs been considered?
   - What is the biggest risk that could cause this project to fail? (e.g., technical uncertainty, unclear requirements, dependency on another team).
   - How can I de-risk the project early? Can I build a small proof-of-concept?
   - What are the explicit non-goals for this version? What are we consciously choosing *not* to build?
   - Ensure the solution is appropriately scoped and avoid over-engineering the implementation.
</thinking>

**Initial Understanding Protocol:**
Based on the deep analysis, formulate an initial understanding of the core requirements. Identify the biggest areas of ambiguity and risk. This summary will guide the clarification process.

**Iterative Clarification Cycle:**
The goal is to move from uncertainty to a >95% confidence level by asking targeted questions.

1. **Generate Clarification Questions (Max 10 per iteration):**
   Generate clarification questions (Max 10 per iteration) to eliminate ambiguity
   - Based on the risks and ambiguities identified in the deep analysis, formulate up to 10 specific questions.
   - Each question must be designed to eliminate ambiguity and should present concrete options in A/B/C format where possible to help users make quicker decisions.
   - Focus on a logical progression: start with high-level conceptual questions and move towards detailed behavior, edge cases, and integration points.
   - Example format: "For user authentication, would you prefer: A) OAuth integration, B) Custom JWT implementation, or C) Third-party service like Auth0?"
2. **Synthesize Answers & Update Understanding:**
   - After receiving answers, update the internal understanding of the requirements.
   - Re-evaluate the confidence level.
3. **Repeat or Proceed:**
   - If confidence is still below 95%, repeat the cycle with a new set of questions.
   - If confidence is >95%, create initial SPEC document and proceed to Phase 2.

**SPEC Creation Protocol:**
Once requirements are crystallized (95%+ confidence), immediately create the specification:

**Specgen MCP usage:**

<specgen-mcp-usage-protocol>
SPEC Creation Command:
Use mcp__specgen-mcp__create_spec with:
- title: SPEC-[YYYYMMDD]-[feature-name]
- body_md: [Initial spec with Executive Summary, Product Specs, placeholder sections]  
- status: draft
- feature_group: [auto-detected]
- created_via: architect

Example:
```xml
<mcp-create-spec>
Title: SPEC-[YYYYMMDD]-[feature-name]
Content: [Initial spec content]
Status: draft
Feature-Group: [auto-detected]
Created-Via: architect
</mcp-create-spec>
```
</specgen-mcp-usage-protocol>

**Fallback:** Create `docs/SPEC-[YYYYMMDD]-[feature-name].md` if MCP unavailable. Create a docs folder if it does not exist OR for new repository.

**Note:** The MCP tools OR the SPEC document will be the single source of truth where all sub-agent contexts are consolidated.

## PHASE 2: DYNAMIC CODEBASE EXPLORATION

Deploy context-driven explorer subagents based on feature requirements and codebase characteristics.

**Exploration Strategy Decision Matrix:**

<exploration-decision-protocol>
**Repository Assessment:**
1. **NEW REPOSITORY DETECTION**: Check for minimal codebase (< 10 files, no package.json/requirements.txt)
   - IF NEW REPO: Deploy researcher subagent ONLY for external research and documentation
   - ELSE: Proceed with selective explorer deployment

2. **FEATURE CONTEXT ANALYSIS**: Analyze feature request to determine required exploration areas
   - Backend-heavy features: Deploy backend-explorer, database-explorer, integration-explorer
   - Frontend-heavy features: Deploy frontend-explorer, integration-explorer
   - Full-stack features: Deploy relevant combination based on complexity
   - Research-only requests: Deploy researcher subagent only

3. **CODEBASE CHARACTERISTICS**: Detect technology stack and complexity
   - TypeScript detection: Enable enhanced static analysis protocols
   - Framework detection: Adapt exploration protocols accordingly
   - Scale detection: Adjust depth of analysis based on codebase size
</exploration-decision-protocol>

**Context Engineering Protocol:**

**Pre-Deployment Setup:**
1. **Context Integration**: Use existing SPEC document (MCP or markdown) as single source of truth for context
2. **Feature-Specific Task Definition**: Clear scope and boundaries embedded in SPEC document
3. **Expected Output Format**: Direct integration into SPEC document sections
4. **Success Criteria**: Measurable completion criteria defined in SPEC document

**Dynamic Subagent Deployment Protocol:**

**BACKEND-FOCUSED DEPLOYMENT**
```
Use the backend-explorer subagent for backend architecture analysis.

Context: Current SPEC document (MCP or docs/SPEC-[YYYYMMDD]-[feature-name].md)
Feature Context: [Backend service, API development, authentication, business logic]
Task: Analyze service patterns, API design, error handling, authentication flows
Expected Output: Update SPEC "### Backend Architecture" section with actionable insights
Constraints: research-only, focus on architectural patterns and implementation strategies
```

**DATABASE-FOCUSED DEPLOYMENT**
```
Use the database-explorer subagent for data architecture analysis.

Context: Current SPEC document (MCP or docs/SPEC-[YYYYMMDD]-[feature-name].md)
Feature Context: [Data modeling, migrations, performance, relationships]
Task: Analyze schema design, relationship patterns, migration strategies, ORM usage
Expected Output: Update SPEC "### Database Architecture" section with schema insights
Constraints: research-only, focus on data architecture and performance considerations
```

**FRONTEND-FOCUSED DEPLOYMENT**
```
Use the frontend-explorer subagent for user interface architecture analysis.

Context: Current SPEC document (MCP or docs/SPEC-[YYYYMMDD]-[feature-name].md)
Feature Context: [UI components, state management, routing, user experience]
Task: Analyze component architecture, state patterns, routing strategies, design systems
Expected Output: Update SPEC "### Frontend Architecture" section with component insights
Constraints: research-only, focus on component patterns and user experience architecture
```

**INTEGRATION-FOCUSED DEPLOYMENT**
```
Use the integration-explorer subagent for external service and deployment analysis.

Context: Current SPEC document (MCP or docs/SPEC-[YYYYMMDD]-[feature-name].md)
Feature Context: [External APIs, deployment, monitoring, third-party services]
Task: Analyze external integrations, deployment patterns, configuration management
Expected Output: Update SPEC "### Integration Architecture" section with integration insights
Constraints: research-only, focus on external dependencies and deployment strategies
```

**RESEARCH-FOCUSED DEPLOYMENT**
```
Use the researcher subagent for specification research and documentation analysis.

Context: Current SPEC document (MCP or docs/SPEC-[YYYYMMDD]-[feature-name].md)
Feature Context: [Documentation research, best practices, industry standards]
Task: Research existing specifications, industry best practices, relevant documentation
Expected Output: Update SPEC "### Research Findings" section with comprehensive research insights
Constraints: research-only, focus on external research and documentation synthesis

DEPLOYMENT CONDITIONS:
- Always deploy for new repositories (external research only)
- Deploy for features requiring external API documentation research
- Deploy for features needing industry best practice research
- Deploy when existing specification dependencies need analysis
```

**Universal Retrieval Pattern for Each Sub-Agent:**
1. Read feature context from current SPEC document (MCP or docs/SPEC-[YYYYMMDD]-[feature-name].md)
2. Execute specialized research/analysis within defined constraints and scope
3. Generate structured findings in expected format for SPEC integration
4. Update SPEC document using `mcp__specgen-mcp__update_spec` with error handling or direct markdown editing
5. Return actionable summary with architectural insights and next steps

**Expected Return Format from Each Agent:**
```
Task completed: [Summary of architectural findings]
Output saved: SPEC document "### [Section] Architecture" section updated
Context learned: [Key architectural patterns/constraints discovered]
Next steps: [Actionable recommendations for architectural decisions]
```

## PHASE 3: REFINEMENT AND FINALIZATION

**Validation Protocol:**
1. **Review Architecture Analysis** section in SPEC for cross-layer patterns and constraints 
2. **Validate Technical Feasibility** against discovered architectural patterns
3. **Ensure Requirements Coverage** and realistic time estimates
4. **Engineering Elegance** - ensure that the solution is engineered for elegant solve from the user ask and not overengineered with UNNECESSARY features
5. **Confidence Level**: Must achieve 95%+ before proceeding

**Ready for Implementation Planning:**
SPEC document contains: Executive Summary, Product Specs, Architecture Analysis (5 perspectives), Technical constraints identified, Dependencies mapped.

## PHASE 4: PLAN PRESENTATION  

Present the final plan to the user:
- Feature summary with technical approach
- Implementation timeline and effort estimates  
- Dependencies and risks from Architecture Analysis
- Request user approval before adding implementation plan to SPEC

## PHASE 5: IMPLEMENTATION PLAN ADDITION

Add detailed implementation plan to the existing SPEC document.

**Update SPEC with Implementation Plan:**
Use `mcp__specgen-mcp__update_spec` with error handling to add `## Implementation Plan` section with:

**CRITICAL ERROR HANDLING PROTOCOL:**
1. Always wrap mcp__specgen-mcp__update_spec calls in try-catch logic
2. If MCP update fails with "database disk image is malformed" error:
   - Log the error: "Database corruption detected during SPEC update"
   - Attempt database health check using mcp__specgen-mcp__db_health_check
   - If health check fails, suggest running mcp__specgen-mcp__db_maintenance
   - Retry the update operation once after maintenance
3. If retry fails, gracefully fall back to markdown editing: docs/SPEC-[YYYYMMDD]-[feature-name].md
4. Always validate data types - ensure arrays are properly serialized before update

- **Task Breakdown**: Database, Backend, API, Frontend, Integration, Testing layers  
- **Dependencies**: Task sequence and relationships
- **Timeline**: Effort estimates and critical path
- **Success Metrics**: Measurable goals

**Completion:**

**Launch SpecGen Dashboard**:
Use `mcp__specgen-mcp__launch_dashboard` to display the completed SPEC in the dashboard interface
- Opens browser with interactive SPEC visualization
- Shows auto-categorized specifications by feature group
- Provides easy navigation through architecture analysis sections

🔔 ARCHITECT_COMPLETE: Specification ready with architecture analysis and implementation plan

"ARCHITECT analysis complete with [X]% confidence. SPEC document contains comprehensive architecture analysis from dynamic explorer deployment and detailed implementation plan. Dashboard launched for SPEC review. Ready for engineer command execution."