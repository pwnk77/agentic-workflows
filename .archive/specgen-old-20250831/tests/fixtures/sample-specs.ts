/**
 * Sample SPEC files for testing
 */

export const SAMPLE_SPEC_DRAFT = `# SPEC-2025-01-15-user-auth

## Executive Summary
**Feature**: User Authentication System
**Impact**: Secure user access and session management
**Status**: Draft

## Product Specifications

### Elevator Pitch
A comprehensive user authentication system with email/password and OAuth integration.

### Functional Requirements
- **FR-001**: User registration with email verification
- **FR-002**: Login with email/password
- **FR-003**: OAuth integration (Google, GitHub)

## Implementation Plan
- Database schema design
- Authentication middleware
- Session management
`;

export const SAMPLE_SPEC_TODO = `# SPEC-2025-01-20-payment-system

## Executive Summary
**Feature**: Payment Processing System
**Impact**: Enable e-commerce transactions
**Status**: TODO

## Product Specifications

### Core Goals
1. **Security**: PCI DSS compliance
2. **Performance**: <2s transaction processing
3. **Scale**: Support 1000+ concurrent transactions

## Implementation Plan
- [ ] Payment gateway integration
- [ ] Transaction logging
- [ ] Refund processing
- [ ] Webhook handling

### Task Breakdown
- Setup Stripe SDK
- Create payment models
- Implement checkout flow
`;

export const SAMPLE_SPEC_IN_PROGRESS = `# SPEC-2025-01-25-notification-system

## Executive Summary
**Feature**: Real-time Notification System
**Impact**: User engagement and communication
**Status**: In Progress

Currently implementing the WebSocket connection handler.

## Implementation Status
- ✅ Database schema completed
- 🔄 WebSocket server implementation in progress
- ⏳ Email notification service pending

Working on the real-time delivery mechanism.
`;

export const SAMPLE_SPEC_DONE = `# SPEC-2025-01-10-database-setup

## Executive Summary
**Feature**: Database Configuration and Migrations
**Impact**: Core data infrastructure
**Status**: ✅ Completed

## Implementation Plan
All tasks completed successfully:
- ✅ PostgreSQL setup
- ✅ Migration system
- ✅ Seed data scripts

## Execution Log

### Database Layer Completed
- **Status**: Completed
- **Timestamp**: 2025-01-10 15:30:00
- Successfully implemented all database requirements

Feature complete and deployed to production.
`;

export const SAMPLE_SPEC_SPECGEN = `# SPEC-2025-01-30-specgen-improvements

## Executive Summary
**Feature**: SpecGen MCP Enhancements
**Impact**: Better spec management workflow

This specification covers improvements to the SpecGen system itself.

## Product Specifications
- Enhanced search capabilities
- Better import parsing
- CLI improvements
`;

export const SAMPLE_SPEC_LEARNING = `# SPEC-2025-02-01-api-research

## Executive Summary
**Feature**: API Design Pattern Research
**Impact**: Knowledge base for better architecture decisions

## Research Goals
1. **Documentation**: Best practices for REST API design
2. **Learning**: GraphQL vs REST analysis
3. **Knowledge**: Security patterns research

This is a research and learning specification.
`;

export const SAMPLE_SPEC_REPOSITORY = `# SPEC-2025-02-05-git-workflow

## Executive Summary
**Feature**: Git Workflow Optimization
**Impact**: Better version control and collaboration

## Specifications
- Branch naming conventions
- Pull request templates
- Git hooks setup
- Repository structure guidelines

This covers our codebase and repository management.
`;

/**
 * Sample spec files with their expected metadata
 */
export const SAMPLE_SPECS = [
  {
    filename: 'SPEC-2025-01-15-user-auth.md',
    content: SAMPLE_SPEC_DRAFT,
    expected: {
      title: 'SPEC-2025-01-15-user-auth',
      status: 'draft' as const,
      feature_group: '2025-01'
    }
  },
  {
    filename: 'SPEC-2025-01-20-payment-system.md',
    content: SAMPLE_SPEC_TODO,
    expected: {
      title: 'SPEC-2025-01-20-payment-system',
      status: 'todo' as const,
      feature_group: '2025-01'
    }
  },
  {
    filename: 'SPEC-2025-01-25-notification-system.md',
    content: SAMPLE_SPEC_IN_PROGRESS,
    expected: {
      title: 'SPEC-2025-01-25-notification-system',
      status: 'in-progress' as const,
      feature_group: '2025-01'
    }
  },
  {
    filename: 'SPEC-2025-01-10-database-setup.md',
    content: SAMPLE_SPEC_DONE,
    expected: {
      title: 'SPEC-2025-01-10-database-setup',
      status: 'done' as const,
      feature_group: '2025-01'
    }
  },
  {
    filename: 'SPEC-2025-01-30-specgen-improvements.md',
    content: SAMPLE_SPEC_SPECGEN,
    expected: {
      title: 'SPEC-2025-01-30-specgen-improvements',
      status: 'draft' as const,
      feature_group: 'specgen'
    }
  },
  {
    filename: 'SPEC-2025-02-01-api-research.md',
    content: SAMPLE_SPEC_LEARNING,
    expected: {
      title: 'SPEC-2025-02-01-api-research',
      status: 'draft' as const,
      feature_group: 'learning'
    }
  },
  {
    filename: 'SPEC-2025-02-05-git-workflow.md',
    content: SAMPLE_SPEC_REPOSITORY,
    expected: {
      title: 'SPEC-2025-02-05-git-workflow',
      status: 'draft' as const,
      feature_group: 'repository'
    }
  }
];