# SpecGen-v3 Prompts and Tools Documentation

## Overview

This document provides comprehensive documentation for all prompts and tools in the SpecGen-v3 MCP server, including detailed input/output examples and usage patterns. The prompts are embedded within the TypeScript tool implementations rather than stored as separate files.

---

# SECTION 1: PROMPTS

## Build Tool Prompts

### 1. Architect Prompt Template

**Location**: `src/tools/build/architect.ts:49-72`

```
🏗️ **Architecture Analysis Complete**

**Feature**: {feature}
**Spec ID**: {specId}
**Analysis Depth**: {depth}
**Complexity**: {complexity}
**Estimated Effort**: {estimatedEffort}

## 📋 Architecture Recommendations:
• Start with database layer if data persistence is needed
• Define API contracts before implementation
• Consider error handling and edge cases
• Plan for testing and validation

## 🔧 Implementation Approach:
1. **Database Layer**: Define data models and persistence
2. **Backend Layer**: Implement business logic and APIs
3. **Frontend Layer**: Create user interface components
4. **Integration Layer**: Connect external services
5. **Testing Layer**: Comprehensive test coverage

## 🚀 Next Steps:
- Use `specgen_build_engineer` to start implementation
- Consider `specgen_worktree_create` for isolated development
- Review existing codebase patterns for consistency

**Architecture analysis ready for implementation planning.**
```

### 2. Engineer Prompt Template

**Location**: `src/tools/build/engineer.ts:73-106`

```
⚙️ **Engineering Implementation Pipeline**

**Spec ID**: {specId}
**Mode**: {mode}
**Layer**: {layer}
**Dry Run**: {dryRun}

## 🔧 Implementation Steps for {layer}:
{implementation_steps}

## 📋 Implementation Guidelines:
- Follow existing code patterns and conventions
- Write tests before or alongside implementation
- Document complex business logic
- Handle error cases gracefully
- Consider performance and scalability

## 🚨 {mode} Mode Instructions:
{mode_specific_instructions}

## 🚀 Next Steps:
- Use appropriate development tools for your stack
- Run tests frequently during development
- Use `specgen_worktree_status` to track changes
- Review with `specgen_build_reviewer` when complete

**Implementation pipeline ready for execution.**
```

**Debug Mode Instructions**:
- Identify failing tests or broken functionality
- Add diagnostic logging
- Isolate problem areas
- Fix root causes systematically

**Continue Mode Instructions**:
- Resume from last checkpoint
- Review previous implementation
- Continue with next planned tasks
- Maintain consistency with existing work

**Implement Mode Instructions**:
- Start fresh implementation
- Follow specification requirements
- Implement layer by layer
- Test as you build

### 3. Reviewer Prompt Template

**Location**: `src/tools/build/reviewer.ts:85-133`

```
📋 **Code Review Report**

**Spec ID**: {specId}
**Review Scope**: {scope}
**Minimum Severity**: {severity}
**Total Findings**: {totalFindings}

## 🔍 Review Criteria Applied:
{selected_criteria}

## 🚨 Findings by Severity:

### Critical Issues:
{critical_findings}

### High Priority Issues:
{high_priority_findings}

### Medium Priority Issues:
{medium_priority_findings}

### Low Priority Issues:
{low_priority_findings}

## 📊 Review Summary:
- **Security**: {reviewed_status}
- **Performance**: {reviewed_status}
- **Code Quality**: {reviewed_status}
- **Architecture**: {reviewed_status}

## 🎯 Recommendations:
1. Address critical and high priority issues first
2. Consider implementing automated code quality checks
3. Add comprehensive test coverage for new features
4. Regular security audits for production code
5. Document architectural decisions and patterns

## 🚀 Next Steps:
- Address findings in order of severity
- Use `specgen_build_engineer` to implement fixes
- Re-run review after improvements
- Consider adding automated checks to prevent future issues

**Code review completed successfully.**
```

## Research Tool Prompts

### 1. Analyze Summary Template

**Location**: `src/tools/research/analyze.ts:243-257`

```
📁 Files Analyzed: {totalFiles}
📏 Total Lines: {totalLines}

🏗️ Symbol Summary:
• Functions: {functionCount}
• Classes: {classCount}
• Imports: {importCount}
• Other: {otherCount}

🔤 Language Breakdown:
{languageBreakdown}

🔍 Pattern Matches: {patternMatches}

💡 Analysis completed successfully. Use specgen_research_search for targeted symbol queries.
```

### 2. Search Results Template

**Location**: `src/tools/research/search.ts:216-252`

```
🎯 Query: "{query}" (scope: {scope})
📁 Files searched: {totalFiles}
📄 Files with matches: {fileCount}
🔗 Total matches: {totalMatches}

🏆 Top Results:
{topResults}

💡 Use specgen_research_analyze for deeper symbol analysis
```

