---
description: Comprehensive code review across security, quality, and performance domains with subagent analysis
allowed-tools: Bash, Grep, Glob, Read, Write, TodoWrite, Task
argument-hint: [mode: security | quality | performance] <goal>
---

# CODE REVIEWER COMMAND

**Goal**: Comprehensive code review across security, quality, and performance domains using subagent analysis.

**Variables:**
```
mode: $ARGUMENTS (optional: 'security', 'quality', 'performance', defaults to 'quality')
goal: $ARGUMENTS (required: specific review objective, e.g., "review authentication system")
```

## INITIAL ANALYSIS

<thinking>
Before starting the review, I need to understand:
- What specific aspect of the codebase needs review?
- What are the key risk areas for this review mode?
- What technologies and patterns are used in this codebase?
- What testing frameworks and tools are available?
- What are the most important security/quality/performance considerations?

Mode-specific considerations:
- Security: Auth systems, data handling, input validation, dependency vulnerabilities
- Quality: Test coverage, code maintainability, architecture patterns, best practices
- Performance: Bottlenecks, optimization opportunities, scalability concerns

The review should be thorough but focused on actionable improvements.
</thinking>

## PHASE 1: PLANNING & CODEBASE EXPLORATION

**Subagent Deployment:**

```
AGENT 1: Technology Stack Analysis
TASK: Identify languages, frameworks, testing tools, and build systems
DELIVERABLE: Technology landscape and tooling context

AGENT 2: Architecture Analysis  
TASK: Map application structure, patterns, and dependencies
DELIVERABLE: Architectural context and design insights

AGENT 3: Mode-Specific Deep Dive
TASK: Focus analysis based on review mode
- Security: Auth flows, data handling, input validation
- Quality: Test structure, maintainability, best practices
- Performance: Critical paths, bottlenecks, optimization opportunities
DELIVERABLE: Mode-specific technical analysis
```

**Confidence Building Protocol (>95% target):**

**Leading Questions (Max 5 per iteration):**
1. **Scope**: "What specific area should I focus the review on?"
2. **Technical**: "What testing frameworks are you using? (Jest, Pytest, etc.)"
3. **Standards**: "Are there specific coding standards or security requirements?"
4. **Priority**: "What would be the highest impact areas to improve?"
5. **Output**: "How detailed should the recommendations be?"

**Plan Presentation:**

> **REVIEWER PLAN SUMMARY**
> 
> **Review Mode:** [Security/Quality/Performance]
> **Goal:** [Specific review objective]
> **Technology Stack:** [Languages, frameworks, tools]
> **Focus Areas:** [Key components to review]
> 
> **Planned Review Steps:**
> 1. [Analysis area 1 - estimated time]
> 2. [Analysis area 2 - estimated time]
> 3. [Analysis area 3 - estimated time]
> 
> **Deliverables:** Comprehensive review report with prioritized recommendations
> **Confidence Level:** [X]% - [Brief justification]
> 
> 🔔 APPROVAL_REQUEST: Plan approval required before review execution
> 
> **REVIEWER**, plan ready. Please approve to proceed.

## PHASE 2: REVIEW EXECUTION & DOCUMENTATION

**Mode-Specific Review Protocols:**

### SECURITY REVIEW
**Focus Areas:** Auth systems, input validation, data encryption, API security, dependency vulnerabilities, secret management

**Analysis Pattern:**
1. Authentication: Session management, token handling
2. Authorization: Access control, privilege escalation
3. Input Validation: SQL injection, XSS, CSRF protection
4. Data Protection: Encryption, PII handling
5. Infrastructure: HTTPS, security headers, CORS
6. Dependencies: Known vulnerabilities, outdated packages

### QUALITY REVIEW (Default)
**Focus Areas:** Test coverage (unit/integration/e2e), maintainability, architecture, error handling, documentation

