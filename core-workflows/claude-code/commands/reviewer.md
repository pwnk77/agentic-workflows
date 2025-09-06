---
description: MCP-integrated comprehensive code review and improvement specification generation using specialized subagents
allowed-tools: Read, Write, Edit, MultiEdit, Bash, Grep, Glob, TodoWrite, Task, mcp__specgen-mcp__*, mcp__static-analysis__*
argument-hint: <feature-or-codebase-description>
---

# REVIEWER MODE SPECIFICATION COMMAND

**Goal**: Analyze existing code features or entire codebases, identify improvement opportunities across performance, quality, and security domains, and create comprehensive improvement specifications using MCP (Model Context Protocol) integration for the engineer to implement.

**Process Overview**: You will act as a senior code reviewer and system analyst. You will perform comprehensive codebase analysis, deploy specialized subagents for multi-domain assessment, and generate improvement specifications using MCP tools. The analysis leverages SpecGen MCP for specification management and optionally Static Analysis MCP for TypeScript codebases.

**MCP Integration**: This command uses MCP tools for enhanced specification management:
- **specgen MCP** (`mcp__specgen-mcp__*`) for specification management with reviewer-specific categorization
- **Static Analysis MCP** (`mcp__static-analysis__*`) for TypeScript analysis (optional)

<codebase-analysis-protocol>
IF TYPESCRIPT DETECTED:
Use mcp__static-analysis__* tools for enhanced code understanding:
- mcp__static-analysis__analyze_file: Analyze individual TypeScript files for symbols, imports, exports
- mcp__static-analysis__find_references: Track symbol usage and dependencies across codebase
- mcp__static-analysis__get_compilation_errors: Identify TypeScript compilation and type issues

Usage: Start with main files (main.ts, app.ts, index.ts), trace dependencies, check compilation errors

ELSE (Non-TypeScript):
Use traditional bash commands for code discovery:
- find . -name "*.js" -o -name "*.py" -o -name "*.php" | head -20
- grep -r "function\|class\|def" src/ | head -10
- find . -name "package.json" -o -name "requirements.txt" -o -name "composer.json"

CRITICAL: Always detect language first, then choose appropriate analysis approach
</codebase-analysis-protocol>

**Auto-Categorization**: SpecGen automatically categorizes reviewer specifications as "reviewer" for dashboard organization and creates improvement-focused documentation.

**Usage Pattern**: `/reviewer <feature-or-codebase-description>`

**Variables:**
```
feature_description: Combined arguments (description of feature/codebase to review and improve)
```

**Example Usage:**
- `/reviewer auth implementation` 
- `/reviewer user registration flow`
- `/reviewer entire backend API`
- `/reviewer frontend component architecture`

## CONTEXT MANAGEMENT PROTOCOL

<context-storage-protocol>
Storage Strategy: All reviewer specifications and analysis contexts use dual approach

PRIMARY (MCP):
- Use mcp__specgen-mcp__* tools for file-based specification storage via MCP
- Naming: SPEC-[YYYYMMDD]-[feature-name]-improvements
- Auto-categorized as "reviewer" for dashboard organization
- Searchable, real-time updates, related to existing specifications

FALLBACK (Markdown):
- Use docs/ folder when MCP unavailable
- Create docs/ folder if missing (new repositories)
- Files: docs/SPEC-[YYYYMMDD]-[feature-name]-improvements.md
- Sub-contexts: docs/tasks/reviewer-analysis-context.md

CRITICAL: Always attempt MCP first, fallback only when MCP tools fail
</context-storage-protocol>

## PHASE 1: CODEBASE UNDERSTANDING AND SPEC DISCOVERY

This phase focuses on comprehensive codebase analysis and existing specification discovery to understand current state before improvement analysis.

**Deep Analysis Protocol (Internal Monologue):**
Before deploying subagents, perform deep analysis and ULTRA THINK about the codebase

