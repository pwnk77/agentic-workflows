---
description: MCP-integrated systematic feature analysis and SPEC document generation through requirement crystallization and precise codebase exploration using specialized explorer agents
allowed-tools: Task, TodoWrite, Read, Write, Edit, Glob, Grep, WebFetch, mcp__specgen-mcp__get_spec, mcp__specgen-mcp__search_specs, mcp__specgen-mcp__list_specs, mcp__specgen-mcp__launch_dashboard, mcp__specgen-mcp__refresh_metadata, mcp__static-analysis__*
argument-hint: <feature-description>
---

# ARCHITECT MODE SPECIFICATION COMMAND

**Goal**: This command guides the AI through a structured process to analyze a feature request, explore the codebase using specialized explorer agents, and create detailed specifications using MCP (Model Context Protocol) integration with precision and context management.

**Process Overview**: You will act as a senior architect. You will perform requirement crystallization, deploy specialized explorer agents for codebase analysis, and generate comprehensive specification documents using MCP tools. The analysis leverages SpecGen MCP for specification management and optionally Static Analysis MCP for TypeScript codebases.

**MCP Integration**: This command uses MCP tools for enhanced specification management:
- **specgen MCP** (`mcp__specgen-mcp__*`) for specification management with intelligent categorization
- **Static Analysis MCP** (`mcp__static-analysis__*`) for TypeScript analysis (optional)

**Variable Definitions**: 
- `$FILENAME` = `docs/SPEC-[YYYYMMDD]-[feature-name].md` (primary SPEC file path)
- `$SPEC_PATH` = `docs/SPEC-[YYYYMMDD]-[feature-name].md` (file path reference)  
- `$PROJECT_ROOT` = current working directory (for relative path consistency)

**Auto-Categorization**: SpecGen automatically categorizes specifications based on:
- **Content Analysis**: Keywords, frameworks, and architectural patterns automatically detect feature groups
- **Existing Categories**: Uses MCP to discover existing categories and assign specs to appropriate groups  
- **Category Intelligence**: Dashboard organizes specs by categories for improved navigation and project structure
- **Metadata Enrichment**: Automatically adds frontmatter with category, status, and priority for enhanced searchability

<codebase-analysis-protocol>
IF TYPESCRIPT DETECTED:
Use mcp__static-analysis__* tools for enhanced code understanding:
- mcp__static-analysis__analyze_file: Analyze individual TypeScript files for symbols, imports, exports
- mcp__static-analysis__find_references: Track symbol usage across codebase  
- mcp__static-analysis__get_compilation_errors: Identify TypeScript compilation issues

Usage: Start with key files (main.ts, app.ts, index.ts), trace dependencies, check compilation errors

ELSE (Non-TypeScript):
Use traditional file analysis for code discovery:
- Glob patterns for file discovery
- Grep for pattern matching and code analysis
- Read for specific file content analysis

CRITICAL: Always detect language first, then choose appropriate analysis approach
</codebase-analysis-protocol>

## CONTEXT MANAGEMENT PROTOCOL

**SPEC Document as Central Context**: The SPEC document serves as the single source of truth for all architectural analysis, subagent contexts, and implementation planning.

**MCP Operations (Read-Only)**:
- Use `mcp__specgen-mcp__list_specs` to discover existing specifications and categories
- Use `mcp__specgen-mcp__search_specs` to find related specifications for context
- Use `mcp__specgen-mcp__get_spec` to load existing specifications for reference
- Use `mcp__specgen-mcp__refresh_metadata` after SPEC creation for dashboard synchronization

**Direct File Operations (Write)**:
- **SPEC Creation**: Use Write tool to create `docs/SPEC-[YYYYMMDD]-[feature-name].md`
- **Architecture Updates**: Use Edit tool to add analysis sections (Backend Architecture, Frontend Architecture, etc.)
- **Implementation Plans**: Use Edit tool to append implementation plan after user approval
- **Context Consolidation**: All subagent insights are consolidated into the single SPEC document

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

