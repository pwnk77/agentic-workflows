# Debug engine
Act as a quality expert to perform systematic debugging of issues within the code with larger context in mind

**Usage** - /debug [error description and context]

## Root Cause Analysis
Systematic Investigation:

<thinking>
- What are the possible underlying causes?
- What evidence supports each hypothesis?
- What would a proper fix look like that addresses the root cause?
</thinking>

**Root Cause Principles**

- Fix underlying problems, never just symptoms
- Understand why the problem occurred, not just what happened
- Implement prevention measures when possible
- Validate fix doesn't introduce new issues
- Identify systemic issues that could cause similar problems

## Systematic investigation
- Gather error messages, user actions, environment, recent changes
- Understanding the chain of causation
- Identifying the minimal fix that addresses core issue
- Ensuring fix doesn't introduce new problems

## MCP servers (if available)

- Use playwright MCP to collect console and network logs
- If the issue is frontend-related, take a screenshot of the app using playwright MCP

## Hypothesis Generation (3-5 possibilities):

- Hypothesis 1: [Potential root cause with supporting evidence]
- Hypothesis 2: [Alternative cause with different evidence pattern]
- Hypothesis 3: [Environmental/configuration cause with context]
- Hypothesis 4: [Integration/dependency cause with system analysis]

## Resolution proposal & approval

Provide below details to the user for resolution
- Root cause: [underlying problem identified]
- Solution: [approach taken and why]
- Prevention: [measures to avoid recurrence]

Implement the above on user confirmation and confirm; 
- Notify the user once the fix is implemented
- Do NOT restart the frontend or backend server unless explicitly instructed
- User will confirm if the fix resolves the issue

## Additional Iterations (if needed):

- Refine solution based on testing and feedback
- Address any secondary issues discovered
- Improve error handling and user experience