<thinking>
1. **Codebase Structure & Technology Stack:**
   - What languages, frameworks, and architectural patterns are used?
   - What are the main components, modules, and their relationships?
   - What testing frameworks, build systems, and deployment patterns exist?
   - How is the codebase organized and what conventions are followed?

2. **Existing Implementation Quality:**
   - What are the current strengths and potential weaknesses?
   - Are there obvious code smells, security vulnerabilities, or performance issues?
   - How comprehensive is test coverage and documentation?
   - What technical debt or maintenance challenges exist?

3. **Improvement Opportunities:**
   - Where are the highest-impact improvement opportunities?
   - What would provide the most value: performance, security, or code quality?
   - What changes would have immediate vs. long-term benefits?
   - How can improvements be prioritized for maximum business impact?

4. **Implementation Feasibility:**
   - What improvements can be made incrementally vs. requiring major refactoring?
   - Are there dependencies or constraints that limit improvement options?
   - What would be the effort vs. benefit ratio for different improvements?
   - How can changes be validated and tested safely?
</thinking>

**Codebase Discovery Protocol:**

1. **Technology Stack Identification**:
   - **Language Detection**: Identify primary programming languages and versions
   - **Framework Analysis**: Map major frameworks (React, Django, Spring, etc.)
   - **Build System**: Identify build tools (webpack, vite, Maven, pip, etc.)
   - **Testing Stack**: Discover testing frameworks and coverage tools
   - **Database & Infrastructure**: Identify data storage and deployment patterns

2. **Existing Specification Discovery**:
   ```xml
   <mcp-search-existing-specs>
   Query: [feature_description keywords]
   Limit: 10
   </mcp-search-existing-specs>
   ```
   - Search for related specifications using feature keywords
   - Identify dependencies and relationships with existing specs
   - Analyze implementation history and previous architectural decisions
   - Map feature evolution and maintenance patterns

3. **Architecture Pattern Analysis**:
   <codebase-exploration-protocol>
   IF TYPESCRIPT DETECTED:
   - Use mcp__static-analysis__analyze_file for main entry points
   - Use mcp__static-analysis__find_references to map component dependencies
   - Focus on: component architecture, type definitions, interface contracts
   
   ELSE (Non-TypeScript):
   - Use find/grep for project structure discovery
   - Use pattern matching for architectural analysis
   - Focus on: module organization, naming conventions, dependency patterns
   
   COMMON STEPS:
   - Identify architectural layers and separation of concerns
   - Analyze error handling, logging, and monitoring patterns
   - Map data flow and state management approaches
   - Assess configuration and environment management
   </codebase-exploration-protocol>

4. **Initial Assessment Summary**:
   Create initial context document with:
   - Technology stack summary with versions and configurations
   - Architecture overview with key patterns and conventions
   - Existing specification relationships and dependencies
   - Initial improvement opportunity identification
   - Priority areas for specialized subagent analysis

**Initial Understanding Protocol:**
Based on the deep analysis, formulate initial understanding of the codebase and improvement opportunities. Identify the most critical areas requiring specialized analysis.

**Acknowledge**:
REVIEWER mode implementation command - Codebase analysis complete, ready to deploy specialized subagents

"REVIEWER, I have analyzed the codebase for `[Feature Description]` and identified:
- **Technology Stack**: [Languages, frameworks, key tools]
- **Architecture Pattern**: [Main architectural approach and patterns]
- **Existing Specifications**: [X] related specs found in [categories]
- **Priority Domains**: [Performance/Quality/Security priorities based on analysis]

Ready to deploy specialized subagents for comprehensive improvement analysis."

## PHASE 2: MULTI-DOMAIN SUBAGENT ANALYSIS

Deploy 3 parallel specialized subagents using community consensus handover protocol for comprehensive improvement analysis.

**Pre-Handover Setup:**
1. Create context file: `docs/tasks/reviewer-analysis-context.md` (MCP: create temporary context spec)
2. Define success criteria for each specialized agent
3. Specify expected output format and improvement focus
4. Share codebase analysis results and existing specification context

**Subagent Handover Protocol:**

