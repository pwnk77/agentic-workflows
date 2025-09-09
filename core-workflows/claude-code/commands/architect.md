---
description: Systematic feature analysis and SPEC document generation through requirement crystallization and precise codebase exploration using specialized explorer agents
allowed-tools: Task, TodoWrite, Read, Glob, Grep, WebFetch, mcp__specgen-mcp__get_spec, mcp__specgen-mcp__search_specs, mcp__specgen-mcp__list_specs, mcp__specgen-mcp__launch_dashboard, mcp__specgen-mcp__refresh_metadata, mcp__static-analysis__*
argument-hint: <feature-description>
---

# ARCHITECT MODE SPECIFICATION COMMAND

**Goal**: To be executed in Claude Code. This command guides the AI through a structured process to analyze a feature request, explore the codebase using specialized explorer agents, and prepare a detailed plan for a specification document with precise implementation details.

**Process Overview**: You will act as a senior architect. You will perform requirement crystallization, deploy specialized explorer agents for codebase analysis, and generate comprehensive specification documents. The analysis will conclude when you have gathered all necessary information and achieved a high confidence level.

**Variable Definitions**: 
- `$FILENAME` = `docs/SPEC-[YYYYMMDD]-[feature-name].md` (primary SPEC file path)
- `$SPEC_PATH` = `docs/SPEC-[YYYYMMDD]-[feature-name].md` (file path reference)
- `$PROJECT_ROOT` = current working directory (for relative path consistency)

**Directory Structure Pattern**:
```
docs/
├── SPEC-20240115-user-authentication.md
├── SPEC-20240115-payment-integration.md
└── SPEC-20240116-notification-system.md
```

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
</thinking>

**Initial Understanding Protocol:**
Based on the deep analysis, formulate an initial understanding of the core requirements. Identify the biggest areas of ambiguity and risk. This summary will guide the clarification process.

**Iterative Clarification Cycle:**
The goal is to move from uncertainty to a >95% confidence level by asking targeted questions.

1. **Generate Clarification Questions (Max 5 per iteration):**
   Generate clarification questions (Max 5 per iteration) to eliminate ambiguity
   - Based on the risks and ambiguities identified in the deep analysis, formulate up to 5 specific questions.
   - Each question must be designed to eliminate ambiguity and should present concrete options or examples where possible.
   - Focus on a logical progression: start with high-level conceptual questions and move towards detailed behavior, edge cases, and integration points.
2. **Synthesize Answers & Update Understanding:**
   - After receiving answers, update the internal understanding of the requirements.
   - Re-evaluate the confidence level.
3. **Repeat or Proceed:**
   - If confidence is still below 95%, repeat the cycle with a new set of questions.
   - If confidence is >95%, proceed to Phase 2.

## PHASE 2: SPECIALIZED CODEBASE EXPLORATION

Deploy context-driven explorer agents with precise task definitions and structured output requirements to prevent token blocking.

**Context Management Protocol:**
- All explorers read problem context from $FILENAME using standardized Glob + Read pattern
- Each explorer updates specific SPEC sections using Edit tool with structured format
- Focus analysis on solving the stated user problem with architectural relevance
- Use variable consistency ($FILENAME, $PROJECT_ROOT, $SPEC_PATH) throughout

**Explorer Agent Deployment Protocol:**

### Backend Architecture Analysis
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
Success Criteria: SPEC document updated with actionable backend architectural insights
```

### Frontend Architecture Analysis
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
- Reference specific UI components and user flows relevant to feature implementation
Success Criteria: SPEC document updated with actionable frontend architectural insights
```

### Database Architecture Analysis
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
- Connect to live database when possible using available MCP tools
- Reference specific data models and relationships relevant to feature implementation
Success Criteria: SPEC document updated with actionable database architectural insights
```

### Integration Architecture Analysis
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

### Research and Documentation Analysis
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
- Use MCP tools for existing spec analysis and web research for external knowledge
- Reference specific patterns and best practices relevant to feature implementation
Success Criteria: SPEC document updated with actionable research insights and recommendations
```

**Universal Explorer Response Pattern:**
Each explorer must return in this format:
```
Task completed: [Analysis type] finished - [X] components analyzed, [Y] patterns identified for solving [PROBLEM STATEMENT]
Output saved: SPEC document "### [Icon] [Section] Architecture" section updated via Edit tool with [specific insights]
Context learned: [Key architectural patterns that address the user problem]
Next steps: [Actionable recommendations for implementation that solve the user needs]
```

## PHASE 3: REFINEMENT AND FINALIZATION

