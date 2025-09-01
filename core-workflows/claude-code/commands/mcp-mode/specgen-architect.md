---
description: MCP-integrated systematic feature analysis and specification generation through requirement crystallization and codebase exploration
allowed-tools: Task, TodoWrite, Read, Glob, Grep, WebFetch, mcp__specgen-mcp__*, mcp__static-analysis__*
argument-hint: <feature-description>
---

# specgen-architect MODE SPECIFICATION COMMAND

**Goal**: This command guides the AI through a structured process to analyze a feature request, explore the codebase, and create detailed specifications using MCP (Model Context Protocol) integration.

**Process Overview**: You will act as a senior architect. You will perform requirement crystallization, codebase exploration, and specification generation using MCP tools. The analysis leverages SpecGen MCP for specification management and optionally Static Analysis MCP for TypeScript codebases.

**MCP Integration**: This command uses MCP tools for enhanced specification management:
- **specgen MCP** (`mcp__specgen-mcp__*`) for specification management with auto-categorization
- **Static Analysis MCP** (`mcp__static-analysis__*`) for TypeScript analysis (optional)

**Auto-Categorization**: SpecGen now automatically categorizes specifications based on:
- **Folder Structure**: `docs/articles/SPEC-*.md` → `articles` category
- **Content Analysis**: Keywords and patterns automatically detect feature groups
- **Category Organization**: Dashboard groups specs by categories for better organization

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
   - If confidence is >95%, proceed to Phase 2.

## PHASE 2: MULTI-PERSPECTIVE CODEBASE EXPLORATION

Deploy parallel research tasks for comprehensive analysis & research to execute the requirement and decompose it structurally.

**MCP-Enhanced Analysis Protocol:**
Before deploying sub-agents, use MCP tools for initial code discovery:

**TypeScript Analysis (Optional - if static-analysis MCP available):**
```
Use mcp__static-analysis__analyze_file for key TypeScript files
Use mcp__static-analysis__find_references for understanding symbol usage
Use mcp__static-analysis__get_compilation_errors for identifying issues
```

**Existing Specifications Discovery:**
```
Use mcp__specgen-mcp__list_specs with group_by='feature_group' to understand existing specifications by category
Use mcp__specgen-mcp__search_specs with boost_category to find related features in same category
Use mcp__specgen-mcp__get_spec_stats to see category breakdown and project overview
```

**Sub-Agent Task Distribution:**
```
AGENT 1: Backend Architecture Analysis (MCP-Enhanced)
TASK: Explore service layer patterns and API design. You are analyzing the backend architecture.

REQUIREMENTS:
1. Map existing service patterns and conventions
2. Identify authentication and authorization approaches  
3. Document error handling patterns
4. Analyze data flow between layers
5. Note testing patterns for services
6. **MCP Integration**: Use static-analysis tools for TypeScript service analysis when available

DELIVERABLE: Backend architecture insights and patterns with MCP-sourced code analysis
```

```
AGENT 2: Database Schema Analysis  
TASK: Understand data model and persistence patterns. You are analyzing the database layer.

REQUIREMENTS:
1. Map current schema and relationships
2. Identify migration patterns and conventions
3. Document data access patterns (ORM/SQL)
4. Analyze indexing and performance strategies
5. Note transaction handling approaches

DELIVERABLE: Database design patterns and constraints
```

```
AGENT 3: Frontend Architecture Analysis (MCP-Enhanced)
TASK: Explore UI components and state management. You are analyzing the frontend implementation.

REQUIREMENTS:
1. Map component hierarchy and patterns
2. Identify state management approach
3. Document routing and navigation
4. Analyze design system usage
5. Note testing patterns for UI
6. **MCP Integration**: Use static-analysis tools for React/TypeScript component analysis when available

DELIVERABLE: Frontend patterns and component architecture with MCP-sourced analysis
```

```
AGENT 4: Integration Analysis
TASK: Understand external connections and infrastructure. You are analyzing system integrations.

REQUIREMENTS:
1. Map external service integrations
2. Identify configuration patterns
3. Document build and deployment processes
4. Analyze monitoring and logging
5. Note API client patterns

DELIVERABLE: Integration points and infrastructure patterns
```

```
AGENT 5: Specification Research (MCP-Enhanced)
TASK: Research existing specifications and related features using specgen MCP

REQUIREMENTS:
1. Use mcp__specgen-mcp__search_specs for related features
2. Analyze existing specification patterns
3. Identify specification dependencies and relationships
4. Research external libraries/components when needed
5. Find code examples & integration patterns

DELIVERABLE: Specification context and related feature analysis
```

## PHASE 3: REFINEMENT AND FINALIZATION

**MCP-Powered Validation Protocol:**
1. **Existing Specifications Check**: Use `mcp__specgen-mcp__list_specs` to ensure no conflicts
2. **Related Features Analysis**: Use `mcp__specgen-mcp__search_specs` for dependency mapping
3. **Code Analysis Validation**: Use static-analysis MCP tools if available for technical feasibility
4. Verify all functional requirements have been considered
5. Ensure test scenarios for each requirement are planned
6. Validate that time estimates are realistic
7. Confirm dependencies are properly mapped
8. Check that risk mitigation strategies are in place
9. **Confidence Level**: Must achieve 95%+ before proceeding