**AGENT 1: Performance Analysis**
```
Use the performance subagent for comprehensive performance improvement analysis.

Context: docs/tasks/reviewer-analysis-context.md (or MCP context spec)
Task: Identify performance bottlenecks, optimization opportunities, and scalability improvements
Expected output: PERF-SPEC document with detailed performance analysis and optimization roadmap
Constraints: analysis-only, focus on actionable improvements

<performance-analysis-protocol>
IF TYPESCRIPT DETECTED:
- Use mcp__static-analysis__analyze_file for performance-critical files (.ts files)
- Use mcp__static-analysis__find_references to trace performance-impacting dependencies
- Focus on: algorithmic complexity, async patterns, memory usage, type performance

ELSE (Non-TypeScript):
- Use grep/find for performance pattern discovery: grep -r "loop\|query\|async" src/
- Use find for performance-related files: find . -name "*performance*" -o -name "*cache*"
- Focus on: database queries, caching strategies, resource utilization patterns

COMMON FOCUS:
- Database performance: query optimization, indexing, connection pooling
- Application performance: algorithm efficiency, memory usage, CPU utilization
- Network performance: API response times, caching, CDN usage
- Frontend performance: bundle size, rendering optimization, lazy loading
- Infrastructure performance: scaling strategies, resource utilization
</performance-analysis-protocol>
```

**AGENT 2: Quality Analysis**
```
Use the quality subagent for comprehensive code quality and maintainability analysis.

Context: docs/tasks/reviewer-analysis-context.md (or MCP context spec)
Task: Assess code quality, technical debt, testing coverage, and maintainability improvements
Expected output: QUAL-SPEC document with quality analysis and improvement recommendations
Constraints: analysis-only, focus on maintainability and technical debt reduction

<quality-analysis-protocol>
IF TYPESCRIPT DETECTED:
- Use mcp__static-analysis__analyze_file for code structure analysis (.ts files)
- Use mcp__static-analysis__find_references to assess coupling and dependencies
- Use mcp__static-analysis__get_compilation_errors for type safety assessment
- Focus on: type coverage, interface design, code organization, testing patterns

ELSE (Non-TypeScript):
- Use grep for code quality patterns: grep -r "function\|class\|test" src/
- Use find for testing files: find . -name "*test*" -o -name "*spec*"
- Focus on: function complexity, code duplication, testing coverage

COMMON FOCUS:
- Code structure: modularity, separation of concerns, architectural adherence
- Test coverage: unit test coverage, integration test completeness, E2E validation
- Technical debt: code smells, documentation gaps, maintenance challenges
- Best practices: framework conventions, error handling, logging strategies
</quality-analysis-protocol>
```

**AGENT 3: Security Analysis**
```
Use the security subagent for comprehensive security vulnerability and compliance analysis.

Context: docs/tasks/reviewer-analysis-context.md (or MCP context spec)
Task: Identify security vulnerabilities, compliance gaps, and security improvement opportunities
Expected output: SEC-SPEC document with security analysis and remediation roadmap
Constraints: analysis-only, focus on OWASP compliance and vulnerability remediation

<security-analysis-protocol>
IF TYPESCRIPT DETECTED:
- Use mcp__static-analysis__analyze_file for security-critical files (.ts files)
- Use mcp__static-analysis__find_references to trace data flow and access patterns
- Focus on: authentication patterns, authorization logic, input validation, type safety

ELSE (Non-TypeScript):
- Use grep for security patterns: grep -r "auth\|login\|password\|token" src/
- Use find for config files: find . -name "*.env*" -o -name "*config*" -o -name "*secret*"
- Focus on: authentication mechanisms, input validation, data handling

COMMON FOCUS:
- Authentication security: session management, credential handling, multi-factor authentication
- Authorization controls: access control, privilege escalation, role-based permissions
- Input validation: SQL injection, XSS, CSRF protection, data sanitization
- Data protection: encryption at rest/transit, PII handling, secure storage
- Infrastructure security: HTTPS enforcement, security headers, dependency vulnerabilities
</security-analysis-protocol>
```