### 3. Research Summary Template

**Location**: `src/tools/research/fetch.ts:288-320`

```
🎯 Topics: {topics}
🔍 Queries generated: {queriesGenerated}
📄 Pages fetched: {pagesFetched}
📊 Unique results: {resultsCount}

🏆 Top Results:
{topResults}

💡 Results are cached for 24 hours. Use different topics for broader research.
```

### 4. Dependencies Summary Template

**Location**: `src/tools/research/dependencies.ts:447-483`

```
🏗️ Project Types: {projectTypes}
📦 Total Dependencies: {totalDependencies}

📊 By Package Manager:
{packageManagerBreakdown}

🎯 By Scope:
{scopeBreakdown}

🚨 Security Issues: {securityIssues}
📅 Outdated Packages: {outdatedPackages}
⚡ Version Conflicts: {conflicts}

💡 Use package manager commands to update outdated dependencies and resolve conflicts.
```

## Spec Management Prompts

### 1. Create Spec Template

**Location**: `src/tools/spec/create.ts:162-186`

```
✅ **Specification Created Successfully**

**Spec ID**: {specId}
**File**: {filename}
**Category**: {category}
**Status**: draft
**Path**: {specPath}

**Metadata**:
- Priority: {priority}
- Effort Estimate: {effortEstimate}
- Created: {createdAt}
- Completion: {completion}%

**Next Steps**:
1. Edit the specification content in {filename}
2. Use `specgen_spec_orchestrate` to get recommended next actions
3. Run `mcp__specgen-mcp__refresh_metadata` to update the registry
4. Use `specgen_worktree_create` to set up isolated development environment

The specification template has been created with standard sections. You can now start filling in the details for your {category} specification.
```

### 2. Orchestrate Workflow Template

**Location**: `src/tools/spec/orchestrate.ts:265-294`

```
🎯 **Workflow Orchestration for {specTitle}**

**Intent**: {intent}
**Status**: {status}
**Category**: {category}
**Completion**: {completion}%

**Context**: {context}

## 🔧 Recommended Tools
{recommendedTools}

## 📋 Workflow Plan
{workflowPlan}

## 🚀 Next Actions
{nextActions}

## 📊 Workflow Efficiency
- **Primary Tool**: `{primaryTool}`
- **Coordination**: Tools will coordinate automatically
- **Progress Tracking**: Real-time updates to spec execution logs
- **Error Handling**: Built-in recovery and continuation capabilities

**Pro Tip**: Use the primary tool first - it will coordinate other tools automatically for maximum efficiency.
```

## Worktree Management Prompts

### 1. Worktree Creation Template

**Location**: `src/tools/worktree/create.ts:106-135`

```
✅ **Worktree Created Successfully**

**Spec ID**: {specId}
**Branch**: {branchName}
**Path**: {worktreePath}
**Base Branch**: {baseBranch}
**Session ID**: {sessionId}

## 🔧 Worktree Details
- **Git Status**: Worktree created and ready
- **Environment**: {environmentStatus}
- **Safety**: Backup and rollback enabled

## 🚀 Next Steps
1. Navigate to worktree: `cd "{worktreePath}"`
2. Start implementation: `specgen_build_engineer(specId: "{specId}", mode: "implement")`
3. Check status anytime: `specgen_worktree_status(specId: "{specId}")`

## 📋 Available Commands
- **Status**: `specgen_worktree_status(specId: "{specId}")`
- **Merge**: `specgen_worktree_merge(specId: "{specId}")`
- **Remove**: `specgen_worktree_remove(specId: "{specId}")`

## 💡 Development Tips
- Use `git status` to check local changes
- Commit regularly to track progress
- Use `specgen_worktree_status` for conflict detection
- Run `specgen_worktree_merge` when ready to integrate

**Isolated development environment ready for {specId}!**
```

---

# SECTION 2: TOOLS

## Build Tools

### 1. Architect Tool (`specgen_build_architect`)

**Location**: `src/tools/build/architect.ts`

**Purpose**: Multi-phase feature analysis using sequential thinking patterns

**Input Schema**:
```typescript
{
  specId: string,           // Specification ID
  feature: string,          // Feature description (min 10 chars)
  depth: "shallow" | "deep" | "comprehensive", // Analysis depth (default: "deep")
  autoCreateWorktree: boolean // Auto-create worktree for development (default: false)
}
```

**Example Input**:
```javascript
{
  "specId": "SPEC-20241201-user-authentication",
  "feature": "Implement OAuth2 authentication with JWT tokens for secure user login",
  "depth": "comprehensive",
  "autoCreateWorktree": true
}
```

