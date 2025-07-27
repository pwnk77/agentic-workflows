---
description: User behavior simulation for UI/UX testing using Playwright MCP
allowed-tools: Bash, Grep, Glob, Read, Write, TodoWrite, Task
argument-hint: <task>
---

# USER BEHAVIOR SIMULATION COMMAND

**Goal**: Simulate authentic user behavior using Playwright MCP to test applications and identify UX issues.

**Variables:**
```
task: $ARGUMENTS (required: user task to simulate, e.g., "sign up for account", "purchase product")
```

## INITIAL ANALYSIS

<thinking>
Before starting user simulation, I need to understand:
- What specific user task am I simulating?
- How would a real user approach this task naturally?
- What are the key user success indicators?
- What could frustrate or block a typical user?
- What device/context would be most realistic for this task?
- What are the most critical user experience elements to evaluate?

From a user perspective:
- Users have goals, not features - they want to accomplish something
- Users scan first, read second - visual hierarchy matters
- Users expect familiar patterns - deviation causes confusion
- Users abandon quickly when blocked - friction points are critical
- Users judge quality by first impressions - initial experience sets tone
</thinking>

## PHASE 1: QUICK PLAN & PLAYWRIGHT SETUP

**Playwright MCP Validation:**
Check for Playwright MCP availability. If unavailable, exit with:
```
🚫 USER SIMULATION BLOCKED: Playwright MCP Required
Cannot proceed without browser automation. Install Playwright MCP and restart.
```

**Task Planning:**
Create todolist and break down user task into natural user steps:
- Initial page assessment and first impressions
- Primary task execution with realistic user behavior
- Error scenarios and recovery attempts
- Mobile vs desktop experience comparison
- Document findings in USR-SPEC format

**Environment Setup:**
- Launch browser via Playwright MCP
- Set realistic viewport (desktop: 1920x1080, mobile: 375x667)
- Enable console error monitoring
- Navigate to application entry point

## PHASE 2: USER SIMULATION & DOCUMENTATION

**User Behavior Protocol:**

**Authentic User Actions:**
- **Scan, don't read**: Look for obvious buttons and navigation first
- **Realistic data**: Use believable names, emails, not "test" data
- **Natural flow**: Follow expected user patterns, not optimal paths
- **Error recovery**: Try again, look for help when things fail
- **Mobile gestures**: Tap, swipe, scroll (not click/drag on mobile)

**Real-time Documentation in `docs/USR-SPEC-[YYYYMMDD]-[task].md`:**

```markdown
# USR-SPEC-[YYYYMMDD]-[task]

## User Task Summary
**Goal**: [What user wants to accomplish]
**Device**: [Desktop/Mobile simulation]
**Completion**: [Success/Partial/Failed]
**Overall UX Rating**: [1-10]

## User Journey Steps
| Step | Action | Expected | Actual | Success | User Feeling |
|------|--------|----------|--------|---------|--------------|
| 1 | [User action] | [What should happen] | [What happened] | ✅/❌ | [Reaction] |

## Bugs & Quality Issues

### Critical Bugs (App broken/unusable)
- **[Bug]**: [Technical issue description]
  - Error: [Console error or visual bug]
  - Reproduction: [Steps to reproduce]
  - Screenshot: [filename]

### Functional Issues (Features don't work)
- **[Issue]**: [What's broken or not working]
  - Expected: [What should happen]
  - Actual: [What actually happens]
  - User impact: [How this affects user]

### Performance Issues
- **[Issue]**: [Slow loading, lag, etc.]
  - Measurement: [Load time, response time]
  - User impact: [Perceived slowness]

## UX Issues Found

### Critical (Blocks task completion)
- **[Issue]**: [Description]
  - User impact: [How this prevents success]
  - Screenshot: [filename]

### Major (Causes friction)
- **[Issue]**: [Description]
  - User impact: [Confusion/delay caused]

### Minor (Small annoyances)
- **[Issue]**: [Description]
  - User impact: [Minor frustration]

## What Works Well
- [Positive user experience elements]
- [Intuitive interactions]
- [Clear guidance or feedback]

## User Recommendations
1. **Quick Wins**: [Easy fixes for immediate UX improvement]
2. **UX Improvements**: [Changes that would help users significantly]
3. **Missing Elements**: [Features users expect but don't find]

## Mobile vs Desktop
- **Better on Desktop**: [What works better on larger screens]
- **Better on Mobile**: [What's more intuitive on mobile]
- **Consistent**: [What works well on both]

## User Success Metrics
- Task completion: [Yes/No/Partial]
- Time to complete: [Duration]
- Number of errors: [Count]
- User satisfaction: [1-10 rating]
- Would recommend: [Yes/No]

## Screenshots
- initial-state.png
- [key-interaction-1].png
- [error-state].png
- [success-state].png
```

**User Simulation Execution:**

1. **First Impressions (Screenshot + Bug Check)**
   - What's immediately visible and attention-grabbing
   - Is the page purpose clear within 5 seconds
   - Where would user naturally look/click first
   - **Bug Detection**: Console errors, broken images, layout issues

2. **Task Flow Simulation**
   - Follow natural user paths, not optimal developer paths
   - Use realistic data entry (real names, valid emails)
   - Document each interaction with screenshots
   - Note user emotional reactions (confusion, satisfaction, frustration)
   - **Bug Detection**: Broken links, non-responsive buttons, form errors

3. **Error & Edge Case Testing**
   - Try common user mistakes (incomplete forms, wrong inputs)
   - Test back button and refresh during processes
   - Attempt shortcuts and alternative approaches
   - **Bug Detection**: Unhandled errors, crashes, data loss

4. **Mobile Experience**
   - Switch to mobile viewport
   - Test touch interactions and thumb navigation
   - Compare mobile vs desktop user experience
   - **Bug Detection**: Mobile-specific layout breaks, touch issues

5. **Performance & Quality Monitoring**
   - Monitor page load times and responsiveness
   - Check for console errors and warnings
   - Identify slow interactions and loading states
   - **Bug Detection**: Performance issues, memory leaks, timeouts

6. **Recovery & Help-Seeking**
   - When stuck, try what real users would do
   - Look for help text, tooltips, or error messages
   - Test error message clarity and actionability
   - **Bug Detection**: Missing error handling, unclear error messages

**Key Metrics to Track:**
- **Task Success Rate**: Can user complete primary goal?
- **Time to Success**: How long does it take?
- **Error Recovery**: How well do users bounce back from mistakes?
- **Bug Count**: Critical/functional/performance issues found
- **Console Errors**: JavaScript errors, warnings, failed requests
- **Performance**: Page load times, interaction response times
- **Mobile Usability**: Does mobile experience match user expectations?

**Realistic User Behaviors:**
- Scan headings and buttons before reading details
- Click obvious primary actions first
- Use browser back button when confused
- Abandon tasks when frustrated (document abandonment triggers)
- Expect immediate feedback after actions
- Try alternative approaches when primary path fails

**Documentation Focus:**
- User impact over technical details
- Emotional reactions and frustration points
- Technical bugs and quality issues encountered
- Console errors and performance problems
- Comparison to familiar applications
- Specific recommendations for UX improvements and bug fixes
- Screenshots showing actual user journey and bug states

**Completion:**
🔔 USER_COMPLETE: User simulation finished

"USER simulation complete for '[task]'. UX analysis and bug report saved to `docs/USR-SPEC-[YYYYMMDD]-[task].md` with user experience insights, technical issues, and recommendations."