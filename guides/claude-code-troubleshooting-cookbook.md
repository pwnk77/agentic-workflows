# Claude Code Troubleshooting Cookbook

*Quick solutions to common issues, error patterns, and debugging scenarios*

## Introduction: Your Quick Reference Guide

When you're in the middle of implementing a feature and hit an issue, you don't need theory—you need solutions. This cookbook provides step-by-step fixes for the most common Claude Code challenges, organized by symptoms and error patterns.

**How to Use This Cookbook:**
1. **Find your symptom** in the table of contents
2. **Follow the diagnostic steps** to confirm the issue
3. **Apply the solution** with copy-paste commands
4. **Prevent recurrence** with the provided tips

---

## Quick Issue Finder 🔍

| Symptom | Page Section |
|---------|-------------|
| Architect mode not asking clarifying questions | [Architect Issues](#architect-mode-issues) |
| Engineer mode not finding specification file | [Engineer Issues](#engineer-mode-issues) |
| Hook system not triggering | [Hook System Issues](#hook-system-issues) |
| Debug mode providing generic responses | [Debug Issues](#debug-mode-issues) |
| Specifications missing implementation details | [Specification Issues](#specification-issues) |
| Tool permissions blocked/denied | [Permission Issues](#permission-issues) |
| Session summaries not working | [AI Integration Issues](#ai-integration-issues) |
| Files not being created/edited properly | [File Operation Issues](#file-operation-issues) |

---

## Architect Mode Issues

### Issue: Architect Not Asking Clarifying Questions

**Symptoms:**
- Architect jumps straight to specification generation
- Missing requirement analysis phase
- Lacks detailed functional requirements

**Diagnostic Check:**
```bash
# Check if you're using the command correctly
@architect.md "Your feature description should be here, not just a command"
```

**Root Cause:** Often caused by too-detailed initial requests that leave no room for clarification.

**Solution:**
```bash
# ✅ Good: High-level description that invites questions
@architect.md "Add user authentication to our React app"

# ❌ Avoid: Over-detailed requests that skip analysis
@architect.md "Create JWT-based authentication using Auth0 with Google OAuth, store in PostgreSQL with bcrypt hashing..."
```

**Quick Fix Steps:**
1. **Restart with simpler description**: Use 1-2 sentences maximum
2. **Leave room for questions**: Avoid technical implementation details
3. **Focus on business value**: "Users need to log in" vs. "Implement JWT tokens"

**Prevention:**
- Keep initial requests to 20 words or less
- Describe the "what" and "why", not the "how"
- Let architect mode guide the technical decisions

---

### Issue: Architect Specifications Missing Implementation Details

**Symptoms:**
- Generated specs have vague task descriptions
- Missing file paths and specific implementation notes
- Engineer mode struggles with unclear instructions

**Diagnostic Check:**
```bash
# Check if specification has specific file paths and details
grep -E "Files:|Details:" your-spec-file.md
```

**Root Cause:** Insufficient codebase exploration during architect mode.

**Solution Steps:**
1. **Improve codebase context**:
   ```bash
   # Before running architect, ensure your project has clear structure
   find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" | head -20
   ls -la src/ components/ services/ 2>/dev/null
   ```

2. **Provide better initial context**:
   ```bash
   @architect.md "Add payment processing to our Next.js e-commerce app. We use Stripe for payments and PostgreSQL for data storage."
   ```

3. **Answer architecture questions thoroughly**:
   - Include existing patterns you want to follow
   - Mention current tech stack components
   - Specify integration preferences

**Prevention:**
- Run `ls -la` and `find . -name "*.json"` before architect mode
- Mention existing services/libraries in your request
- Be specific about integration points during Q&A

---

## Engineer Mode Issues

### Issue: Engineer Can't Find Specification File

**Symptoms:**
```
File does not exist: docs/SPEC-feature-name.md
```

**Diagnostic Check:**
```bash
# Check if file exists and get correct path
find . -name "*SPEC*" -type f
ls -la docs/ 2>/dev/null
```

**Quick Fix:**
```bash
# Use the exact path from find command
@engineer.md ./path/to/your/SPEC-file.md

# Or create missing directories
mkdir -p docs
# Re-run architect mode to generate in correct location
```

**Common Path Issues:**
- **Missing `docs/` directory**: `mkdir -p docs`
- **File in different location**: Use `find . -name "*SPEC*"`
- **Wrong filename format**: Look for `SPEC-YYYYMMDD-feature-name.md`

---

### Issue: Engineer Mode Stops Execution After Errors

**Symptoms:**
- Implementation stops mid-layer
- "Task failed" logged to specification
- No automatic error recovery

**Diagnostic Check:**
```bash
# Check execution logs in your specification file
tail -20 docs/SPEC-your-feature.md
```

**Solution - Activate Debug Mode:**
```bash
@engineer.md docs/SPEC-your-feature.md debug "Describe the specific error you encountered"
```

**Debug Mode Activation Examples:**
```bash
# Database error
@engineer.md docs/SPEC-auth.md debug "Migration failing with column already exists error"

# API error  
@engineer.md docs/SPEC-payment.md debug "Stripe API returning 401 unauthorized"

# Frontend error
@engineer.md docs/SPEC-dashboard.md debug "React component not rendering, getting undefined props"
```

**Prevention:**
- Monitor execution logs during implementation
- Use debug mode immediately when errors occur
- Don't try to fix manually—let debug mode analyze

---

## Hook System Issues

### Issue: Hook System Not Triggering

**Symptoms:**
- No audio feedback when editing files
- No session summaries at completion
- Hook logs not being created

**Diagnostic Check:**
```bash
# Check if hooks are configured
cat ~/.claude/settings.local.json | grep -A 10 "hooks"

# Test hook script manually
echo '{"hook_event_name":"PostToolUse","tool_name":"test"}' | ~/.claude/hooks/notification.sh
```

**Solution Steps:**

1. **Check Hook Configuration:**
   ```json
   // ~/.claude/settings.local.json should include:
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Bash|Edit|MultiEdit|Write",
           "hooks": [
             {
               "type": "command",
               "command": "~/.claude/hooks/notification.sh"
             }
           ]
         }
       ]
     }
   }
   ```

2. **Create Hook Script Directory:**
   ```bash
   mkdir -p ~/.claude/hooks
   ```

3. **Install Hook Script:**
   ```bash
   # Copy the notification script from the hook system guide
   curl -o ~/.claude/hooks/notification.sh https://your-hook-script-url
   chmod +x ~/.claude/hooks/notification.sh
   ```

4. **Test Audio System:**
   ```bash
   # Test system audio
   afplay /System/Library/Sounds/Pop.aiff
   
   # Test speech synthesis
   say "Testing voice"
   ```

**Common Fixes:**
- **Permission denied**: `chmod +x ~/.claude/hooks/notification.sh`
- **jq not found**: `brew install jq`
- **Audio not working**: Check system sound settings

---

### Issue: Session Summaries Not Working

**Symptoms:**
- Only hearing "Session complete" instead of intelligent summaries
- Hook logs show AI summary failed

**Diagnostic Check:**
```bash
# Test Claude CLI integration
echo "test session context" | claude -p "Summarize this:"

# Check session context file
ls -la ~/.claude/hooks/session_context.txt
head -5 ~/.claude/hooks/session_context.txt
```

**Solution Steps:**

1. **Install Claude CLI:**
   ```bash
   # Check if claude command exists
   which claude
   
   # If not found, install Claude CLI
   npm install -g @anthropic/claude-cli
   # or
   pip install claude-cli
   ```

2. **Configure Claude CLI:**
   ```bash
   # Set up authentication
   claude configure
   ```

3. **Fix Session Context File:**
   ```bash
   # Create if missing
   touch ~/.claude/hooks/session_context.txt
   
   # Fix permissions
   chmod 644 ~/.claude/hooks/session_context.txt
   ```

4. **Test Integration:**
   ```bash
   # Manual test
   echo "Modified authentication service, added user validation, updated tests" | claude -p "Summarize in 15 words:"
   ```

---

## Debug Mode Issues

### Issue: Debug Mode Providing Generic Responses

**Symptoms:**
- Debug mode says "I need more context"
- Generic troubleshooting suggestions
- No specific code analysis

**Root Cause:** Insufficient issue description or missing session context.

**Better Debug Invocation:**
```bash
# ❌ Too vague
@engineer.md docs/SPEC-auth.md debug "Not working"

# ✅ Specific and actionable
@engineer.md docs/SPEC-auth.md debug "User login API returning 500 error after adding password validation middleware. Error message: 'Cannot read property hash of undefined' in authService.validatePassword function"
```

**Debug Description Template:**
```bash
@engineer.md docs/SPEC-[feature].md debug "[Component] [specific error] [when it occurs]. Error details: [exact error message] in [file/function location]"
```

**Examples:**
```bash
# Database issue
@engineer.md docs/SPEC-user-management.md debug "PostgreSQL migration failing when adding user_profiles table. Error: relation 'users' does not exist during foreign key creation"

# API integration issue  
@engineer.md docs/SPEC-payment-system.md debug "Stripe webhook endpoint returning 400 after implementing signature verification. Webhook events not being processed, logs show 'Invalid signature' error"

# Frontend issue
@engineer.md docs/SPEC-dashboard.md debug "React dashboard component blank after implementing user context. Console shows 'Cannot read property user of undefined' in DashboardContainer.tsx line 23"
```

---

## Specification Issues

### Issue: Generated Specifications Too Abstract

**Symptoms:**
- Tasks like "Implement authentication" without specifics
- Missing file paths and technical details
- Engineer mode asking for clarification

**Solution - Request Specification Regeneration:**
```bash
# Ask architect to be more specific
@architect.md "Regenerate the authentication specification with more implementation details. Include specific file paths, exact function names, and detailed task descriptions for each component."
```

**During Architect Q&A, Provide:**
- Existing file structure: `src/components/`, `src/services/`
- Current patterns: "We use React hooks for state management"
- Naming conventions: "Components are in PascalCase, services in camelCase"
- Technology specifics: "We use TypeScript, Prisma ORM, Next.js API routes"

---

### Issue: Specification Tasks in Wrong Order

**Symptoms:**
- Frontend tasks before backend APIs exist
- Tests that reference unimplemented functions
- Dependency conflicts during implementation

**Quick Fix:**
```bash
# Use debug mode to reorder tasks
@engineer.md docs/SPEC-feature.md debug "Task dependencies are incorrect. Frontend components reference API endpoints that haven't been created yet. Please reorder the implementation plan to build backend APIs first."
```

**Prevention During Architect Mode:**
- Emphasize dependency order in your answers
- Mention "build APIs before frontend" preferences
- Ask architect to verify task sequence

---

## Permission Issues

### Issue: Tool Permissions Denied

**Symptoms:**
```
Permission denied: Tool [ToolName] is not allowed
```

**Diagnostic Check:**
```bash
# Check current permissions
cat ~/.claude/settings.local.json | grep -A 20 "permissions"
```

**Quick Permission Fixes:**

1. **File Operations:**
   ```json
   {
     "permissions": {
       "allow": [
         "Read:*", "Write:*", "Edit:*", "MultiEdit:*", 
         "Glob:*", "Grep:*", "LS:*"
       ]
     }
   }
   ```

2. **Common Bash Commands:**
   ```json
   {
     "permissions": {
       "allow": [
         "Bash(ls:*)", "Bash(pwd:*)", "Bash(cat:*)", 
         "Bash(git status:*)", "Bash(npm install:*)",
         "Bash(npm test:*)", "Bash(npm run build:*)"
       ]
     }
   }
   ```

3. **Development Tools:**
   ```json
   {
     "permissions": {
       "allow": [
         "Bash(tsc:*)", "Bash(eslint:*)", "Bash(prettier:*)",
         "Bash(jest:*)", "Bash(playwright:*)"
       ]
     }
   }
   ```

**After Permission Changes:**
- Restart Claude Code session
- Test with simple command: `ls`
- Gradually add more permissions as needed

---

## AI Integration Issues

### Issue: AI Summary Generation Failing

**Symptoms:**
- Hook system falling back to "Session complete"
- Timeout errors in hook logs
- Claude CLI authentication issues

**Diagnostic Steps:**
```bash
# Test Claude CLI directly
echo "test" | claude -p "Summarize this:"

# Check authentication
claude configure --check

# Test with timeout
echo "test context" | timeout 10 claude -p "Summarize:"
```

**Solutions:**

1. **Authentication Fix:**
   ```bash
   claude logout
   claude configure  # Re-enter API key
   ```

2. **Timeout Adjustment:**
   ```bash
   # Edit notification.sh to increase timeout
   sed -i 's/timeout 8/timeout 15/g' ~/.claude/hooks/notification.sh
   ```

3. **Fallback Enhancement:**
   ```bash
   # Add better fallback in notification.sh
   if [ -z "$VOICE_SUMMARY" ]; then
       # Extract file types for basic summary
       FILES_CHANGED=$(grep -o "\\.\\w\\+" "$SESSION_CONTEXT_FILE" | sort -u | head -3 | tr '\n' ' ')
       VOICE_SUMMARY="Modified $FILES_CHANGED files"
   fi
   ```

---

## File Operation Issues

### Issue: Files Not Being Created in Expected Location

**Symptoms:**
- Files created in root instead of subdirectories
- Missing directory structure
- Inconsistent file organization

**Diagnostic Check:**
```bash
# Check current working directory
pwd

# See where files are being created
find . -name "*.md" -o -name "*.ts" -o -name "*.tsx" | head -10
```

**Solution:**
```bash
# Create proper directory structure first
mkdir -p src/{components,services,types,utils}
mkdir -p docs tests

# Specify full paths in architect mode
@architect.md "Create user authentication system. Store components in src/components/, services in src/services/, and types in src/types/"
```

**Prevention:**
- Always include directory preferences in architect requests
- Create directory structure before implementation
- Use absolute paths in specifications

---

## Performance Issues

### Issue: Slow Architect/Engineer Execution

**Symptoms:**
- Long delays during specification generation
- Timeout errors during implementation
- Unresponsive sessions

**Diagnostic Steps:**
```bash
# Check system resources
top -l 1 | grep "CPU usage"
df -h  # Check disk space

# Monitor Claude Code logs
tail -f ~/.claude/logs/*.log
```

**Solutions:**

1. **Reduce Context Size:**
   ```bash
   # Clean up large log files
   find ~/.claude -name "*.log" -size +100M -exec truncate -s 50M {} \;
   
   # Clear session context
   > ~/.claude/hooks/session_context.txt
   ```

2. **Optimize Hook System:**
   ```bash
   # Reduce hook logging frequency
   # Edit notification.sh to log less verbose information
   ```

3. **Break Down Large Requests:**
   ```bash
   # Instead of one large feature
   @architect.md "Build complete e-commerce platform"
   
   # Break into smaller parts
   @architect.md "Add user authentication to existing app"
   @architect.md "Add product catalog functionality"  
   @architect.md "Integrate payment processing"
   ```

---

## Emergency Fixes 🚨

### Complete Reset When Everything Breaks

```bash
# 1. Back up important files
cp ~/.claude/settings.local.json ~/.claude/settings.backup.json

# 2. Reset hook system
rm -rf ~/.claude/hooks/
mkdir -p ~/.claude/hooks/

# 3. Clear session context
> ~/.claude/hooks/session_context.txt

# 4. Test basic functionality
echo "test" | claude -p "Say hello:"

# 5. Reconfigure step by step
# Start with basic permissions, add hooks gradually
```

### Quick Verification After Fixes

```bash
# Test architect mode
@architect.md "Create a simple test feature to verify architect mode is working"

# Test engineer mode (after architect completes)
@engineer.md docs/SPEC-[generated-spec].md

# Test hooks
# Should hear audio feedback during file operations

# Test debug mode
@engineer.md docs/SPEC-[spec].md debug "Testing debug mode functionality"
```

---

## Prevention Checklist ✅

**Before Starting Any Claude Code Session:**

- [ ] Check current directory: `pwd`
- [ ] Verify permissions: `cat ~/.claude/settings.local.json | grep -A 5 permissions`
- [ ] Test audio: `afplay /System/Library/Sounds/Pop.aiff`
- [ ] Confirm Claude CLI: `claude --version`
- [ ] Clear old context: `> ~/.claude/hooks/session_context.txt`

**During Architect Mode:**
- [ ] Keep initial request to 1-2 sentences
- [ ] Answer questions with specific technical details
- [ ] Mention existing patterns and preferences
- [ ] Verify generated specification has specific file paths

**During Engineer Mode:**
- [ ] Monitor execution logs for errors
- [ ] Use debug mode immediately when issues occur
- [ ] Don't manually fix—let debug mode analyze
- [ ] Verify each layer completes before moving to next

**After Implementation:**
- [ ] Review session summary for accuracy
- [ ] Check hook logs for any errors
- [ ] Test implemented functionality
- [ ] Document any new patterns learned

---

## Getting Additional Help

### When This Cookbook Doesn't Cover Your Issue

1. **Create Detailed Issue Report:**
   ```markdown
   # Issue Description
   - What you were trying to do
   - Exact commands used
   - Full error messages
   - System information (OS, Claude Code version)
   
   # Steps to Reproduce
   1. Step one
   2. Step two
   3. Error occurs
   
   # Expected vs Actual Behavior
   Expected: [what should happen]
   Actual: [what actually happened]
   ```

2. **Gather Debug Information:**
   ```bash
   # System info
   uname -a
   claude --version
   
   # Configuration
   cat ~/.claude/settings.local.json
   
   # Recent logs
   tail -50 ~/.claude/hooks/hooks.log
   ```

3. **Community Resources:**
   - Claude Code GitHub discussions
   - Community Discord/Slack
   - Stack Overflow with `claude-code` tag

Remember: The hook system learns from your debugging patterns, so each resolved issue makes future debugging smarter and more efficient.

---

*Continue your journey: [Enterprise Patterns & Workflows →](claude-code-enterprise-patterns.md)*

*Previous: [Unified Debug Workflow ←](claude-code-unified-debug-workflow.md)*