**Example Output**:
```
🏗️ **Architecture Analysis Complete**

**Feature**: Implement OAuth2 authentication with JWT tokens for secure user login
**Spec ID**: SPEC-20241201-user-authentication
**Analysis Depth**: comprehensive
**Complexity**: high
**Estimated Effort**: 3-5 days

## 📋 Architecture Recommendations:
• Start with database layer if data persistence is needed
• Define API contracts before implementation
• Consider error handling and edge cases
• Plan for testing and validation

## 🔧 Implementation Approach:
1. **Database Layer**: Define data models and persistence
2. **Backend Layer**: Implement business logic and APIs
3. **Frontend Layer**: Create user interface components
4. **Integration Layer**: Connect external services
5. **Testing Layer**: Comprehensive test coverage

## 🚀 Next Steps:
- Use `specgen_build_engineer` to start implementation
- Consider `specgen_worktree_create` for isolated development
- Review existing codebase patterns for consistency

**Architecture analysis ready for implementation planning.**
```

**Stub Code Usage**:
```typescript
// Using the architect tool
const architectResult = await mcp.callTool("specgen_build_architect", {
  specId: "SPEC-20241201-user-auth",
  feature: "Implement secure OAuth2 authentication system",
  depth: "comprehensive",
  autoCreateWorktree: false
});

console.log(architectResult.content[0].text);
```

---

### 2. Engineer Tool (`specgen_build_engineer`)

**Location**: `src/tools/build/engineer.ts`

**Purpose**: Implementation pipeline with debug protocols

**Input Schema**:
```typescript
{
  specId: string,           // Specification ID
  mode: "implement" | "debug" | "continue", // Implementation mode (default: "implement")
  layer: "database" | "backend" | "frontend" | "integration" | "testing" | "all", // Layer (default: "all")
  dryRun: boolean          // Simulate without changes (default: false)
}
```

**Implementation Plans by Layer**:
- **Database**: Review schema, create tables, add indexes, test migrations
- **Backend**: Define APIs, implement logic, add validation, write tests
- **Frontend**: Create components, state management, responsive design, test interactions
- **Integration**: Connect APIs, external services, auth flows, end-to-end testing
- **Testing**: Unit tests, integration coverage, manual testing, requirement validation

**Example Input**:
```javascript
{
  "specId": "SPEC-20241201-user-authentication",
  "mode": "implement",
  "layer": "backend",
  "dryRun": false
}
```

**Example Output**:
```
⚙️ **Engineering Implementation Pipeline**

**Spec ID**: SPEC-20241201-user-authentication
**Mode**: implement
**Layer**: backend
**Dry Run**: false

## 🔧 Implementation Steps for Backend Layer:
1. Define API endpoints and routes
2. Implement business logic
3. Add input validation and error handling
4. Write unit tests for critical paths

## 📋 Implementation Guidelines:
- Follow existing code patterns and conventions
- Write tests before or alongside implementation
- Document complex business logic
- Handle error cases gracefully
- Consider performance and scalability

## 🚨 Implement Mode Instructions:
• Start fresh implementation
• Follow specification requirements
• Implement layer by layer
• Test as you build

## 🚀 Next Steps:
- Use appropriate development tools for your stack
- Run tests frequently during development
- Use `specgen_worktree_status` to track changes
- Review with `specgen_build_reviewer` when complete

**Implementation pipeline ready for execution.**
```

**Stub Code Usage**:
```typescript
// Implementation mode
const engineerResult = await mcp.callTool("specgen_build_engineer", {
  specId: "SPEC-20241201-user-auth",
  mode: "implement",
  layer: "backend",
  dryRun: false
});

// Debug mode
const debugResult = await mcp.callTool("specgen_build_engineer", {
  specId: "SPEC-20241201-user-auth",
  mode: "debug",
  layer: "all",
  dryRun: true
});
```

---

### 3. Reviewer Tool (`specgen_build_reviewer`)

**Location**: `src/tools/build/reviewer.ts`

**Purpose**: Multi-domain code assessment generating improvement specifications

**Input Schema**:
```typescript
{
  specId: string,           // Specification ID
  scope: ("security" | "performance" | "quality" | "architecture")[], // Review scope (default: ["quality"])
  generateImprovementSpec: boolean, // Auto-generate improvement specification (default: false)
  severity: "critical" | "high" | "medium" | "low" | "all" // Minimum severity (default: "medium")
}
```

**Review Criteria by Domain**:

**Security**:
- Check for SQL injection vulnerabilities
- Validate input sanitization
- Review authentication and authorization
- Check for sensitive data exposure
- Validate HTTPS usage and secure headers

**Performance**:
- Review database query optimization
- Check for N+1 query problems
- Validate caching strategies
- Review asset bundling and minification
- Check for memory leaks

