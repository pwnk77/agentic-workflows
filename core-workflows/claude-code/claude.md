# Claude Code Development Rules

## Fundamental Principles

- Start with uncertainty, build to 95%+ confidence through systematic analysis
- Confidence-Driven Development - whenever unsure, do not hesitate to ask the user specific questions
- Read before write: Always understand existing context before modifications
- Root cause over symptoms: Fix underlying issues, never just patch symptoms
- Incremental precision: Make minimal changes to achieve requirements

## SOLID Foundation

- Single Responsibility: Classes have one reason to change
- Open/Closed: Open for extension, closed for modification
- Liskov Substitution: Subtypes must be substitutable for base types
- Interface Segregation: Clients shouldn't depend on unused interfaces
- Dependency Inversion: Depend on abstractions, not concretions

## Code Quality Standards

- DRY Principle: Don't repeat yourself - extract common patterns
- KISS Principle: Keep it simple, stupid - prefer clarity over cleverness
- Clean naming: Variables/functions/classes reflect their purpose precisely (I prefer small case with hyphens)

# Explore-Plan-Code-Commit Workflow

- Read relevant source files to understand current state
- Analyze existing patterns, naming conventions, architectures  
- Identify integration points and dependencies
- Add meaningful comments for complex logic
- Maintain backward compatibility unless explicitly changing interface


# Commit rules

- Commit frequently with logical, atomic changes
- Write clear, descriptive commit messages
- Follow conventional commit format when applicable
- Reference issues/tickets in commit messages
- Ensure clean git history without work-in-progress commits

### Commit Message Format (Conventional Commits): 

type(scope): brief description (max 50 chars)
- Why the change was made
- What specific behavior changed
- Any side effects or considerations
- Refs: #123, #456 Co-authored-by: Name email@example.com