**Feature Breakdown Summary:**
```
Specifications ready for MCP generation:
1. [Feature Name 1] - [Core functionality] 
2. [Feature Name 2] - [Extended features]
3. [Feature Name 3] - [Integration layer]

Total effort: [X days]
Dependencies mapped: [feature relationships]
MCP Tools: specgen integration configured
```

## PHASE 4: SPECIFICATION GENERATION

Generate specifications using specgen MCP tools for seamless integration.

**MCP Specification Creation Protocol:**

For each specification identified in Phase 3:

1. **Prepare Specification Content**: Structure the specification following the template below
2. **Create via MCP**: Use `mcp__specgen-mcp__create_spec_with_grouping` for enhanced categorization or `mcp__specgen-mcp__create_spec` with:
   - `title`: Descriptive specification title
   - `body_md`: Full specification content in markdown
   - `status`: "draft" (initial status)
   - `feature_group`: Specify category (optional - will be auto-detected from content/title)
   - `created_via`: "specgen-architect" for tracking

**Specification Template:**
```markdown
# [FEATURE-NAME] Specification

## Executive Summary
**Feature**: [A concise, descriptive name for the feature.]
**Impact**: [Describe the business value. What key metric will this improve? (e.g., "Increase user engagement by 15%," "Reduce support tickets by 10%").]
**Effort**: [High-level estimation in developer-days or sprints.]
**Risk**: [Assess potential technical, product, and schedule risks with a brief rationale (e.g., "High - requires integration with a poorly documented legacy system").]
**Dependencies**: [List any other specifications or external projects this feature depends on.]

### Metadata
- **Created**: [YYYY-MM-DD]
- **Status**: [Draft/In Progress/Ready/Complete]
- **Priority**: [High/Medium/Low]
- **Team**: [Assigned team or owner]
- **Technology Stack**: [Primary technologies involved]
- **Complexity**: [Low/Medium/High]
- **Business Impact**: [Revenue/UX/Performance/Security]

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

Generate markdown tables showing detailed steps to implement the task at hand under each of the headings below

### Task Breakdown

**CRITICAL**: Tasks must be sequential, atomic, and logically ordered to avoid breaking existing functionality. Each task should be independently testable. Below are specific details on each of the layers to be generated within the task list as applicable.

#### Database Layer (DB-XXX)
- [ ] **DB-001**: [Specific migration task] [Estimate: Xhr]
  - **Files**: [List exact files to be created/modified, e.g., `migrations/20240101_add_users_table.sql`.]
  - **Details**: [Clear, concise implementation notes for the migration.]

#### Backend Services (BE-XXX)
- [ ] **BE-001**: [Specific service logic task] [Estimate: Xhr]
  - **Files**: [e.g., `services/user_service.ts`, `models/user.py`.]
  - **Details**: [What exactly needs to be done? e.g., "Implement `CreateUser` function with validation."]
  - **Example**: [If complex, include a well-researched code snippet.]

#### API Layer (API-XXX)
- [ ] **API-001**: [Specific endpoint task] [Estimate: Xhr]
  - **Files**: [e.g., `controllers/user_controller.ts`, `routes/api.py`.]
  - **Details**: [e.g., "Create POST `/users` endpoint, connect to `user_service.CreateUser`."]

#### Frontend Components (FE-XXX)
- [ ] **FE-001**: [Specific UI component task] [Estimate: Xhr]
  - **Files**: [e.g., `components/UserForm.tsx`.]
  - **Details**: [e.g., "Build form with fields for name and email, handle state with React Hook Form."]

#### Integration (INT-XXX)
- [ ] **INT-001**: [Specific integration task] [Estimate: Xhr]
  - **Files**: [e.g., `lib/stripe_client.js`.]
  - **Details**: [e.g., "Integrate Stripe SDK to handle payments."]

#### Testing (TEST-XXX)
- [ ] **TEST-001**: [Unit & Integration Tests] [Estimate: Xhr]
  - **Files**: [e.g., `services/user_service.test.ts`, `tests/test_user_model.py`]
  - **Details**: [Write unit and integration tests for the services, models, and business logic created in the previous steps. Use Jest & React Testing Library for TypeScript/React. Use Pytest for Python.]

- [ ] **TEST-002**: [End-to-End Tests] [Estimate: Xhr]
  - **Files**: [e.g., `e2e/user_creation.spec.ts`]
  - **Details**: [Write E2E tests covering the complete user flows for the new feature. Use Playwright to simulate user actions and verify the end-to-end functionality.]

### Dependencies
[Map dependencies between tasks (e.g., "BE-002 depends on DB-001", "TEST-001 depends on BE-001").]

## Success Metrics
[Define SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals to measure feature success post-launch (e.g., "Achieve 5% increase in conversion rate within one month").]

## Timeline
**Total Effort**: [Sum of all task estimates in hours/days.]
**Critical Path**: [The sequence of dependent tasks determining the minimum project duration. Highlight this to manage risk.]
```

**MCP Specification Creation:**
After preparing each specification:

```xml
<mcp-create-spec>
Title: [Specification Title]
Content: [Full specification markdown content]
Status: draft
</mcp-create-spec>
```

**Notification & Exit Instructions:**
🔔 specgen_ARCHITECT_COMPLETE: Specifications created using specgen MCP - Architecture analysis complete, all layers documented

"Analysis and planning are complete with [X]% confidence. I have created [N] specification(s) using specgen MCP tools. The specifications are now stored in the project's MCP database and ready for implementation using the specgen-engineer command."