**Quality**:
- Review code organization and structure
- Check naming conventions consistency
- Validate error handling patterns
- Review test coverage
- Check for code duplication

**Architecture**:
- Review separation of concerns
- Check architectural pattern adherence
- Validate API design principles
- Review dependency management
- Check scalability considerations

**Example Input**:
```javascript
{
  "specId": "SPEC-20241201-user-authentication",
  "scope": ["security", "performance", "quality"],
  "generateImprovementSpec": true,
  "severity": "high"
}
```

**Example Output**:
```
📋 **Code Review Report**

**Spec ID**: SPEC-20241201-user-authentication
**Review Scope**: security, performance, quality
**Minimum Severity**: high
**Total Findings**: 3

## 🔍 Review Criteria Applied:
• Check for SQL injection vulnerabilities
• Validate input sanitization
• Review authentication and authorization
• Review database query optimization
• Check for N+1 query problems
• Review code organization and structure

## 🚨 Findings by Severity:

### Critical Issues:
✅ No critical issues found

### High Priority Issues:
• Consider adding input validation to API endpoints

### Medium Priority Issues:
✅ No medium priority issues found

### Low Priority Issues:
✅ No low priority issues found

## 📊 Review Summary:
- **Security**: Reviewed ✅
- **Performance**: Reviewed ✅
- **Code Quality**: Reviewed ✅
- **Architecture**: Skipped

## 🎯 Recommendations:
1. Address critical and high priority issues first
2. Consider implementing automated code quality checks
3. Add comprehensive test coverage for new features
4. Regular security audits for production code
5. Document architectural decisions and patterns

## 📝 Improvement Specification:
A new improvement specification would be generated here with detailed action items for each finding.

## 🚀 Next Steps:
- Address findings in order of severity
- Use `specgen_build_engineer` to implement fixes
- Re-run review after improvements
- Consider adding automated checks to prevent future issues

**Code review completed successfully.**
```

**Stub Code Usage**:
```typescript
// Comprehensive review
const reviewResult = await mcp.callTool("specgen_build_reviewer", {
  specId: "SPEC-20241201-user-auth",
  scope: ["security", "performance", "quality", "architecture"],
  generateImprovementSpec: true,
  severity: "medium"
});

// Security-focused review
const securityReview = await mcp.callTool("specgen_build_reviewer", {
  specId: "SPEC-20241201-user-auth",
  scope: ["security"],
  generateImprovementSpec: false,
  severity: "critical"
});
```

---

## Research Tools

### 1. Analyze Tool (`specgen_research_analyze`)

**Location**: `src/tools/research/analyze.ts`

**Purpose**: Language-agnostic codebase analysis using tree-sitter parsing

**Input Schema**:
```typescript
{
  paths: string[],          // File/directory paths to analyze
  language?: "typescript" | "python" | "go" | "rust" | "javascript" | "auto", // Target language
  extractSymbols?: boolean, // Extract symbol information
  findPatterns?: string[],  // Patterns to search for
  includeTests?: boolean    // Include test files
}
```

**Example Input**:
```javascript
{
  "paths": ["src/auth", "src/middleware"],
  "language": "typescript",
  "extractSymbols": true,
  "findPatterns": ["authenticate", "authorize", "jwt"],
  "includeTests": false
}
```

**Example Output**:
```
🔍 Code Analysis Results:

📁 Files Analyzed: 15
📏 Total Lines: 2,847

🏗️ Symbol Summary:
• Functions: 42
• Classes: 8
• Imports: 67
• Other: 15

🔤 Language Breakdown:
• typescript: 15 files

🔍 Pattern Matches: 23

💡 Analysis completed successfully. Use specgen_research_search for targeted symbol queries.

📊 Performance: Analysis completed in real-time
```

**Stub Code Usage**:
```typescript
// Analyze specific directories
const analysisResult = await mcp.callTool("specgen_research_analyze", {
  paths: ["src/components", "src/hooks"],
  language: "typescript",
  extractSymbols: true,
  findPatterns: ["useState", "useEffect"],
  includeTests: true
});

// Auto-detect language analysis
const autoAnalysis = await mcp.callTool("specgen_research_analyze", {
  paths: ["src"],
  language: "auto",
  extractSymbols: true,
  includeTests: false
});
```

---

### 2. Search Tool (`specgen_research_search`)

**Location**: `src/tools/research/search.ts`

**Purpose**: Semantic code search across languages using AST queries

**Input Schema**:
```typescript
{
  query: string,            // Search query (min 3 chars)
  scope?: "symbols" | "imports" | "patterns" | "all", // Search scope (default: "all")
  language?: string,        // Target language (optional)
  maxResults?: number,      // Maximum results (1-100, default: 100)
  includeContext?: boolean  // Include code context (default: false)
}
```

