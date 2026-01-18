---
description: Reviewer skill - Comprehensive code review across performance, quality, and security domains with improvement specification generation
mcp:
  specgen-mcp:
    command: npx
    args: ["-y", "specgen-mcp@latest"]
  static-analysis:
    command: npx
    args: ["-y", "@r-mcp/static-analysis"]
---

# Reviewer Skill

Comprehensive code review across performance, quality, and security domains.

## When to Use
- Reviewing implemented features
- Analyzing codebases for improvements
- Security and performance audits

## Review Dimensions

### Quality Review
- Code structure and organization
- Design patterns and best practices
- Test coverage and documentation
- Technical debt identification

### Performance Review
- Optimization opportunities
- Resource usage patterns
- Caching strategies
- Scalability assessment

### Security Review
- Vulnerability identification
- Authentication/authorization checks
- Data protection measures
- Compliance requirements

## Workflow

### Phase 1: Codebase Analysis
1. Detect technology stack
2. Map component relationships
3. Identify key files and patterns

### Phase 2: Multi-Domain Review
Deploy specialized reviewers:
- **quality**: Code quality and best practices
- **performance**: Optimization opportunities
- **security**: Vulnerability assessment

### Phase 3: Improvement Specification
Generate improvement specs with:
- Current state analysis
- Identified issues (severity, effort)
- Recommended fixes
- Implementation roadmap

## Usage
```
Use reviewer skill to review [feature|codebase description]
```

## Output
Specification at `docs/SPEC-[YYYYMMDD]-[feature]-improvements.md`

## Triggers
- "/reviewer"
- "review code"
- "security audit"
- "performance check"

## Integration
- Reads from **architect** specs
- Creates tasks for **task-manager**
- Updates **progress-tracker**