1. **Generate Clarification Questions (Upto 10 per iteration):**
   Generate clarification questions (Upto a maximum of 10 per iteration, not compulsory) to eliminate ambiguity
   - Based on the risks and ambiguities identified in the deep analysis, formulate up to questions with options for the user.
   - Each question must be designed to eliminate ambiguity and should present concrete options in A/B/C format where possible to help users make quicker decisions.
   - Focus on a logical progression: start with high-level conceptual questions and move towards detailed behavior, edge cases, and integration points.
   - **IMPORTANT: Number all questions (1., 2., 3., etc.) so users can easily respond by referencing question numbers**
   - Example format: "1. For user authentication, would you prefer: A) OAuth integration, B) Custom JWT implementation, or C) Third-party service like Auth0?"
   - Tell users: "Please respond with question numbers and your answers (e.g., '1A, 2B, 3C')"
2. **Synthesize Answers & Update Understanding:**
   - After receiving answers, update the internal understanding of the requirements.
   - Re-evaluate the confidence level.
3. **Repeat or Proceed:**
   - If confidence is still below 95%, repeat the cycle with a new set of questions.
   - If confidence is >95%, create initial SPEC document and proceed to Phase 2.

**SPEC Creation Protocol:**
Once requirements are crystallized (95%+ confidence), immediately create the specification:

**Dynamic Category Assignment Protocol:**
Use MCP to determine the appropriate category before SPEC creation:

1. **Get Category Metadata**: Use `mcp__specgen-mcp__list_specs` to retrieve all existing categories
2. **Category Selection**: Analyze feature requirements against existing categories and select the best match
3. **Category Assignment**: Include determined category in SPEC frontmatter

**Automated Context Discovery Protocol:**
For existing repositories with SPEC files, gather related context before SPEC creation:

1. **Repository Detection**: Check if `docs/` folder exists with SPEC files
2. **Context Search**: Use `mcp__specgen-mcp__search_specs(query: [feature-keywords])` to find related specifications
3. **Related SPEC Discovery**: Use `mcp__specgen-mcp__list_specs()` for category context and existing patterns
4. **Context Integration**: Pass relevant context to agents via SPEC document by including related findings in the initial SPEC content

**SPEC Creation Process:**

1. **Create docs/ folder** if it doesn't exist (especially for new repositories)
2. **Use Write tool** to create: `docs/SPEC-[YYYYMMDD]-[feature-name].md`
3. **Include frontmatter** with determined category:
   ```yaml
   ---
   title: "SPEC-[YYYYMMDD]-[feature-name]"
   status: "draft"
   category: "[determined-category]"
   priority: "medium"
   created_at: "[timestamp]"
   updated_at: "[timestamp]"
   created_via: "architect"
   related_specs: []
   parent_spec_id: null
   tags: []
   effort_estimate: null
   completion: 0
   ---
   ```

**Launch Dashboard Immediately:**
After creating the SPEC template, immediately refresh metadata and launch the dashboard:
1. **Refresh Metadata**: Call `mcp__specgen-mcp__refresh_metadata(reason: "SPEC template created - preparing dashboard")`
2. **Launch Dashboard**: Call `mcp__specgen-mcp__launch_dashboard(port: 4567)`
3. **User Experience**: Dashboard shows the initial SPEC template while analysis continues
4. **Live Updates**: As explorers add analysis, the SPEC updates are visible in real-time

**Note:** The SPEC document is the single source of truth where all subagent contexts and architectural analysis are consolidated.

## PHASE 2: DYNAMIC CODEBASE EXPLORATION

Deploy context-driven explorer subagents based on feature requirements and codebase characteristics with precise task definitions and structured output requirements to prevent token blocking.

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

**Context Management Protocol:**
- All explorers read problem context from $FILENAME using standardized Glob + Read pattern
- Each explorer updates specific SPEC sections using Edit tool with structured format
- Focus analysis on solving the stated user problem with architectural relevance
- Use variable consistency ($FILENAME, $PROJECT_ROOT, $SPEC_PATH) throughout

**Dynamic Subagent Deployment Protocol:**