**Example Input**:
```javascript
{
  "query": "authenticate",
  "scope": "symbols",
  "language": "typescript",
  "maxResults": 10,
  "includeContext": true
}
```

**Example Output**:
```
🔍 Search Results for "authenticate":

🎯 Query: "authenticate" (scope: symbols)
📁 Files searched: 156
📄 Files with matches: 8
🔗 Total matches: 23

🏆 Top Results:

• src/auth/authentication.ts (5 matches)
  Line 42: export function authenticate(token: string): User | null {

• src/middleware/auth.middleware.ts (3 matches)
  Line 15: const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {

• src/components/Login.tsx (2 matches)
  Line 28: const handleAuthenticate = useCallback(() => {

• src/services/auth.service.ts (4 matches)
  Line 67: async authenticateWithProvider(provider: OAuthProvider): Promise<AuthResult> {

• src/types/auth.types.ts (1 match)
  Line 12: authenticate: (credentials: LoginCredentials) => Promise<AuthResult>;

💡 Use specgen_research_analyze for deeper symbol analysis

📊 Performance: Search completed across 156 files
```

**Stub Code Usage**:
```typescript
// Symbol-focused search
const symbolSearch = await mcp.callTool("specgen_research_search", {
  query: "useState",
  scope: "symbols",
  language: "typescript",
  maxResults: 20,
  includeContext: true
});

// Pattern search with context
const patternSearch = await mcp.callTool("specgen_research_search", {
  query: "api/auth",
  scope: "patterns",
  maxResults: 15,
  includeContext: false
});
```

---

### 3. Fetch Tool (`specgen_research_fetch`)

**Location**: `src/tools/research/fetch.ts`

**Purpose**: Web documentation and API reference gathering with intelligent caching

**Input Schema**:
```typescript
{
  topics: string[],         // Research topics (min 1)
  depth?: "quick" | "thorough" | "comprehensive", // Research depth (default: "quick")
  maxPages?: number,        // Maximum pages to fetch (1-50, default: 10)
  sources?: string[]        // Preferred sources (optional)
}
```

**Example Input**:
```javascript
{
  "topics": ["OAuth2 implementation", "JWT token security", "Next.js authentication"],
  "depth": "thorough",
  "maxPages": 20,
  "sources": ["docs", "github", "stackoverflow"]
}
```

**Example Output**:
```
📚 Research Results for: OAuth2 implementation, JWT token security, Next.js authentication

🎯 Topics: OAuth2 implementation, JWT token security, Next.js authentication
🔍 Queries generated: 9
📄 Pages fetched: 18
📊 Unique results: 15

🏆 Top Results:

• Next.js 14 App Router Documentation
  Source: docs | Relevance: 95%
  The App Router is a new paradigm for building applications using React Server Components...
  URL: https://nextjs.org/docs/app

• OAuth2 Security Best Practices
  Source: docs | Relevance: 92%
  Comprehensive guide to implementing secure OAuth2 flows with proper token handling...
  URL: https://oauth.net/2/security-best-practices/

• JWT Implementation Guide
  Source: github | Relevance: 88%
  Step-by-step implementation of JWT tokens with refresh token rotation...
  URL: https://github.com/auth0/node-jsonwebtoken

• React Authentication Patterns
  Source: medium | Relevance: 85%
  Modern authentication patterns for React applications including hooks and context...
  URL: https://medium.com/@auth/react-authentication-patterns

• TypeScript OAuth2 Client
  Source: github | Relevance: 82%
  TypeScript implementation of OAuth2 client with full type safety...
  URL: https://github.com/panva/oauth4webapi

... and 10 more results

💡 Results are cached for 24 hours. Use different topics for broader research.

📊 Performance: Fetched 18 pages from 3 sources
```

**Stub Code Usage**:
```typescript
// Comprehensive research
const researchResult = await mcp.callTool("specgen_research_fetch", {
  topics: ["React hooks", "TypeScript patterns", "API design"],
  depth: "comprehensive",
  maxPages: 30,
  sources: ["docs", "github", "dev.to"]
});

// Quick reference lookup
const quickLookup = await mcp.callTool("specgen_research_fetch", {
  topics: ["Express.js middleware"],
  depth: "quick",
  maxPages: 5
});
```

---

### 4. Dependencies Tool (`specgen_research_dependencies`)

**Location**: `src/tools/research/dependencies.ts`

**Purpose**: Project dependency analysis with cross-language mapping

**Input Schema**:
```typescript
{
  language?: string,        // Target language (optional)
  checkOutdated?: boolean,  // Check for outdated packages (default: false)
  includeTransitive?: boolean // Include transitive dependencies (default: false)
}
```

**Example Input**:
```javascript
{
  "language": "typescript",
  "checkOutdated": true,
  "includeTransitive": true
}
```