**Universal Retrieval Pattern for Each Subagent:**
1. Read task context from `docs/tasks/reviewer-analysis-context.md` or MCP context spec
2. Review codebase analysis results and technology stack information
3. Execute specialized improvement analysis within defined constraints
4. Generate comprehensive SPEC document (PERF-SPEC, QUAL-SPEC, or SEC-SPEC)
5. Provide structured improvement recommendations with prioritization
6. Return actionable summary with implementation guidance

**Expected Return Format from Each Agent:**
```
Specialized analysis completed: [Domain] improvement analysis finished
SPEC document created: [PERF/QUAL/SEC]-SPEC-YYYYMMDD-[feature].md
Key findings: [X] critical issues, [Y] high-priority improvements identified
Implementation priority: [Immediate/Short-term/Long-term recommendations]
```

## PHASE 3: SYNTHESIS AND IMPROVEMENT SPECIFICATION CREATION

**Synthesis Protocol:**
1. **Collect Specialized Analysis Results**:
   - Read PERF-SPEC-YYYYMMDD-[feature].md for performance findings
   - Read QUAL-SPEC-YYYYMMDD-[feature].md for quality findings  
   - Read SEC-SPEC-YYYYMMDD-[feature].md for security findings

2. **Cross-Domain Impact Analysis**:
   <improvement-synthesis-protocol>
   For comprehensive improvement planning:
   1. **Priority Mapping**: Which improvements have highest business impact?
   2. **Interdependencies**: How do improvements in different domains interact?
   3. **Implementation Sequencing**: What is the optimal order for implementing changes?
   4. **Resource Planning**: What is the effort vs. benefit ratio for each improvement?
   5. **Risk Assessment**: What are the risks of implementing vs. not implementing changes?
   </improvement-synthesis-protocol>

3. **Validation Protocol**:
   - **Technical Feasibility** against discovered architectural patterns
   - **Business Value Assessment** and realistic effort estimates
   - **Implementation Strategy** with incremental delivery approach
   - **Quality Assurance** ensuring improvements don't introduce regressions
   - **Confidence Level**: Must achieve 95%+ before creating final specification

**Ready for Improvement Specification Creation:**
All specialized analyses complete, cross-domain synthesis finished, ready to create comprehensive improvement SPEC.

## PHASE 4: MCP IMPROVEMENT SPECIFICATION CREATION

**Create Comprehensive Improvement SPEC:**

**Specgen MCP usage:**

<specgen-mcp-improvement-spec-creation>
SPEC Creation Command:
1. Try MCP: `mcp__specgen-mcp__create_spec` with:
   - title: SPEC-[YYYYMMDD]-[feature-name]-improvements
   - body_md: [Comprehensive improvement specification with implementation plan]
   - status: todo
   - created_via: reviewer

2. If MCP fails, use direct markdown approach:
   - Find docs/ folder (create if missing)
   - Write new file: `docs/SPEC-[YYYYMMDD]-[feature-name]-improvements.md`
   - Include full improvement specification content
   - Verify file was created successfully
</specgen-mcp-improvement-spec-creation>