**MCP Integration (if available):**
- Use Context7 MCP for Vercel AI SDK & API documentation
- Use Sequential Thinking (seq-think) MCP for complex task breakdown
- Research example implementations for complex patterns

**Validation Protocol:**
1. Verify all functional requirements have been considered.
2. Ensure test scenarios for each requirement are planned.
3. Validate that time estimates are realistic.
4. Confirm dependencies are properly mapped.
5. Check that risk mitigation strategies are in place.
6. **Confidence Level**: Must achieve 95%+ before proceeding.

**Feature Breakdown Summary:**
```
Specifications ready for generation:
1. $FILENAME - [Core functionality and architecture analysis]

Total effort: [X days]
Dependencies mapped: [feature relationships from explorer analysis]
```

## PHASE 4: SPECIFICATION DOCUMENT GENERATION

Generate SPEC documents based on the user's ask and explorer analysis; the major layers to define are - DATABASE, BACKEND, FRONTEND, INTEGRATION & TESTING; add layers as required if there are nuances in the tasks

**Document Structure:**
```markdown

# SPEC-[YYYYMMDD]-[feature-name] = [$FILENAME]

## Executive Summary
**Feature**: [A concise, descriptive name for the feature.]
**Impact**: [Describe the business value. What key metric will this improve? (e.g., "Increase user engagement by 15%," "Reduce support tickets by 10%").]
**Effort**: [High-level estimation in developer-days or sprints.]
**Risk**: [Assess potential technical, product, and schedule risks with a brief rationale (e.g., "High - requires integration with a poorly documented legacy system").]
**Dependencies**: [List any other SPEC files or external projects this feature depends on.]

## Product Specifications

### Elevator Pitch
[A single, compelling sentence that explains the feature's value proposition (e.g., "A seamless one-click checkout experience to boost conversion rates.")]

### Target Users
- **Primary**: [Who is the main user? Describe their role and how often they'll use this feature (e.g., "Marketing Managers, daily").]
- **Secondary**: [Who else is affected by this feature? (e.g., "Sales team, weekly").]

### Core Goals
1. **Performance**: [Specific, measurable performance targets (e.g., "API response time < 200ms," "Page load time < 1s").]
2. **Usability**: [How will this improve user experience? (e.g., "Reduce clicks to complete task from 5 to 2").]
3. **Scale**: [Capacity targets (e.g., "Support 10,000 concurrent users").]

### Functional Requirements
- **FR-001**: [Use Gherkin syntax (Given/When/Then) for clarity. Core behavior description.]
  - **Given**: [The initial state or context.]
  - **When**: [The user action or system event.]
  - **Then**: [The expected outcome.]
  - **Acceptance**: [How to verify the requirement is met (e.g., "Verified by E2E test `test_case_name`").]

### User Stories
- **US-001**: As a [user role], I want to [action] so that [benefit].
  - **Acceptance Criteria**:
    1. [A checklist of testable outcomes that define "done".]
    2. [Include positive/negative paths and edge cases.]

### Non-Goals
- [What is explicitly out of scope for this spec. Be specific.] - **Reason**: [Explain why it's deferred (e.g., "Deferred to V2 to expedite initial release").]

## Technical Specifications

### System Architecture
- **Pattern**: [The chosen architectural pattern (e.g., "Microservice," "Serverless Function," "MVC").]
- **Flow**: [A high-level diagram or description of the request lifecycle. How does data move through the system?]
- **Security**: [Authentication and authorization strategy (e.g., "JWT-based auth, role-based access control").]

### Database Design
- **Schema Changes**: [Include `CREATE`/`ALTER` table statements or ORM model definitions.]
- **Migration Approach**: [Describe the migration strategy (e.g., "Zero-downtime migration using `pg_online_schema_change`").]
- **Data Seeding**: [Mention if any seed data is required.]

### API Specifications
- [Use OpenAPI/Swagger format for endpoints.]
- **Endpoint**: `[HTTP_METHOD] /api/v1/resource`
  - **Request**: [Payload schema, parameters, headers with types and validation.]
  - **Response**: [Success (2xx) and error (4xx, 5xx) schemas.]

### Component Design
- **Service Components**: [Detail new or modified services, their responsibilities, and interactions.]
- **UI Components**: [Describe new or modified UI components, their state, props, and where they fit in the component tree.]

### Testing Strategy
- **Test Scenarios** - Describe high-level test scenarios and user flows to be validated
- Ensure that you write tests to ensure high confidence for the user that the requested feature works perfectly, seamlessly and to the extent to which user has requested
- Examples: "Verify a new user can sign up and log in," "Confirm that an invalid input to the API returns a 400 error"

## Implementation Plan

Generate detailed implementation plan showing sequential, atomic tasks with exact file paths and symbol references.

**CRITICAL**: Tasks must be sequential, atomic, and logically ordered to avoid breaking existing functionality. Each task should be independently testable. Include specific file paths using $PROJECT_ROOT variable and symbol references from explorer analysis.

### Task Breakdown

#### Database Layer (DB-XXX)
- [ ] **DB-001**: [Specific migration task based on database explorer analysis] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/migrations/[timestamp]_[migration_name].sql`]
  - **Details**: [Exact migration commands from database explorer schema analysis]
  - **Schema**: [Table structures, relationships, indexes from database architecture findings]
  - **Dependencies**: [None for first migration, or reference to prior DB tasks]

