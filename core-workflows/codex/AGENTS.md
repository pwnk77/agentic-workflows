# AGENTS.md – Universal Codex Workflow Configuration

## Overview
This configuration defines how Codex CLI agents operate for structured software development.  
It introduces modes for **Architecture**, **Implementation**, **Review**, **Automation**, and **Plugins**, each with systematic workflows, context management, and error handling.  

The approach is **programming-language agnostic**: each mode starts with **stack detection** (Python, JavaScript, TypeScript, Go, Java, PHP, etc.) and adapts strategies accordingly.

---

## Project Structure
project/
├── src/ # Source code
├── tests/ # Unit + integration tests (≥80% coverage)
├── docs/ # Specifications and architecture docs
├── config/ # Configuration and environment files
├── scripts/ # Automation and DevOps scripts
├── plugins/ # Plugin modules and extensions
└── AGENTS.md # Workflow configuration

yaml
Copy code

---

## Coding Standards
- Follow official style guides for the chosen language.  
- Use clear, descriptive naming conventions.  
- Write self-documenting code with concise comments.  
- Document all public APIs and interfaces.  
- Maintain consistent formatting and indentation.  
- Prefer clarity over cleverness.  

---

## Modes

### 1. ARCHITECT
**Trigger:** `ARCHITECT: [feature]`  
**Output:** Specification in `docs/SPEC-[date]-[feature].md`

Checklist:
- **Requirement Crystallization**  
  - Clarify business goals, success criteria, and non-goals.  
  - Identify edge cases, security, privacy, and compliance implications.  
- **Architecture Exploration**  
  - Detect stack and analyze existing conventions.  
  - Evaluate database, backend, frontend, integrations, infrastructure.  
- **Specification Creation**  
  - Generate SPEC document using the provided template.  
  - Ensure success criteria and risks are explicitly captured.  

---

### 2. ENGINEER
**Trigger:** `ENGINEER: [spec-file-or-description]`  
**Output:** Implementation + execution logs

Checklist:
- Parse the SPEC document and break it into sequenced tasks.  
- Detect stack and align with existing project conventions.  
- Execute tasks layer by layer:  
  - Database → Backend → Frontend → Integration → Testing.  
- Write tests alongside implementation.  
- Maintain **Execution Logs** inside the SPEC file.  
- Debug systematically:  
  1. Analyze error, add diagnostics  
  2. Hypothesize + validate root cause  
  3. Apply minimal fix with rollback if needed  
  4. Document findings in `## Debug Logs`  

---

### 3. REVIEWER
**Trigger:** `REVIEWER: [code-or-feature]`  
**Output:** Prioritized improvement report

Checklist:
- **Quality**: readability, maintainability, documentation, test coverage.  
- **Performance**: bottlenecks, query optimization, load times, scalability.  
- **Security**: input validation, authentication/authorization, data protection, compliance.  
- **Prioritization**: Critical → High → Medium → Low.  
- Provide actionable remediation strategies.  

---

### 4. SCRIPTER
**Trigger:** `SCRIPTER: [task]`  
**Output:** Automation script + usage docs

Checklist:
- Analyze requirements and environment.  
- Choose language based on task type:  
  - Shell/Bash → CI/CD, system ops  
  - Python → APIs, data, complex workflows  
  - Node.js → async, JSON/web automation  
  - PowerShell → Windows environments  
  - Go → high-performance CLIs  
- Ensure error handling, logging, rollback, configuration.  
- Document usage and test cases.  

---

### 5. PLUGIN
**Trigger:** `PLUGIN: [spec]`  
**Output:** Plugin or extension

Checklist:
- Define plugin interface and lifecycle.  
- Implement lifecycle: init → start → stop → destroy.  
- Provide configuration schema and validation.  
- Ensure sandboxing and dependency isolation.  
- Supply installation, monitoring, and update tools.  

---

## SPEC Document Template

When creating a new specification, follow this structure:

```markdown
# SPEC-[YYYYMMDD]-[feature-name]

## Executive Summary
- Business context and problem statement
- Expected value and benefits

## Functional Requirements
- Clear description of required behaviors
- User stories or use cases

## Non-Functional Requirements
- Performance, reliability, security, compliance

## Architecture Analysis
### Database
- Schema, migrations, relationships
### Backend
- APIs, services, business logic
### Frontend
- Components, UX flows, state management
### Integrations
- External services, APIs, monitoring, deployment
### Security & Compliance
- Threats, mitigations, data protection, standards

## Implementation Plan
- Layered breakdown of tasks (DB → Backend → Frontend → Integration → Testing)
- Dependencies and sequence
- Timeline and effort estimates

## Success Metrics
- Quantifiable goals for performance, coverage, security, reliability

## Execution Logs
(ENGINEER appends updates here as tasks are completed)

## Debug Logs
(ENGINEER appends debug attempts and fixes here)

## Development Commands

The following commands represent common workflows.  
They should be adapted to match the language, framework, or tooling in use for the project.

Quality checks
lint # Run linter
format # Auto-format code
typecheck # Static type checks (if supported)

Tests
test # Run all tests
test:coverage # Run tests with coverage reporting

Build & Run
build # Compile or package the application
dev # Start development server / hot reload
preview # Run a local preview build

yaml
Copy code

---

## Environment

- **Dependencies**: Pin versions in lockfiles (e.g., `package-lock.json`, `poetry.lock`) to ensure reproducibility.  
- **Configuration Separation**: Maintain separate configs for development, staging, and production.  
- **Environment Variables**: Document required variables in `.env.example` and provide secure management for secrets.  
- **Onboarding Scripts**: Include setup scripts (`setup.sh`, `Makefile`, etc.) to simplify first-time developer setup.  

---

## Metrics

| Metric              | Target                          |
|---------------------|---------------------------------|
| Test Coverage       | ≥80% on critical paths          |
| API Response Time   | 95th percentile < 200ms         |
| Page Load           | Initial load < 2 seconds        |
| Database Queries    | 99% under 100ms                 |
| Code Complexity     | ≤10 cyclomatic per function     |
| Error Rate          | <0.1% in production             |
| Security Compliance | Full OWASP Top 10 adherence     |

---

## Integration

- **Continuous Integration (CI)**  
  - Automated linting, tests, type checks, and security scans on pull requests.  
  - Enforce passing checks before merging.  

- **Continuous Delivery (CD)**  
  - Use staged deployments (dev → staging → production).  
  - Support feature flags and rollback mechanisms.  
  - Include health checks before marking a release as successful.  

- **Monitoring & Observability**  
  - Collect performance metrics (latency, throughput, error rates).  
  - Implement centralized logging and alerting.  
  - Track user experience indicators (load time, availability, responsiveness).  

---

## Recommended MCP Extensions (Optional)

This configuration works fully without external dependencies.  
For advanced setups, the following **Model Context Protocol (MCP) servers** can be integrated:

- **SpecGen MCP** → Manage SPEC documents as living entities with category-based organization.  
- **Static Analysis MCP** → Provide deeper, language-specific static analysis (e.g., TypeScript, Python).  
- **Search/Index MCPs** → Enable fast cross-project code exploration and references.  
- **Automation MCPs** → Extend with CI/CD, infrastructure, or deployment orchestration.  