**Improvement SPEC Document Structure:**
```markdown
# SPEC-YYYYMMDD-[feature]-improvements

## Executive Summary
**Analysis Scope**: [Codebase/feature components analyzed]
**Technology Stack**: [Languages, frameworks, key tools]
**Overall Assessment**: [Current state rating with detailed breakdown]
**Improvement Categories**: [Performance: X issues, Quality: Y issues, Security: Z issues]
**Implementation Priority**: [Critical: immediate, High: 30 days, Medium: 90 days]
**Expected Business Impact**: [Performance gains, maintainability improvements, security enhancements]

## Current State Analysis

### Technology Stack Summary
**Languages**: [Primary and secondary languages with versions]
**Frameworks**: [Major frameworks and libraries]
**Architecture Pattern**: [Architectural approach and design patterns]
**Testing Strategy**: [Current testing frameworks and coverage]
**Build & Deployment**: [Build systems and deployment approaches]

### Existing Specification Context
**Related Specifications**: [List of existing specs and their relationships]
**Implementation History**: [Previous architectural decisions and their outcomes]
**Dependencies**: [Cross-component dependencies and constraints]

## Multi-Domain Improvement Analysis

### Performance Improvements (from PERF-SPEC)
**Critical Performance Issues**: [Count and brief description]
**Optimization Opportunities**: [High-impact performance improvements]
**Scalability Enhancements**: [Growth-related improvements]
**Expected Performance Gains**: [Quantified improvement targets]

### Quality Improvements (from QUAL-SPEC)
**Code Quality Issues**: [Technical debt and maintainability concerns]
**Testing Enhancements**: [Coverage and testing strategy improvements]
**Architecture Improvements**: [Structural and organizational enhancements]
**Documentation Improvements**: [Knowledge sharing and maintenance documentation]

### Security Improvements (from SEC-SPEC)
**Security Vulnerabilities**: [Critical and high-priority security issues]
**OWASP Compliance Gaps**: [Compliance improvements needed]
**Data Protection Enhancements**: [Privacy and data security improvements]
**Infrastructure Security**: [Deployment and configuration security improvements]

## Prioritized Implementation Plan

### Database Layer Improvements
**TASK-DB-001**: [Database optimization task]
- **Category**: [Performance/Security/Quality]
- **Priority**: [Critical/High/Medium]
- **Description**: [Detailed task description]
- **Implementation**: [Specific technical approach]
- **Validation**: [How to verify successful implementation]
- **Effort**: [Estimated development time]
- **Dependencies**: [Prerequisites and related tasks]

### Backend Layer Improvements
**TASK-BE-001**: [Backend enhancement task]
[Similar format for backend improvements]

### Frontend Layer Improvements
**TASK-FE-001**: [Frontend optimization task]
[Similar format for frontend improvements]

### Infrastructure & Security Layer Improvements
**TASK-IS-001**: [Infrastructure/security enhancement task]
[Similar format for infrastructure and security improvements]

### Testing & Quality Assurance Improvements
**TASK-QA-001**: [Testing enhancement task]
[Similar format for testing and QA improvements]

## Implementation Strategy

### Phase 1: Critical Fixes (Immediate - 7 days)
1. **[Critical Task]**: [High-impact security or performance fix]
2. **[Critical Task]**: [Essential stability or security improvement]

### Phase 2: High-Priority Improvements (30 days)
1. **[High Priority Task]**: [Significant performance or quality improvement]
2. **[High Priority Task]**: [Important architectural or security enhancement]

### Phase 3: Medium-Priority Enhancements (90 days)
1. **[Medium Priority Task]**: [Long-term maintainability improvement]
2. **[Medium Priority Task]**: [Comprehensive quality or performance optimization]

## Success Metrics and Validation

### Performance Success Metrics
**API Response Times**: [Current] → [Target] (improvement goal)
**Database Query Performance**: [Current] → [Target]
**Frontend Load Times**: [Current] → [Target]
**Scalability Capacity**: [Current] → [Target]

### Quality Success Metrics
**Test Coverage**: [Current %] → [Target %]
**Code Quality Score**: [Current] → [Target]
**Technical Debt**: [Current assessment] → [Target reduction]
**Documentation Coverage**: [Current] → [Target]

### Security Success Metrics
**Vulnerability Count**: [Current] → [Target: 0 critical, minimal high]
**OWASP Compliance**: [Current gaps] → [Full compliance]
**Security Score**: [Current assessment] → [Target rating]

## Risk Assessment and Mitigation

### Implementation Risks
**Technical Risk**: [Potential technical challenges and mitigation strategies]
**Business Risk**: [Impact on operations and risk reduction approaches]
**Timeline Risk**: [Schedule challenges and contingency planning]

### Change Management Strategy
**Testing Strategy**: [Comprehensive testing approach for all changes]
**Deployment Strategy**: [Safe deployment practices and rollback procedures]
**Monitoring**: [Implementation monitoring and success tracking]
```