**BACKEND-FOCUSED DEPLOYMENT**
```
Use the backend-explorer subagent for backend architecture analysis.

Context: Read problem context from $FILENAME using Glob pattern `docs/SPEC-*[feature]*.md` then Read tool
Feature Context: Backend service analysis, API development, authentication flows, business logic patterns
Task: Analyze service patterns, API design, error handling, authentication flows relevant to solving the stated user problem
Expected Output: Update $FILENAME "### 🔧 Backend Architecture" section via Edit tool with structured insights
Constraints: 
- Focus on backend components directly needed to solve the user problem
- Use structured output format from backend-explorer agent definition
- Include service patterns, API design, authentication, and error handling
- Reference specific backend services and patterns relevant to feature implementation
- Use TypeScript static analysis when detected for enhanced symbol analysis
Success Criteria: SPEC document updated with actionable backend architectural insights
```

**DATABASE-FOCUSED DEPLOYMENT**
```
Use the database-explorer subagent for database architecture analysis.

Context: Read problem context from $FILENAME using Glob pattern `docs/SPEC-*[feature]*.md` then Read tool
Feature Context: Data modeling, schema design, relationship patterns, migration strategies, performance optimization
Task: Analyze schema design, relationship patterns, migration strategies, ORM usage relevant to solving the stated user problem
Expected Output: Update $FILENAME "### 🗄️ Database Architecture" section via Edit tool with structured insights
Constraints:
- Focus on data models and relationships needed to solve the user problem
- Use structured output format from database-explorer agent definition
- Include schema design, relationships, migrations, and performance considerations
- Connect to live database when possible using available MCP tools (mcp__postgres__*)
- Reference specific data models and relationships relevant to feature implementation
Success Criteria: SPEC document updated with actionable database architectural insights
```

**FRONTEND-FOCUSED DEPLOYMENT**
```
Use the frontend-explorer subagent for frontend architecture analysis.

Context: Read problem context from $FILENAME using Glob pattern `docs/SPEC-*[feature]*.md` then Read tool  
Feature Context: UI component analysis, state management, routing patterns, user experience design
Task: Analyze component architecture, state management, routing strategies, design systems relevant to solving the stated user problem
Expected Output: Update $FILENAME "### 🎨 Frontend Architecture" section via Edit tool with structured insights
Constraints:
- Focus on UI components and interactions needed to solve the user problem
- Use structured output format from frontend-explorer agent definition
- Include component patterns, state management, routing, and design systems
- Use TypeScript static analysis when detected for enhanced component analysis
- Reference specific UI components and user flows relevant to feature implementation
Success Criteria: SPEC document updated with actionable frontend architectural insights
```

**INTEGRATION-FOCUSED DEPLOYMENT**
```
Use the integration-explorer subagent for integration architecture analysis.

Context: Read problem context from $FILENAME using Glob pattern `docs/SPEC-*[feature]*.md` then Read tool
Feature Context: External service integration, deployment patterns, configuration management, monitoring strategies
Task: Analyze external integrations, deployment patterns, configuration management relevant to solving the stated user problem
Expected Output: Update $FILENAME "### 🔗 Integration Architecture" section via Edit tool with structured insights
Constraints:
- Focus on external services and deployment patterns needed to solve the user problem
- Use structured output format from integration-explorer agent definition
- Include service integrations, configuration, deployment, and monitoring
- Reference specific external services and infrastructure relevant to feature implementation  
Success Criteria: SPEC document updated with actionable integration architectural insights
```

**RESEARCH-FOCUSED DEPLOYMENT**
```
Use the researcher subagent for specification research and documentation analysis.

Context: Read problem context from $FILENAME using Glob pattern `docs/SPEC-*[feature]*.md` then Read tool
Feature Context: Documentation research, industry best practices, existing specification analysis, external knowledge synthesis
Task: Research existing specifications, industry best practices, relevant documentation to support solving the stated user problem
Expected Output: Update $FILENAME "### 📚 Research Findings" section via Edit tool with structured insights
Constraints:
- Focus on research that directly supports solving the stated user problem
- Use structured output format from researcher agent definition
- Include specification dependencies, external documentation, industry standards
- Use MCP tools (mcp__specgen-mcp__search_specs, mcp__specgen-mcp__list_specs) for existing spec analysis
- Use web research (web_fetch, web_search) for external knowledge
- Reference specific patterns and best practices relevant to feature implementation

DEPLOYMENT CONDITIONS:
- Always deploy for new repositories (external research only)
- Deploy for features requiring external API documentation research
- Deploy for features needing industry best practice research
- Deploy when existing specification dependencies need analysis
Success Criteria: SPEC document updated with actionable research insights and recommendations
```

