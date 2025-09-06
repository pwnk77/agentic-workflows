---
description: MCP-integrated systematic feature analysis and specification generation through requirement crystallization and codebase exploration
allowed-tools: Task, TodoWrite, Read, Write, Edit, Glob, Grep, WebFetch, mcp__specgen-mcp__get_spec, mcp__specgen-mcp__search_specs, mcp__specgen-mcp__list_specs, mcp__specgen-mcp__launch_dashboard, mcp__specgen-mcp__refresh_metadata, mcp__static-analysis__*
argument-hint: <feature-description>
---

# ARCHITECT MODE SPECIFICATION COMMAND

**Goal**: This command guides the AI through a structured process to analyze a feature request, explore the codebase, and create detailed specifications using MCP (Model Context Protocol) integration.

**Process Overview**: You will act as a senior architect. You will perform requirement crystallization, codebase exploration, and specification generation using MCP tools. The analysis leverages SpecGen MCP for specification management and optionally Static Analysis MCP for TypeScript codebases.

**MCP Integration**: This command uses MCP tools for enhanced specification management:
- **specgen MCP** (`mcp__specgen-mcp__*`) for specification management with intelligent categorization
- **Static Analysis MCP** (`mcp__static-analysis__*`) for TypeScript analysis (optional)

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
Use traditional bash commands for code discovery:
- find . -name "*.js" -o -name "*.py" -o -name "*.php" | head -20
- grep -r "function\|class\|def" src/ | head -10
- find . -name "package.json" -o -name "requirements.txt" -o -name "composer.json"

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
   - Example format: "For user authentication, would you prefer: A) OAuth integration, B) Custom JWT implementation, or C) Third-party service like Auth0?"
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

**Note:** The SPEC document is the single source of truth where all subagent contexts and architectural analysis are consolidated.

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
1. Read feature context from current SPEC document using Read tool (docs/SPEC-[YYYYMMDD]-[feature-name].md)
2. Execute specialized research/analysis within defined constraints and scope
3. Generate structured findings in expected format for SPEC integration
4. Update SPEC document using Edit tool to modify architectural analysis sections
5. File watcher automatically updates search index and metadata
6. Return actionable summary with architectural insights and next steps

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

Add detailed implementation plan to the existing SPEC document after user approval.

**User Approval Required**: Present the implementation plan summary and request approval before adding to SPEC.

**Update SPEC with Implementation Plan:**
Use Edit tool to add `## Implementation Plan` section to existing SPEC document:

**Direct File Update Process:**
1. Use Edit tool to append `## Implementation Plan` section to existing SPEC file
2. File watcher automatically detects changes and updates search index
3. Metadata synchronization happens in real-time
4. Dashboard reflects changes immediately without manual refresh

**Implementation Plan Content Structure:**
```markdown
## Implementation Plan

### Task Breakdown by Layer

#### Database Layer
- [TASK-DB-001]: Schema design and migration scripts
- [TASK-DB-002]: Data model relationships setup
- [TASK-DB-003]: Database indexing and optimization

#### Backend Layer
- [TASK-BE-001]: Core service implementation
- [TASK-BE-002]: API endpoint creation
- [TASK-BE-003]: Authentication and authorization

#### Frontend Layer
- [TASK-FE-001]: Component architecture setup
- [TASK-FE-002]: User interface implementation
- [TASK-FE-003]: State management integration

#### Integration Layer
- [TASK-INT-001]: External service connections
- [TASK-INT-002]: Configuration management
- [TASK-INT-003]: Deployment pipeline setup

#### Testing Layer
- [TASK-TEST-001]: Unit test coverage
- [TASK-TEST-002]: Integration testing
- [TASK-TEST-003]: End-to-end validation

### Dependencies and Sequencing
- Database layer must complete before Backend layer
- Backend API must be ready before Frontend integration
- Core functionality before Integration layer
- Testing throughout all layers

### Timeline and Effort Estimates
- Database Layer: [X] hours/days
- Backend Layer: [X] hours/days
- Frontend Layer: [X] hours/days
- Integration Layer: [X] hours/days
- Testing Layer: [X] hours/days
- **Total Estimated Effort**: [X] hours/days

### Success Metrics
- All unit tests passing
- Integration tests functional
- Performance benchmarks met
- Security requirements satisfied
- User acceptance criteria fulfilled
```

**Completion:**

**Launch SpecGen Dashboard**:
Use `mcp__specgen-mcp__launch_dashboard` to display the completed SPEC in the dashboard interface
- Opens browser with interactive SPEC visualization
- Shows auto-categorized specifications by feature group
- Provides easy navigation through architecture analysis sections

**Refresh Metadata**:
Use `mcp__specgen-mcp__refresh_metadata` to update the metadata system after SPEC completion:
- Call `refresh_metadata(reason: "architect command completed")`
- Ensures dashboard and search systems are synchronized with new SPEC
- Updates category and status information for real-time dashboard display

🔔 ARCHITECT_COMPLETE: Specification ready with architecture analysis and implementation plan

"ARCHITECT analysis complete with [X]% confidence. SPEC document contains comprehensive architecture analysis from dynamic explorer deployment and detailed implementation plan. Dashboard launched for SPEC review. Ready for engineer command execution."