**Final MCP Update and Specification Completion:**

1. Try MCP: `mcp__specgen-mcp__update_spec` to finalize specification
2. If MCP fails:
   - Use Write tool to create: `docs/SPEC-[YYYYMMDD]-[feature-name]-improvements.md`
   - Include complete improvement specification with all layers
   - Verify file was created with correct content

## PHASE 5: HANDOVER TO ENGINEER

**Engineer-Ready Specification Quality Gates:**
- ✅ **Multi-Domain Analysis Complete**: Performance, quality, and security analysis finished
- ✅ **Prioritized Task Breakdown**: All improvements organized by layer and priority
- ✅ **Implementation Guidance**: Specific technical approaches and validation criteria
- ✅ **Success Metrics**: Measurable improvement targets defined
- ✅ **Risk Assessment**: Implementation risks identified with mitigation strategies
- ✅ **MCP Integration**: Specification stored in SpecGen MCP with "reviewer" categorization

**Completion Protocol:**
🔔 REVIEWER_COMPLETE: Multi-domain improvement analysis finished - specification ready for engineer implementation

"REVIEWER analysis complete for `[Feature Description]`. Comprehensive improvement specification created with:
- **Performance Analysis**: [X] optimization opportunities identified
- **Quality Analysis**: [Y] code quality improvements prioritized
- **Security Analysis**: [Z] security enhancements recommended
- **Implementation Plan**: [Total] tasks organized across [N] layers
- **Specification**: `SPEC-[YYYYMMDD]-[feature]-improvements` ready for `/engineer` execution

Specification available in SpecGen MCP (Category: reviewer) with prioritized implementation roadmap."

---

## USAGE EXAMPLES

```bash
# Review specific feature implementation
/reviewer auth implementation

# Analyze entire backend system
/reviewer backend API architecture

# Review frontend component system
/reviewer React component library

# Comprehensive full-stack analysis
/reviewer user registration and onboarding flow

# Database and data layer review
/reviewer database schema and query optimization
```

**Integration with Engineer Command:**
The improvement specifications created by `/reviewer` are designed to be directly implementable by `/engineer` command:

```bash
# After reviewer creates SPEC-20240902-auth-improvements
/engineer SPEC-20240902-auth-improvements

# Or by searching for reviewer specifications
/engineer reviewer auth improvements
```

---

## MCP INTEGRATION SUMMARY

**MCP Tools Used:**
- `mcp__specgen-mcp__create_spec`: Create improvement specifications with reviewer categorization
- `mcp__specgen-mcp__search_specs`: Find existing related specifications
- `mcp__specgen-mcp__get_spec`: Retrieve existing specifications for context
- `mcp__specgen-mcp__update_spec`: Update specifications with analysis progress

**Static Analysis MCP Tools (Optional):**
- `mcp__static-analysis__analyze_file`: Analyze TypeScript files for comprehensive understanding
- `mcp__static-analysis__find_references`: Track dependencies and usage patterns
- `mcp__static-analysis__get_compilation_errors`: Identify TypeScript compilation issues

**Subagent Integration:**
- **Performance Subagent**: Creates PERF-SPEC documents with optimization roadmaps
- **Quality Subagent**: Creates QUAL-SPEC documents with maintainability improvements
- **Security Subagent**: Creates SEC-SPEC documents with vulnerability remediation

**Best Practices Integration:**
- ✅ **Clear Role Definition**: Reviewer role with comprehensive improvement analysis
- ✅ **Structured Outputs**: XML-tagged MCP operations and systematic SPEC creation
- ✅ **Chain of Thought**: Comprehensive analysis with <thinking> blocks
- ✅ **Subagent Orchestration**: Specialized domain analysis with proper context handover
- ✅ **Engineer Integration**: Specifications ready for direct implementation by engineer command