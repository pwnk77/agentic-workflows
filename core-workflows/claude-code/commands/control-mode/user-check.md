---
description: User experience validation workflow with systematic issue resolution
allowed-tools: Task, TodoWrite
argument-hint: <user-task>
---

# USER-CHECK WORKFLOW COMMAND

**Goal**: Validate user experience through authentic behavior simulation, identify UX friction points and technical bugs, then systematically resolve issues to create optimal user journeys.

**Variables:**
```
user_task: $ARGUMENTS (required: specific user task to simulate and validate)
```

## SEQUENTIAL AGENT EXECUTION CHAIN

**Chain Flow**: `user` → `engineer` → `user (verify improvements)`

**Expected Outcome**: Validated user experience with resolved friction points, technical bugs fixed, and confirmed user journey optimization.

## PHASE 1: USER EXPERIENCE SIMULATION & ANALYSIS

**Agent**: `user`
**Input**: User task description for realistic simulation
**Wait Condition**: Complete UX analysis with documented issues and recommendations

**Execution**:
```bash
Task(
  description="User experience testing and analysis",
  prompt="Simulate authentic user behavior for task: '${user_task}'. Use Playwright to test realistic user journeys, document friction points, identify technical bugs, and assess overall user experience. Generate comprehensive USR-SPEC with prioritized recommendations.",
  subagent_type="user"
)
```

**Testing Protocol**:
- **Authentic Simulation**: Real user behavior patterns, not developer knowledge
- **Device Coverage**: Desktop and mobile experience validation
- **Error Scenarios**: Common user mistakes and recovery attempts
- **Performance Monitoring**: Loading times and interaction responsiveness
- **Technical Bug Detection**: Console errors, broken functionality, accessibility issues

**Analysis Requirements**:
- **User Journey Documentation**: Step-by-step interaction analysis
- **Friction Point Identification**: Where users get confused or stuck
- **Technical Issue Catalog**: Bugs that break user experience
- **UX Recommendations**: Specific improvements for user success
- **Success Metrics**: Completion rates, time to success, satisfaction assessment

**Success Criteria**:
- USR-SPEC document created in `docs/USR-SPEC-YYYYMMDD-[task].md`
- User journey fully documented with success/failure points
- Technical bugs cataloged with reproduction steps
- UX improvements prioritized by impact and effort

**Handoff Signal**:
**🔔 USER_COMPLETE**: User simulation finished - [Task] analysis complete with [X] UX issues and [Y] technical bugs identified

**⚠️ APPROVAL CHECKPOINT**: Human approval required to prioritize UX issues and technical bugs before proceeding to fixes

## PHASE 2: SYSTEMATIC ISSUE RESOLUTION

**Agent**: `engineer`
**Input**: USR-SPEC document with prioritized issues and technical bugs
**Wait Condition**: Systematic resolution of identified problems

**Execution**:
```bash
Task(
  description="User experience issue resolution",
  prompt="Systematically address user experience issues documented in: 'docs/USR-SPEC-YYYYMMDD-[task].md'. Prioritize critical UX friction points and technical bugs. Implement fixes that improve user success rates and remove barriers to task completion.",
  subagent_type="engineer"
)
```

**Resolution Protocol**:
1. **Issue Prioritization**: Address critical UX blockers first
2. **Technical Bug Fixes**: Resolve console errors and broken functionality
3. **UX Improvements**: Implement specific user experience enhancements
4. **Mobile Optimization**: Fix mobile-specific interaction problems
5. **Performance Fixes**: Address loading and responsiveness issues
6. **Accessibility Improvements**: Ensure inclusive user experience

**Implementation Standards**:
- **User-Centric Fixes**: Changes that directly improve user success
- **Progressive Enhancement**: Improvements that don't break existing functionality
- **Mobile-First**: Ensure fixes work across all device types
- **Performance Conscious**: Don't sacrifice speed for features
- **Accessibility Compliant**: Support assistive technologies and diverse users

**Success Criteria**:
- Critical UX friction points resolved
- Technical bugs fixed with validation
- Mobile experience optimized for touch interaction
- Performance improvements implemented
- Changes documented for verification testing

**Handoff Signal**:
**🔔 IMPLEMENTATION_COMPLETE**: User experience fixes implemented - [X] issues resolved with validation ready

**⚠️ APPROVAL CHECKPOINT**: Human approval required to validate UX fixes before proceeding to verification testing

## PHASE 3: IMPROVEMENT VERIFICATION

**Agent**: `user` (verification mode)
**Input**: Updated application with UX fixes implemented
**Wait Condition**: Verification that improvements actually enhance user experience

**Execution**:
```bash
Task(
  description="User experience improvement verification",
  prompt="Re-test user task to verify improvements: '${user_task}'. Compare results to original USR-SPEC document, validate that fixes actually improve user success rates, and identify any remaining issues. Generate verification report with before/after comparison.",
  subagent_type="user"
)
```

**Verification Protocol**:
1. **Task Re-simulation**: Repeat original user task with same realistic patterns
2. **Improvement Validation**: Confirm fixes actually solve identified problems
3. **Success Metrics Comparison**: Compare completion rates and task duration
4. **New Issue Detection**: Identify any problems introduced by fixes
5. **User Satisfaction Assessment**: Evaluate overall experience improvement