#### Backend Services (BE-XXX)
- [ ] **BE-001**: [Specific service logic task based on backend explorer analysis] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/services/[service_name].ts`, `$PROJECT_ROOT/models/[model_name].py`]
  - **Details**: [Implementation specifics based on backend architecture patterns]
  - **Symbols**: [Function names, class definitions, interfaces from backend analysis]
  - **Dependencies**: [DB-001 completion required]
  
- [ ] **BE-002**: [API endpoint implementation task] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/controllers/[controller_name].ts`, `$PROJECT_ROOT/routes/[route_file].py`]
  - **Details**: [REST endpoint implementation from backend explorer API analysis]
  - **Symbols**: [Controller methods, route handlers, middleware functions]
  - **Dependencies**: [BE-001 service layer completion]

#### Frontend Components (FE-XXX)
- [ ] **FE-001**: [Component architecture task based on frontend explorer analysis] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/components/[Component].tsx`, `$PROJECT_ROOT/pages/[Page].vue`]
  - **Details**: [Component implementation from frontend architecture patterns]
  - **Symbols**: [Component names, hook functions, state management patterns]
  - **Dependencies**: [Backend API endpoints from BE-002]

- [ ] **FE-002**: [State management integration task] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/store/[store_name].ts`, `$PROJECT_ROOT/hooks/[hook_name].js`]
  - **Details**: [State implementation from frontend explorer state analysis]
  - **Symbols**: [Store actions, selectors, state interfaces]
  - **Dependencies**: [FE-001 component structure completion]

#### Integration Layer (INT-XXX)
- [ ] **INT-001**: [External service integration based on integration explorer analysis] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/lib/[service_client].js`, `$PROJECT_ROOT/config/[service_config].yaml`]
  - **Details**: [Integration implementation from integration architecture analysis]
  - **Symbols**: [Client classes, configuration interfaces, connection methods]
  - **Dependencies**: [Core feature functionality from FE-002, BE-002]

#### Testing Layer (TEST-XXX)
- [ ] **TEST-001**: [Unit & Integration Tests] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/tests/services/[service].test.ts`, `$PROJECT_ROOT/tests/components/[Component].test.jsx`]
  - **Details**: [Test implementation covering all layers and explorer analysis findings]
  - **Symbols**: [Test functions, mock objects, assertion patterns]
  - **Dependencies**: [All implementation layers completed]

- [ ] **TEST-002**: [End-to-End Tests] [Estimate: Xhr]
  - **Files**: [`$PROJECT_ROOT/e2e/[feature_name].spec.ts`]
  - **Details**: [E2E test scenarios covering complete user workflows]
  - **Symbols**: [Test scenarios, page objects, user flow functions]
  - **Dependencies**: [TEST-001 unit test coverage completed]

### Dependencies
[Map dependencies between tasks (e.g., "BE-002 depends on DB-001", "TEST-001 depends on all implementation tasks"). Include cross-layer dependencies from explorer analysis.]

## Success Metrics
[Define SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals to measure feature success post-launch (e.g., "Achieve 5% increase in conversion rate within one month").]

## Timeline
**Total Effort**: [Sum of all task estimates in hours/days from detailed breakdown.]
**Critical Path**: [The sequence of dependent tasks determining the minimum project duration. Highlight bottlenecks.]
**Parallel Work**: [Tasks that can be executed in parallel to optimize timeline.]
```

**Notification & Exit Instructions:**
🔔 ARCHITECT_COMPLETE: Specification document ready - Architecture analysis complete, all layers documented with precise implementation plan

"Analysis and planning are complete with [X]% confidence. Specification document contains comprehensive architecture analysis from specialized explorer agents and detailed implementation plan with exact file paths and symbol references. File created at $FILENAME with all architectural insights integrated. Ready for engineer command execution."