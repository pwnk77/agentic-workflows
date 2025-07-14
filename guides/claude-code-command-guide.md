# Claude Code Burst Mode

Burst Mode is a comprehensive two-phase development workflow that combines architectural planning with systematic implementation for complex software features.

## Overview

Burst Mode consists of two specialized AI agents working in sequence:

1. **@architect.md** - Plan Mode: Deep analysis and specification generation
2. **@engineer.md** - Implementation Mode: Systematic code execution and logging

## Phase 1: Architect Mode (@architect.md)

**Purpose**: Analyze feature requests, explore codebases, and generate detailed technical specifications.

### Available Commands

```bash
# Basic usage - triggers requirement analysis and spec generation
@architect.md [feature description]
```

### Process Flow

#### 1. Requirement Crystallization
- Deep analysis of feature requirements
- Iterative clarification (max 5 questions per cycle)
- Target: >95% confidence before proceeding

#### 2. Multi-Perspective Codebase Exploration
Deploys 5 parallel research agents:
- **Agent 1**: Backend Architecture Analysis
- **Agent 2**: Database Schema Analysis  
- **Agent 3**: Frontend Architecture Analysis
- **Agent 4**: Integration Analysis
- **Agent 5**: External Research (optional)

#### 3. Refinement and Finalization
- Validation protocol execution
- Feature breakdown summary
- Dependency mapping

#### 4. Specification Generation
Creates detailed SPEC files with structure:
- Executive Summary
- Product Specifications
- Technical Specifications
- Implementation Plan
- Success Metrics

### Output
Generates specification files in format: `docs/SPEC-YYYYMMDD-[feature-name].md`

## Phase 2: Engineer Mode (@engineer.md)

**Purpose**: Execute specifications through systematic implementation and logging.

### Available Commands

```bash
# Implementation mode (default)
@engineer.md spec_file_path

# Debug mode
@engineer.md spec_file_path debug "issue description"
```

### Implementation Mode

#### Process Flow

1. **Specification Analysis**
   - Loads spec file
   - Creates todo list from implementation plan
   - Analyzes existing code patterns

2. **Layer-by-Layer Execution**
   - Sequential execution by layer (Database → Backend → Frontend → Integration → Testing)
   - Task-by-task implementation within each layer
   - Automatic failure handling with execution stops

3. **Progress Logging**
   - Appends completion logs to spec file
   - Tracks timestamps and task status
   - Documents layer summaries

4. **Session Completion**
   - Final summary of all completed work

#### Task Categories
- **DB-XXX**: Database migrations and schema changes
- **BE-XXX**: Backend service implementations
- **API-XXX**: API endpoint development
- **FE-XXX**: Frontend component creation
- **INT-XXX**: External integrations
- **TEST-XXX**: Unit, integration, and E2E testing

### Debug Mode

#### Process Flow

1. **Debug Context Loading**
   - Loads full spec with execution logs
   - Identifies failure points

2. **Root Cause Analysis**
   - Analyzes error patterns
   - Generates fix hypotheses
   - Evidence gathering

3. **Fix Implementation**
   - Proposes solutions
   - Implements approved fixes

4. **Debug Logging**
   - Documents debug sessions
   - Records resolution status

## Usage Examples

### Complete Feature Development

```bash
# Step 1: Generate specification
@architect.md "Add user authentication with social login support"

# Step 2: Implement the specification
@engineer.md docs/SPEC-20240126-user-authentication.md

# Step 3: Debug if needed
@engineer.md docs/SPEC-20240126-user-authentication.md debug "OAuth integration failing with 401 error"
```

### Key Features

- **Systematic Planning**: Comprehensive requirement analysis before coding
- **Parallel Research**: Multiple agents analyze different aspects simultaneously  
- **Sequential Implementation**: Layer-by-layer execution prevents breaking changes
- **Built-in Logging**: Automatic progress tracking and debugging support
- **Error Recovery**: Structured debug mode for issue resolution

## File Outputs

### Architect Mode
- Specification documents: `docs/SPEC-YYYYMMDD-[feature].md`
- Multiple specs for complex features

### Engineer Mode
- Execution logs appended to spec files
- Debug session documentation
- Implementation status tracking

## Best Practices

1. **Use Architect First**: Always generate specifications before implementation
2. **Single Feature Focus**: Each spec should cover one cohesive feature
3. **Layer Completion**: Complete all tasks in a layer before moving to next
4. **Debug Systematically**: Use debug mode for systematic issue resolution
5. **Track Progress**: Review execution logs for project status

This burst mode approach ensures thorough planning, systematic implementation, and comprehensive documentation for complex software development tasks.