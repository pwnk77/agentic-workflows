# Claude Code Burst Mode

*🚀 **New Story-Driven Learning Path**: Experience Claude Code through narrative examples and real-world scenarios in our enhanced guides:*
- *📖 [From Brain Dump to Production: Sara's Journey](claude-code-story-driven-introduction.md) - See architect and engineer modes in action*
- *🎯 [Progressive Examples](claude-code-architect-narrative-examples.md) - From simple features to enterprise systems*  
- *🔧 [Engineer Mastery](claude-code-engineer-debug-integration.md) - Implementation workflows and debug patterns*
- *⚡ [Hook System Intelligence](claude-code-hook-system-mastery.md) - Advanced monitoring and session tracking*

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

---

## Learning Path Navigator 🧭

**Choose your experience level to get started with the right guide:**

### 🌱 **New to Claude Code** 
*"I want to understand how Claude Code transforms development workflows"*

**Start Here:** [Sara's Authentication Journey](claude-code-story-driven-introduction.md)
- See architect and engineer modes in action through a complete real-world example
- Understand the brain-dump to production workflow
- Experience systematic planning and implementation

**Time Investment:** 15-20 minutes reading
**Outcome:** Clear understanding of Claude Code's core value proposition

---

### 🎯 **Ready to Practice**
*"I understand the basics and want to see different complexity levels"*

**Continue With:** [Progressive Architect Examples](claude-code-architect-narrative-examples.md)
- Jordan's simple feature (comment system)
- Sara's medium complexity (billing system) 
- Alex's enterprise scale (notification system)

**Time Investment:** 30-40 minutes reading + hands-on practice
**Outcome:** Confidence to tackle features at your complexity level

---

### 🔧 **Implementation Focused**
*"I want to master systematic implementation and debugging"*

**Dive Into:** [Engineer Workflow Mastery](claude-code-engineer-debug-integration.md)
- Layer-by-layer implementation strategies
- Debug mode for systematic problem solving
- Integration with testing and quality assurance

**Time Investment:** 45-60 minutes study + practice sessions
**Outcome:** Expertise in systematic feature implementation

---

### ⚡ **Advanced Optimization**
*"I want to leverage the full power of intelligent monitoring"*

**Explore:** [Hook System Intelligence](claude-code-hook-system-mastery.md)
- AI-powered session summaries and learning
- Real-time monitoring and feedback systems
- Advanced debugging and pattern recognition

**Time Investment:** 60+ minutes setup + ongoing optimization
**Outcome:** Intelligent development environment that learns from your patterns

---

### 🏢 **Team & Enterprise**
*"I need to scale Claude Code across teams and complex projects"*

**Scale With:** [Enterprise Patterns & Workflows](claude-code-enterprise-patterns.md)
- Multi-service architecture patterns
- Team collaboration strategies
- Compliance and audit workflows

**Time Investment:** Multiple sessions + team coordination
**Outcome:** Organization-wide Claude Code adoption and optimization

---

## Quick Reference by Use Case 📋

### "I need to build a specific feature"
1. **Simple Addition** → [Jordan's Examples](claude-code-architect-narrative-examples.md#example-1-jordans-journey---simple-feature-addition)
2. **System Integration** → [Sara's Billing System](claude-code-architect-narrative-examples.md#example-2-saras-challenge---medium-complexity-integration)
3. **Enterprise Architecture** → [Alex's Notification System](claude-code-architect-narrative-examples.md#example-3-alexs-enterprise-challenge---multi-service-architecture)

### "I'm hitting errors and need debugging help"
1. **Systematic Debug Process** → [Engineer Debug Integration](claude-code-engineer-debug-integration.md#part-2-when-things-go-wrong---debug-mode)
2. **Complex Issue Resolution** → [Unified Debug Workflow](claude-code-unified-debug-workflow.md)
3. **Common Error Patterns** → [Troubleshooting Cookbook](claude-code-troubleshooting-cookbook.md)

### "I want to optimize my development workflow"
1. **Session Intelligence** → [Hook System Setup](claude-code-hook-system-mastery.md#part-2-setting-up-your-hook-system)
2. **Advanced Monitoring** → [Hook Patterns](claude-code-hook-system-mastery.md#part-3-advanced-hook-patterns)
3. **Team Collaboration** → [Enterprise Workflows](claude-code-enterprise-patterns.md)

---

## Skill Progression Badges 🎖️

Track your Claude Code mastery:

- 🥉 **Beginner**: Completed Sara's Journey guide
- 🥈 **Practitioner**: Successfully used architect → engineer workflow for real feature
- 🥇 **Advanced**: Implemented hook system with intelligent monitoring
- 💎 **Expert**: Scaled Claude Code across team with enterprise patterns
- 🏆 **Master**: Contributed improvements to Claude Code workflows

---