**Universal Retrieval Pattern for Each Sub-Agent:**
1. Read feature context from current SPEC document using Read tool ($FILENAME)
2. Execute specialized research/analysis within defined constraints and scope
3. Generate structured findings in expected format for SPEC integration
4. Update SPEC document using Edit tool to modify architectural analysis sections
5. File watcher automatically updates search index and metadata
6. Return actionable summary with architectural insights and next steps

**Expected Return Format from Each Agent:**
```
Task completed: [Analysis type] finished - [X] components analyzed, [Y] patterns identified for solving [PROBLEM STATEMENT]
Output saved: SPEC document "### [Icon] [Section] Architecture" section updated via Edit tool with [specific insights]
Context learned: [Key architectural patterns that address the user problem]
Next steps: [Actionable recommendations for implementation that solve the user needs]
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

Add detailed implementation plan to the existing SPEC document after user approval.

**User Approval Required**: Present the implementation plan summary and request approval before adding to SPEC.

**Update SPEC with Implementation Plan:**
Use Edit tool to add `## Implementation Plan` section to existing SPEC document:

**Direct File Update Process:**
1. Use Edit tool to append `## Implementation Plan` section to existing SPEC file
2. File watcher automatically detects changes and updates search index
3. Metadata synchronization happens in real-time
4. Dashboard reflects changes immediately without manual refresh

**Complete SPEC Document Template Structure:**
The architect creates SPEC documents with the following standardized template for optimal dashboard rendering:

```markdown
---
title: "SPEC-[YYYYMMDD]-[feature-name]"
status: "draft"
category: "[determined-category]"
priority: "medium"
created_at: "[timestamp]"
updated_at: "[timestamp]"
created_via: "architect"
related_specs: []
parent_spec_id: null
tags: []
effort_estimate: null
completion: 0
---

# 📋 SPEC: [Feature Name]

## 📊 Executive Summary
Brief overview of the feature, its purpose, and key benefits.

## 📝 Product Specifications
Detailed functional requirements, user stories, and acceptance criteria.

## 🏗️ Architecture Analysis

### 🔧 Backend Architecture
*[Updated by backend-explorer subagent]*
Service patterns, API design, authentication flows, and business logic analysis.

### 🎨 Frontend Architecture  
*[Updated by frontend-explorer subagent]*
Component patterns, state management, routing strategies, and design systems.

### 🗄️ Database Architecture
*[Updated by database-explorer subagent]*
Schema design, relationship patterns, migration strategies, and ORM usage.

### 🔗 Integration Architecture
*[Updated by integration-explorer subagent]*
External integrations, deployment patterns, and configuration management.

### 📚 Research Findings
*[Updated by researcher subagent]*
External research, industry best practices, and relevant documentation.

## 🚀 Implementation Plan

Generate detailed implementation plan showing sequential, atomic tasks with exact file paths and symbol references.

**CRITICAL**: Tasks must be sequential, atomic, and logically ordered to avoid breaking existing functionality. Each task should be independently testable. Include specific file paths using $PROJECT_ROOT variable and symbol references from explorer analysis.

### 📋 Task Breakdown by Layer

#### 🗄️ Database Layer (DB-XXX)
- [DB-001]: [Specific migration task based on database explorer analysis] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/migrations/[timestamp]_[migration_name].sql`]
  - **Details**: [Exact migration commands from database explorer schema analysis]
  - **Schema**: [Table structures, relationships, indexes from database architecture findings]
  - **Dependencies**: [None for first migration, or reference to prior DB tasks]

