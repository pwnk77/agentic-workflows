# Product Requirements Document Generator

Transform brain dumps and feature ideas into implementation-ready PRDs with 95%+ confidence, by an experienced product manager

# Usage
/prd - looks at a brain dump in the form of document or text provided with the slash command and converts it into `docs/prd.md` (create if file not found)

## Context Analysis with Confidence Building
<thinking>
Starting with uncertainty about requirements:
- What is the actual problem being solved?
- Who are the users and what are their needs?
- What technical constraints and dependencies exist?
- What defines success for this feature?

Building confidence through systematic analysis:
- Clarifying vague requirements with specific questions
- Understanding technical context and integration points
- Defining measurable success criteria
- Validating feasibility and approach
</thinking>

## Protocol

### Step 1: Context Discovery
- Read existing codebase for patterns and architecture
- Analyze current file structure and conventions
- Identify existing patterns, libraries, and frameworks
- Understand current architecture and design decisions
- Review existing tests and documentation approach

### Step 2: Requirement Clarification (Max 5 specific questions per iteration)
- Ask probing questions to the user until the full PRD is updated with all relevant details
- Ensure clarity, completeness, and actionable requirements for downstream decomposition
- Example: "Which user roles need read vs write access to this feature?" (not "Who should use this?")

### Step 3: PRD Generation with Technical Precision

## Product Specifications

### Elevator Pitch
[Single sentence capturing unique value with measurable impact, with the "what" and "why" of the product from a user and business perspective]

### Target Users
- **Primary User**: [Specific user type with quantifiable characteristics]
- **Use Cases**: [Specific scenarios with context and frequency]
- **Pain Points**: [Current problems with measurable impact]

### Core Goals (3-5 Measurable Outcomes)
- **Goal 1**: [Specific metric with target - e.g., "Reduce processing time to <200ms"]
- **Goal 2**: [User behavior target - e.g., "Increase feature adoption by 40%"]
- **Goal 3**: [Business outcome - e.g., "Handle 10K+ concurrent requests"]

### Functional Requirements with Acceptance Criteria
- **FR-001**: [Feature with precise acceptance criteria and integration points]
- **FR-002**: [Feature with exact input/output specifications and validation rules]
- **FR-003**: [Feature with security requirements and error handling]

### User Stories with Precision
- **US-001**: As [specific user role], I want [exact action] so that [measurable benefit]
- **US-002**: As [user type], I want [specific capability] so that [quantified outcome]

### Non-Goals with Explicit Boundaries
- [Explicitly excluded functionality with reasoning]
- [Features deferred to future releases with timeline]

## Technical Specifications 

This section should capture the "how" of the product's implementation.

### System Architecture
- **System Patterns**: [Outline the overall system design, architectural patterns, and major components]
- **Frontend tech**: [Specify the frontend technologies, UI frameworks, and main screens or modules]
- **Database, Backend and APIs**: [Describe the backend stack, database choices, and API design or endpoints]
- **Component Relationships**: [How parts interact with data flow and between frontend to backend]
- **Integration Points**: [Internal & external connections with protocols and APIs]
- **Data Flow**: [Information movement with transformation points]

for agentic applications
- **Agent framework and usage**: [Explain any agent-based frameworks and how they interact with the system]
- **LLM infrastructure**: [Explain what LLM systems are used and how they integrate along with API requirements]

### Technology Stack with Versions
- **Language/Runtime**: [Specific version with justification]
- **Framework**: [Framework@version with architectural patterns]
- **Database**: [System@version with schema approach]
- **Authentication**: [Method with security requirements]

### Application outline (file structure of repo): 
Provide a high-level directory and file structure for the codebase.

### Implementation Approach
- **File Structure**: [Exact directory organization with naming conventions]
- **Code Patterns**: [Design patterns and architectural decisions]
- **Testing Strategy**: [Unit, integration, e2e with coverage targets]
- **Deployment**: [Build, test, deploy workflow with automation]

### Quality Standards
- **Performance**: [Response times, throughput, scalability targets]
- **Security**: [Authentication, authorization, data protection requirements]
- **Reliability**: [Error handling, monitoring, alerting specifications]

## Validation Gates (Must Achieve 95%+ Confidence)
- ✅ All requirements implementable with current tech stack
- ✅ No ambiguous language - all terms measurably defined
- ✅ Integration points clearly specified with existing systems
- ✅ Scope boundaries prevent feature creep
- ✅ Technical approach aligns with codebase patterns

**Save to**: `docs/prd.md` after user approval