**Verification Standards**:
- **Measurable Improvement**: Quantifiable enhancement in user success metrics
- **No Regression**: Fixes don't introduce new UX problems
- **Cross-Device Validation**: Improvements work on desktop and mobile
- **Edge Case Testing**: Unusual but realistic user scenarios still work
- **Performance Validation**: Changes don't negatively impact loading or responsiveness

**Success Criteria**:
- User task completion rate improved
- Task completion time reduced
- User frustration indicators decreased
- Technical bugs confirmed resolved
- No new UX issues introduced

**Handoff Signal**:
**🔔 VERIFICATION_COMPLETE**: User experience verification finished - Improvements confirmed with [X]% success rate increase

**⚠️ APPROVAL CHECKPOINT**: Human approval required for final UX improvement validation before considering workflow complete

## WORKFLOW COORDINATION

### Context Preservation

**USR-SPEC Document**: Central coordination point for UX workflow
- User creates initial analysis with issue documentation
- Engineer references for systematic fix implementation
- Verification results append improvement confirmation

**Sequential Dependencies**:
```
user analysis → fix implementation → improvement verification
```

### Documentation Flow

**Phase 1 Output**: `docs/USR-SPEC-YYYYMMDD-[task].md`
```markdown
## Initial User Experience Analysis
- User journey documentation
- Friction points and barriers
- Technical bugs discovered
- UX improvement recommendations
```

**Phase 2 Updates**: Append to USR-SPEC document
```markdown
## Issue Resolution Implementation
- Fixed technical bugs with validation
- UX improvements implemented
- Mobile optimization changes
- Performance enhancements applied
```

**Phase 3 Final**: Complete USR-SPEC document
```markdown
## Verification Results
- Before/after comparison metrics
- User success rate improvements
- Remaining issues (if any)
- Overall UX enhancement assessment
```

### Iterative Improvement

**Continuous Enhancement**: If verification reveals remaining issues:
1. **Priority Assessment**: Evaluate impact of remaining problems
2. **Additional Fixes**: Return to Phase 2 for further improvements
3. **Re-verification**: Test again until optimal user experience achieved

## USAGE EXAMPLES

### E-commerce Checkout Flow
```bash
/user-check "complete a purchase from product selection to order confirmation on mobile"
```

**Expected Flow**:
1. User simulation identifies cart abandonment points, mobile payment issues
2. Engineer fixes touch targets, payment form validation, loading indicators
3. Verification confirms improved conversion rates and mobile experience

### User Onboarding Experience
```bash
/user-check "new user signup and complete initial profile setup"
```

**Expected Flow**:
1. User simulation finds confusing form validation, unclear progress indicators
2. Engineer implements helpful error messages, progress visualization, success feedback
3. Verification confirms reduced abandonment and faster onboarding completion

### Dashboard Navigation
```bash
/user-check "find last month's analytics report and export to Excel"
```

**Expected Flow**:
1. User simulation discovers information overload, hidden export functionality
2. Engineer improves navigation hierarchy, makes export button more prominent
3. Verification confirms faster task completion and reduced user confusion

### Password Reset Flow
```bash
/user-check "reset forgotten password and log back into account"
```

**Expected Flow**:
1. User simulation identifies confusing email instructions, broken reset links
2. Engineer fixes email templates, link handling, success confirmation
3. Verification confirms seamless password recovery experience

## UX IMPROVEMENT CATEGORIES

### Critical UX Issues (Block Task Completion)
- **Users Cannot Complete Primary Goals**: Payment failures, form submission errors
- **Navigation Confusion**: Users can't find essential functions
- **Mobile Accessibility**: Touch targets too small, content off-screen
- **Error Recovery**: No clear path when things go wrong

### Major UX Issues (Cause Significant Friction)
- **Slow Performance**: Loading times that cause abandonment
- **Unclear Feedback**: Users unsure if actions worked
- **Information Overload**: Too many options without clear hierarchy
- **Inconsistent Patterns**: Different interactions for similar actions

### Minor UX Issues (Small Annoyances)
- **Visual Polish**: Alignment, spacing, typography improvements
- **Helpful Details**: Tooltips, placeholder text, microcopy
- **Convenience Features**: Keyboard shortcuts, bulk actions
- **Progressive Disclosure**: Advanced options available but not overwhelming

## SUCCESS METRICS

### Quantitative Improvements
- **Task Completion Rate**: [Before]% → [After]%
- **Time to Complete**: [Before] minutes → [After] minutes
- **Error Rate**: [Before] errors → [After] errors per session
- **Mobile Success**: [Before]% → [After]% mobile completion rate

### Qualitative Enhancements
- **User Confidence**: Reduced uncertainty and hesitation
- **Error Recovery**: Better guidance when problems occur
- **Feature Discoverability**: Users find functionality naturally
- **Cross-Device Consistency**: Seamless experience across platforms

### Business Impact
- **Conversion Improvement**: Better user success drives business metrics
- **Support Reduction**: Fewer confused users contacting support
- **User Retention**: Positive experience encourages continued usage
- **Competitive Advantage**: Superior UX differentiates from alternatives

**🔔 USER_CHECK_COMPLETE**: User experience validation workflow finished - [Task] optimized with [X]% improvement in user success rate

Use this workflow for any user-facing feature or flow that needs validation. The systematic approach ensures real user perspective drives improvements rather than developer assumptions about user behavior.