**Testing Framework Assessment by Language:**
- **JavaScript/TypeScript**: Jest, Mocha, Cypress, Playwright
- **Python**: Pytest, unittest, Selenium
- **Java**: JUnit, TestNG, Mockito
- **Ruby**: RSpec, Minitest
- **Go**: Go test, Ginkgo
- **C#**: NUnit, xUnit, MSTest

**Analysis Pattern:**
1. Test Coverage: Unit test ratio, integration coverage
2. Code Quality: Complexity, maintainability, duplication
3. Architecture: Layer separation, dependency management
4. Error Handling: Exception patterns, logging strategy
5. Documentation: API docs, code comments, README quality
6. Best Practices: Framework conventions, security patterns

### PERFORMANCE REVIEW
**Focus Areas:** Database optimization, caching, API bottlenecks, memory usage, frontend performance, scaling

**Analysis Pattern:**
1. Database: Query optimization, indexing, N+1 problems
2. Application: Algorithmic complexity, memory usage
3. Network: API design, caching, CDN usage
4. Frontend: Bundle size, lazy loading, rendering
5. Infrastructure: Scaling patterns, resource utilization
6. Monitoring: Performance metrics, observability

**Review Documentation:**

Save analysis to `docs/REVIEW-[mode]-[YYYYMMDD]-[goal].md`:

```markdown
# [MODE] REVIEW: [Goal]

## Executive Summary
**Review Mode**: [Security/Quality/Performance]
**Scope**: [Components reviewed]
**Critical Issues**: [Count and description]
**Overall Assessment**: [High/Medium/Low rating]
**Priority Actions**: [Top 3 recommendations]

## Technology Analysis
**Languages**: [List with versions]
**Frameworks**: [Major frameworks]
**Testing Stack**: [Testing tools]

## Findings & Issues

### Critical Issues (Immediate attention)
1. **[Issue Title]**
   - **Risk Level**: Critical
   - **Description**: [Technical details]
   - **Impact**: [Consequences]
   - **Recommendation**: [Specific action]
   - **Files**: [Affected components]

### High Priority Issues
[Similar format for high priority items]

### Medium/Low Priority
[Brief format for remaining items]

## Mode-Specific Analysis
**Strengths**: [What's working well]
**Weaknesses**: [Areas needing improvement]
**Best Practice Gaps**: [Standards not followed]

## Recommendations

### Immediate Actions (Next 7 days)
1. [Critical fix with specific steps]

### Short Term (Next 30 days)
1. [Medium priority improvements]

### Long Term (Next 90 days)
1. [Architectural improvements]

## Implementation Guidance
**Tools Recommended**: [Specific tools/libraries]
**Testing Strategy**: [Testing approach for changes]
**Risk Mitigation**: [Safe deployment approach]

## Quality Metrics
- **Test Coverage**: [Current %] → [Target %]
- **Technical Debt**: [Assessment]
- **Performance**: [Current metrics]
- **Security Score**: [Rating]

## Follow-up Actions
1. [Specific tasks with timeline]
2. [Review checkpoints]
3. [Monitoring plan]
```

**Mode-Specific Quality Gates:**

**Security Review:**
- ✅ Authentication/authorization analyzed
- ✅ Input validation assessed
- ✅ Dependencies checked for vulnerabilities
- ✅ Data protection reviewed
- ✅ OWASP compliance evaluated

**Quality Review:**
- ✅ Test coverage measured
- ✅ Code maintainability assessed
- ✅ Architecture patterns reviewed
- ✅ Error handling evaluated
- ✅ Documentation quality checked

**Performance Review:**
- ✅ Database performance analyzed
- ✅ Application bottlenecks identified
- ✅ Caching strategies evaluated
- ✅ Frontend performance assessed
- ✅ Scaling considerations reviewed

**Completion Protocol:**
🔔 REVIEWER_COMPLETE: Code review finished

"**REVIEWER**, [mode] review complete for '[goal]'. Analysis saved to `docs/REVIEW-[mode]-[YYYYMMDD]-[goal].md` with [X] critical issues and [Y] recommendations prioritized for implementation."