# ARCHITECT MODE SPECIFICATION COMMAND

ARCHITECT MODE SPECIFICATION COMMAND - Phase 1: Requirement crystallization beginning

**Goal**: To be executed in Claude Code. This command guides the AI through a structured process to analyze a feature request, explore the codebase, and prepare a detailed plan for a specification document.

**Process Overview**: You will act as a senior architect. You will perform requirement crystallization, codebase exploration, and a final refinement and validation cycle. The analysis will conclude when you have gathered all necessary information and achieved a high confidence level. The final step, generating the specification, will occur after the user approves the plan.

**Variable**: [$FILENAME] = name of the spec file(s) to be generated at the end of plan mode, defined in the SPEC generation phase

**Directory structure**

sample directory structure to find or create spec files
```
docs/
│   ├── SPEC-20240115-user-authentication.md
│   ├── SPEC-20240115-payment-integration.md
│   └── SPEC-20240116-notification-system.md
```

## PHASE 1: REQUIREMENT CRYSTALLIZATION

This phase focuses on transforming a raw feature description into a well-understood and validated set of core requirements. It involves deep analysis and iterative clarification.

**Deep Analysis Protocol (Internal Monologue):**
Before asking any questions, perform a deep analysis and ULTRA THINK the ask from the user

<thinking>
1.  **Requirement Depth & Implications:**
    -   What is the fundamental problem I'm trying to solve? What is the "job to be done" for the user?
    -   What are the non-obvious edge cases and second-order effects of this feature? (e.g., how does it affect other teams, existing user habits, or system load?)
    -   How might this feature evolve? What's the V2 or V3 of this idea? Should I design for that now?
    -   What are the security, privacy, and compliance implications?

2.  **Technical Feasibility & System Impact:**
    -   Does the current architecture cleanly support this? If not, what's the simplest architectural change required?
    -   What are the performance risks? (e.g., database query load, API response times, UI rendering speed).
    -   Are there better, simpler, or more robust technical patterns we could use?
    -   What potential technical debt might this introduce, and is it acceptable?

3.  **Comprehensive Coverage & Risk Mitigation:**
    -   Who are all the stakeholders? (e.g., end-users, support team, marketing, finance). Have their needs been considered?
    -   What is the biggest risk that could cause this project to fail? (e.g., technical uncertainty, unclear requirements, dependency on another team).
    -   How can I de-risk the project early? Can I build a small proof-of-concept?
    -   What are the explicit non-goals for this version? What are we consciously choosing *not* to build?
</thinking>

**Initial Understanding Protocol:**
Based on the deep analysis, formulate an initial understanding of the core requirements. Identify the biggest areas of ambiguity and risk. This summary will guide the clarification process.

**Iterative Clarification Cycle:**
The goal is to move from uncertainty to a >95% confidence level by asking targeted questions.

1.  **Generate Clarification Questions (Max 5 per iteration):**
    Generate clarification questions (Max 5 per iteration) to eliminate ambiguity
    -   Based on the risks and ambiguities identified in the deep analysis, formulate up to 5 specific questions.
    -   Each question must be designed to eliminate ambiguity and should present concrete options or examples where possible.
    -   Focus on a logical progression: start with high-level conceptual questions and move towards detailed behavior, edge cases, and integration points.
2.  **Synthesize Answers & Update Understanding:**
    -   After receiving answers, update the internal understanding of the requirements.
    -   Re-evaluate the confidence level.
3.  **Repeat or Proceed:**
    -   If confidence is still below 95%, repeat the cycle with a new set of questions.
    -   If confidence is >95%, proceed to Phase 2.

## PHASE 2: MULTI-PERSPECTIVE CODEBASE EXPLORATION

Deploy parallel research tasks for comprehensive analysis & research to execute the requirement and decompose it structurally.

**Sub-Agent Task Distribution:**
```
AGENT 1: Backend Architecture Analysis
TASK: Explore service layer patterns and API design. You are analyzing the backend architecture.

REQUIREMENTS:
1. Map existing service patterns and conventions
2. Identify authentication and authorization approaches
3. Document error handling patterns
4. Analyze data flow between layers
5. Note testing patterns for services

DELIVERABLE: Backend architecture insights and patterns
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
AGENT 3: Frontend Architecture Analysis
TASK: Explore UI components and state management. You are analyzing the frontend implementation.

REQUIREMENTS:
1. Map component hierarchy and patterns
2. Identify state management approach
3. Document routing and navigation
4. Analyze design system usage
5. Note testing patterns for UI

DELIVERABLE: Frontend patterns and component architecture
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
AGENT 5: Researcher (optional)
TASK: Do a web research when requested to understand a specific library / component in detail

REQUIREMENTS:
1. For complex topics or specific libraries do a web research
2. Find specific code examples & integration patterns to be added into the specifications
3. Ensure that any ambiguity is clarified through proper research

DELIVERABLE: Solid research for any pending queries
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

**Confidence Level**: Must achieve 95%+ before proceeding to specification generation.

**Feature Breakdown Summary:**
```
Specifications ready for generation:
1. docs/specs/SPEC-[date]-[feature-1].md - [Core functionality]
2. docs/specs/SPEC-[date]-[feature-2].md - [Extended features]
3. docs/specs/SPEC-[date]-[feature-3].md - [Integration layer]

Total effort: [X days]
Dependencies mapped: [feature relationships]
```

## PHASE 4: SPECIFICATION DOCUMENT GENERATION

generate SPEC documents based on the user's ask and specific layers as applicable to the user's request; the major layers to define are - DATABASE, BACKEND, FRONTEND, INTEGRATION & TESTING; add layers as required if there are nuances in the tasks

**Document Structure per Spec File:**
```markdown

assign filenames and document title as per below format
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

**Notification & Exit Instructions:**
🔔 ARCHITECT_COMPLETE: Specification document ready - Architecture analysis complete, all layers documented
"Analysis and planning are complete with [X]% confidence. I am ready to generate the specification document(s). Please exit plan mode to proceed with generating and saving the files. The file should be create in path "/docs/[$FILENAME]. Create individual or multiple spec files as applicable with relevant details"