**Example Output**:
```
📦 Dependency Analysis:

🏗️ Project Types: nodejs
📦 Total Dependencies: 127

📊 By Package Manager:
• npm: 127

🎯 By Scope:
• runtime: 89
• development: 32
• peer: 6

🚨 Security Issues: 2
• node-sass@4.14.1: Known security vulnerability
• event-stream@3.3.6: Known security vulnerability

📅 Outdated Packages: 15
• react: ^17.0.2 → latest
• typescript: ~4.5.0 → latest
• @types/node: ^16.11.7 → latest
... and 12 more

⚡ Version Conflicts: 1
• @types/react: 17.0.45 vs 18.0.12

💡 Use package manager commands to update outdated dependencies and resolve conflicts.

📊 Performance: Analysis completed in real-time
```

**Stub Code Usage**:
```typescript
// Full dependency analysis
const depsResult = await mcp.callTool("specgen_research_dependencies", {
  language: "typescript",
  checkOutdated: true,
  includeTransitive: true
});

// Security-focused check
const securityCheck = await mcp.callTool("specgen_research_dependencies", {
  checkOutdated: false,
  includeTransitive: false
});

// Python dependencies
const pythonDeps = await mcp.callTool("specgen_research_dependencies", {
  language: "python",
  checkOutdated: true,
  includeTransitive: false
});
```

---

## Spec Management Tools

### 1. Create Tool (`specgen_spec_create`)

**Location**: `src/tools/spec/create.ts`

**Purpose**: Create new SPEC document with auto-generated metadata

**Input Schema**:
```typescript
{
  title: string,            // Specification title (5-100 chars)
  description: string,      // Feature description (min 10 chars)
  category?: "Architecture" | "Feature" | "Bugfix" | "Research", // Spec category (default: "Feature")
  createWorktree?: boolean, // Create isolated worktree (default: false)
  baseBranch?: string      // Base branch for worktree (default: "main")
}
```

**Example Input**:
```javascript
{
  "title": "OAuth2 Authentication System",
  "description": "Implement a secure OAuth2 authentication system with JWT tokens, refresh token rotation, and multi-provider support for enterprise users",
  "category": "Feature",
  "createWorktree": true,
  "baseBranch": "develop"
}
```

**Example Output**:
```
✅ **Specification Created Successfully**

**Spec ID**: SPEC-20241201-oauth2-authentication-system
**File**: SPEC-20241201-oauth2-authentication-system.md
**Category**: Feature
**Status**: draft
**Path**: /docs/SPEC-20241201-oauth2-authentication-system.md

**Metadata**:
- Priority: medium
- Effort Estimate: 1-2 days
- Created: 2024-12-01T10:30:00.000Z
- Completion: 0%

**Worktree**: Requested but not yet implemented

**Next Steps**:
1. Edit the specification content in SPEC-20241201-oauth2-authentication-system.md
2. Use `specgen_spec_orchestrate` to get recommended next actions
3. Run `mcp__specgen-mcp__refresh_metadata` to update the registry
4. Use `specgen_worktree_create` to set up isolated development environment

The specification template has been created with standard sections. You can now start filling in the details for your feature specification.
```

**Stub Code Usage**:
```typescript
// Create new feature spec
const createResult = await mcp.callTool("specgen_spec_create", {
  title: "Real-time Chat System",
  description: "Build a real-time chat system with WebSocket support, message persistence, and typing indicators",
  category: "Feature",
  createWorktree: true,
  baseBranch: "main"
});

// Create architecture spec
const archSpec = await mcp.callTool("specgen_spec_create", {
  title: "Microservices Migration Strategy",
  description: "Plan and execute migration from monolithic architecture to microservices",
  category: "Architecture",
  createWorktree: false
});
```

---

### 2. Orchestrate Tool (`specgen_spec_orchestrate`)

**Location**: `src/tools/spec/orchestrate.ts`

**Purpose**: Smart orchestrator that determines next actions based on spec status

**Input Schema**:
```typescript
{
  specId: string,           // Specification ID
  intent: "analyze" | "implement" | "review" | "deploy", // User intent
  context?: string          // Additional context (optional)
}
```

**Example Input**:
```javascript
{
  "specId": "SPEC-20241201-oauth2-authentication-system",
  "intent": "implement",
  "context": "Ready to start backend implementation first"
}
```

