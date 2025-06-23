# General instructions

this doc is based on the guide provided below - 
https://docs.anthropic.com/en/docs/claude-code/tutorials#create-custom-slash-commands

# Create custom slash commands
Claude Code supports custom slash commands that you can create to quickly execute specific prompts or tasks.

​
Create project-specific commands
When to use: You want to create reusable slash commands for your project that all team members can use.

1
Create a commands directory in your project


Copy
mkdir -p .claude/commands
2
Create a Markdown file for each command


Copy
echo "Analyze the performance of this code and suggest three specific optimizations:" > .claude/commands/optimize.md 
3
Use your custom command in Claude Code


Copy
claude > /project:optimize 
Tips:

Command names are derived from the filename (e.g., optimize.md becomes /project:optimize)
You can organize commands in subdirectories (e.g., .claude/commands/frontend/component.md becomes /project:frontend:component)
Project commands are available to everyone who clones the repository
The Markdown file content becomes the prompt sent to Claude when the command is invoked
​
# Add command arguments with $ARGUMENTS

When to use: You want to create flexible slash commands that can accept additional input from users.

1
Create a command file with the $ARGUMENTS placeholder


Copy
echo "Find and fix issue #$ARGUMENTS. Follow these steps: 1.
Understand the issue described in the ticket 2. Locate the relevant code in
our codebase 3. Implement a solution that addresses the root cause 4. Add
appropriate tests 5. Prepare a concise PR description" >
.claude/commands/fix-issue.md 
2
Use the command with an issue number


Copy
claude > /project:fix-issue 123 
This will replace $ARGUMENTS with “123” in the prompt.

Tips:

The $ARGUMENTS placeholder is replaced with any text that follows the command
You can position $ARGUMENTS anywhere in your command template
Other useful applications: generating test cases for specific functions, creating documentation for components, reviewing code in particular files, or translating content to specified languages
​
# Create personal slash commands

When to use: You want to create personal slash commands that work across all your projects.

1
Create a commands directory in your home folder


Copy
mkdir -p ~/.claude/commands 
2
Create a Markdown file for each command


Copy
echo "Review this code for security vulnerabilities, focusing on:" >
~/.claude/commands/security-review.md 
3
Use your personal custom command


Copy
claude > /user:security-review 
Tips:

Personal commands are prefixed with /user: instead of /project:
Personal commands are only available to you and not shared with your team
Personal commands work across all your projects
You can use these for consistent workflows across different codebases