#### ⚙️ Backend Layer (BE-XXX)
- [BE-001]: [Specific service logic task based on backend explorer analysis] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/services/[service_name].ts`, `$PROJECT_ROOT/models/[model_name].py`]
  - **Details**: [Implementation specifics based on backend architecture patterns]
  - **Symbols**: [Function names, class definitions, interfaces from backend analysis]
  - **Dependencies**: [DB-001 completion required]
  
- [BE-002]: [API endpoint implementation task] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/controllers/[controller_name].ts`, `$PROJECT_ROOT/routes/[route_file].py`]
  - **Details**: [REST endpoint implementation from backend explorer API analysis]
  - **Symbols**: [Controller methods, route handlers, middleware functions]
  - **Dependencies**: [BE-001 service layer completion]

#### 🎨 Frontend Layer (FE-XXX)
- [FE-001]: [Component architecture task based on frontend explorer analysis] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/components/[Component].tsx`, `$PROJECT_ROOT/pages/[Page].vue`]
  - **Details**: [Component implementation from frontend architecture patterns]
  - **Symbols**: [Component names, hook functions, state management patterns]
  - **Dependencies**: [Backend API endpoints from BE-002]

- [FE-002]: [State management integration task] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/store/[store_name].ts`, `$PROJECT_ROOT/hooks/[hook_name].js`]
  - **Details**: [State implementation from frontend explorer state analysis]
  - **Symbols**: [Store actions, selectors, state interfaces]
  - **Dependencies**: [FE-001 component structure completion]

#### 🔗 Integration Layer (INT-XXX)
- [INT-001]: [External service integration based on integration explorer analysis] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/lib/[service_client].js`, `$PROJECT_ROOT/config/[service_config].yaml`]
  - **Details**: [Integration implementation from integration architecture analysis]
  - **Symbols**: [Client classes, configuration interfaces, connection methods]
  - **Dependencies**: [Core feature functionality from FE-002, BE-002]

#### 🧪 Testing Layer (TEST-XXX)
- [TEST-001]: [Unit & Integration Tests] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/tests/services/[service].test.ts`, `$PROJECT_ROOT/tests/components/[Component].test.jsx`]
  - **Details**: [Test implementation covering all layers and explorer analysis findings]
  - **Symbols**: [Test functions, mock objects, assertion patterns]
  - **Dependencies**: [All implementation layers completed]

- [TEST-002]: [End-to-End Tests] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/e2e/[feature_name].spec.ts`]
  - **Details**: [E2E test scenarios covering complete user workflows]
  - **Symbols**: [Test scenarios, page objects, user flow functions]
  - **Dependencies**: [TEST-001 unit test coverage completed]

### 📊 Dependencies and Sequencing
- Database layer must complete before Backend layer
- Backend API must be ready before Frontend integration
- Core functionality before Integration layer
- Testing throughout all layers

### ⏱️ Timeline and Effort Estimates
- Database Layer: [X] hours/days
- Backend Layer: [X] hours/days
- Frontend Layer: [X] hours/days
- Integration Layer: [X] hours/days
- Testing Layer: [X] hours/days
- **Total Estimated Effort**: [X] hours/days

### ✅ Success Metrics
- All unit tests passing
- Integration tests functional
- Performance benchmarks met
- Security requirements satisfied
- User acceptance criteria fulfilled

## 📈 Execution Logs
*[Updated by engineer command during implementation]*

## 🐛 Debug Logs
*[Updated by engineer command during debugging]*
```

**Completion:**

**Final Metadata Refresh**:
Use `mcp__specgen-mcp__refresh_metadata` to finalize the metadata after all analysis:
- Call `refresh_metadata(reason: "architect command completed - SPEC finalized")`
- Ensures dashboard shows the complete SPEC with all explorer analysis
- Updates final status and completion percentage

**Dashboard Status**:
- Dashboard was launched earlier and has been showing live updates
- User can review the complete SPEC in the already-running dashboard
- All architecture analysis sections are now visible

🔔 ARCHITECT_COMPLETE: Specification ready with architecture analysis and implementation plan

"ARCHITECT analysis complete with [X]% confidence. SPEC document contains comprehensive architecture analysis from dynamic explorer deployment and detailed implementation plan with exact file paths and symbol references. Dashboard is running with complete SPEC visible at $FILENAME. MCP integration provides enhanced specification management. Ready for engineer command execution."