**Example Output**:
```
🎯 **Workflow Orchestration for SPEC-20241201-oauth2-authentication-system**

**Intent**: IMPLEMENT
**Status**: draft
**Category**: Feature
**Completion**: 0%

**Context**: Ready to start backend implementation first

## 🔧 Recommended Tools
- `specgen_build_engineer`

## 📋 Workflow Plan

### Implementation Setup
- **Description**: Set up implementation environment and begin coding
- **Tools**: `specgen_build_engineer`, `specgen_worktree_create`
- **Estimated Time**: 2-4 hours

## 🚀 Next Actions
1. Context: Ready to start backend implementation first
2. Run: specgen_worktree_create(specId: "SPEC-20241201-oauth2-authentication-system", autoSetup: true)
3. Then: specgen_build_engineer(specId: "SPEC-20241201-oauth2-authentication-system", mode: "implement")
4. Engineer tool will coordinate layer-by-layer implementation

## 📊 Workflow Efficiency
- **Primary Tool**: `specgen_build_engineer`
- **Coordination**: Tools will coordinate automatically
- **Progress Tracking**: Real-time updates to spec execution logs
- **Error Handling**: Built-in recovery and continuation capabilities

**Pro Tip**: Use the primary tool first - it will coordinate other tools automatically for maximum efficiency.
```

**Stub Code Usage**:
```typescript
// Orchestrate for analysis
const analyzeOrchestration = await mcp.callTool("specgen_spec_orchestrate", {
  specId: "SPEC-20241201-oauth2-auth",
  intent: "analyze",
  context: "Need to understand existing authentication patterns"
});

// Orchestrate for implementation
const implementOrchestration = await mcp.callTool("specgen_spec_orchestrate", {
  specId: "SPEC-20241201-oauth2-auth",
  intent: "implement",
  context: "Architecture analysis complete, ready to code"
});

// Orchestrate for review
const reviewOrchestration = await mcp.callTool("specgen_spec_orchestrate", {
  specId: "SPEC-20241201-oauth2-auth",
  intent: "review"
});
```

---

## Worktree Tools

### 1. Create Tool (`specgen_worktree_create`)

**Location**: `src/tools/worktree/create.ts`

**Purpose**: Create isolated git worktree for spec development

**Input Schema**:
```typescript
{
  specId: string,           // Specification ID
  baseBranch?: string,      // Base branch for worktree (default: "main")
  branchName?: string,      // Branch name (auto-generated if not provided)
  autoSetup?: boolean,      // Auto-configure worktree environment (default: true)
  preserveOnError?: boolean // Preserve worktree on creation errors (default: true)
}
```

**Example Input**:
```javascript
{
  "specId": "SPEC-20241201-oauth2-authentication-system",
  "baseBranch": "develop",
  "branchName": "feature/oauth2-auth-implementation",
  "autoSetup": true,
  "preserveOnError": true
}
```

**Stub Code Usage**:
```typescript
// Create worktree with auto-setup
const worktreeResult = await mcp.callTool("specgen_worktree_create", {
  specId: "SPEC-20241201-oauth2-auth",
  baseBranch: "main",
  autoSetup: true,
  preserveOnError: true
});

// Create worktree with custom branch name
const customWorktree = await mcp.callTool("specgen_worktree_create", {
  specId: "SPEC-20241201-chat-system",
  baseBranch: "develop",
  branchName: "feature/websocket-chat",
  autoSetup: true
});
```

### 2. List Tool (`specgen_worktree_list`)
**Location**: `src/tools/worktree/list.ts`

### 3. Status Tool (`specgen_worktree_status`)
**Location**: `src/tools/worktree/status.ts`

### 4. Merge Tool (`specgen_worktree_merge`)
**Location**: `src/tools/worktree/merge.ts`

### 5. Remove Tool (`specgen_worktree_remove`)
**Location**: `src/tools/worktree/remove.ts`

### 6. Prune Tool (`specgen_worktree_prune`)
**Location**: `src/tools/worktree/prune.ts`

---

## JSON Tools

### 1. Create Spec JSON (`mcp__specgen-mcp__create_spec_json`)
**Location**: `src/tools/json/create-spec-json.ts`

### 2. Update Spec Section (`mcp__specgen-mcp__update_spec_section`)
**Location**: `src/tools/json/update-spec-section.ts`

### 3. Get Spec JSON (`mcp__specgen-mcp__get_spec_json`)
**Location**: `src/tools/json/get-spec-json.ts`

### 4. Sync Spec Formats (`mcp__specgen-mcp__sync_spec_formats`)
**Location**: `src/tools/json/sync-spec-formats.ts`

---

## Metadata Tools

### 1. List Specs (`mcp__specgen-mcp__list_specs`)
**Location**: `src/tools/json/list-specs.ts`

### 2. Get Spec (`mcp__specgen-mcp__get_spec`)
**Location**: `src/tools/json/get-spec.ts`

### 3. Search Specs (`mcp__specgen-mcp__search_specs`)
**Location**: `src/tools/json/search-specs.ts`

### 4. Refresh Metadata (`mcp__specgen-mcp__refresh_metadata`)
**Location**: `src/tools/json/refresh-metadata.ts`

### 5. Launch Dashboard (`mcp__specgen-mcp__launch_dashboard`)
**Location**: `src/tools/json/launch-dashboard.ts`

---

## Usage Patterns

### 1. Complete Feature Development Workflow

```typescript
// 1. Create specification
const spec = await mcp.callTool("specgen_spec_create", {
  title: "User Profile Management",
  description: "Comprehensive user profile system with avatar upload, preferences, and privacy settings",
  category: "Feature",
  createWorktree: true
});

// 2. Get workflow recommendations
const orchestration = await mcp.callTool("specgen_spec_orchestrate", {
  specId: spec.specId,
  intent: "analyze"
});

// 3. Perform architecture analysis
const architecture = await mcp.callTool("specgen_build_architect", {
  specId: spec.specId,
  feature: "User profile system with avatar upload and privacy controls",
  depth: "comprehensive",
  autoCreateWorktree: false
});

// 4. Create development environment
const worktree = await mcp.callTool("specgen_worktree_create", {
  specId: spec.specId,
  autoSetup: true
});

// 5. Start implementation
const implementation = await mcp.callTool("specgen_build_engineer", {
  specId: spec.specId,
  mode: "implement",
  layer: "all",
  dryRun: false
});

// 6. Review implementation
const review = await mcp.callTool("specgen_build_reviewer", {
  specId: spec.specId,
  scope: ["security", "performance", "quality"],
  generateImprovementSpec: true,
  severity: "medium"
});

// 7. Deploy changes
const deployment = await mcp.callTool("specgen_worktree_merge", {
  specId: spec.specId,
  createPR: true,
  removeAfterMerge: true
});
```

### 2. Research and Analysis Workflow

```typescript
// 1. Analyze existing codebase
const codeAnalysis = await mcp.callTool("specgen_research_analyze", {
  paths: ["src/auth", "src/users"],
  language: "typescript",
  extractSymbols: true,
  findPatterns: ["authenticate", "authorize"],
  includeTests: true
});

// 2. Search for specific patterns
const searchResults = await mcp.callTool("specgen_research_search", {
  query: "user management",
  scope: "symbols",
  language: "typescript",
  maxResults: 20,
  includeContext: true
});

// 3. Research external documentation
const research = await mcp.callTool("specgen_research_fetch", {
  topics: ["Next.js authentication", "React user management", "TypeScript patterns"],
  depth: "thorough",
  maxPages: 25,
  sources: ["docs", "github"]
});

// 4. Analyze dependencies
const dependencies = await mcp.callTool("specgen_research_dependencies", {
  language: "typescript",
  checkOutdated: true,
  includeTransitive: true
});
```

### 3. Debugging and Maintenance Workflow

```typescript
// 1. Start debug mode
const debugSession = await mcp.callTool("specgen_build_engineer", {
  specId: "SPEC-20241201-user-profiles",
  mode: "debug",
  layer: "backend",
  dryRun: false
});

// 2. Search for specific issues
const issueSearch = await mcp.callTool("specgen_research_search", {
  query: "error handling",
  scope: "patterns",
  maxResults: 15,
  includeContext: true
});

// 3. Continue implementation after debugging
const continueImpl = await mcp.callTool("specgen_build_engineer", {
  specId: "SPEC-20241201-user-profiles",
  mode: "continue",
  layer: "all",
  dryRun: false
});
```

## Error Handling

All tools include comprehensive error handling with structured error responses:

```typescript
// Example error response structure
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "❌ **Error in specgen_build_architect**\n\n**Type**: validation_error\n**Message**: Specification 'invalid-spec' not found\n\n**Suggestions**:\n• Use list_specs to see available specifications\n• Check specification ID spelling\n• Ensure specification exists\n\n**Recovery**: Correct the specId parameter and try again"
  }]
}
```

## Performance and Caching

- **Tree-sitter Analysis**: Cached for 1 hour
- **Search Results**: Cached for 30 minutes
- **Web Research**: Cached for 24 hours
- **Dependency Analysis**: Cached for 2 hours

## Notes

- **No Separate Debugger Tool**: Debugging functionality is integrated into the Engineer tool via the `mode` parameter
- **Embedded Prompts**: All prompts are hardcoded as template strings within the TypeScript implementations
- **Template Variables**: Prompts use placeholders like `{specId}`, `{feature}`, etc., that get replaced at runtime
- **Consistent Structure**: All tools follow similar patterns with validation, error handling, and structured output
- **Automatic Coordination**: Tools automatically coordinate with each other when appropriate (e.g., architect coordinates research tools)
- **Worktree Safety**: All worktree operations include safety checks and rollback capabilities
- **Metadata Sync**: Changes automatically sync between JSON and Markdown formats