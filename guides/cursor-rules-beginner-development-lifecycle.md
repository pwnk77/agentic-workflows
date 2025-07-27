# Cursor Rules: Your AI Development Journey

## Welcome to AI-Powered Development

### What are Cursor Rules and Why They Matter

Cursor rules are powerful commands that transform how you develop software. Instead of writing code from scratch, you collaborate with AI to systematically build features through a structured workflow. Think of them as your development GPS—guiding you from idea to implementation with confidence.

The five core rules form a complete development lifecycle:
- **`/prd`** - Transform ideas into clear specifications
- **`/decompose`** - Break complex features into manageable tasks
- **`/task`** - Execute individual tasks systematically
- **`/debug`** - Solve problems when they arise
- **`/save`** - Preserve progress and document your journey

### The Complete Development Story Overview

This guide tells the story of building software through AI collaboration. You'll follow Sarah, a new developer, as she builds her first feature using all five Cursor rules. By the end, you'll understand not just how to use each rule, but how they work together to create a complete development workflow.

### What You'll Build Together

Throughout this guide, you'll help Sarah build a user notification system for a web application. This real-world example demonstrates every aspect of the development lifecycle while keeping the complexity beginner-friendly.

---

## Setup Your Development Environment

### Cursor IDE Installation and Setup

1. **Download Cursor IDE** from [cursor.sh](https://cursor.sh)
2. **Install the application** following the standard process for your operating system
3. **Open Cursor** and complete the initial setup wizard
4. **Sign in or create an account** to access AI features

### Rule Installation and Verification

1. **Create a `.cursor-rules` directory** in your project root:
   ```bash
   mkdir .cursor-rules
   ```

2. **Download the five core rules** into this directory:
   - `prd.mdc` - Product Requirements Document generator
   - `decompose.mdc` - Task breakdown engine
   - `task.mdc` - Systematic task executor
   - `debug.mdc` - Problem solving assistant
   - `save.mdc` - Progress preservation tool

3. **Verify rule installation** by typing `/` in Cursor's command palette and checking that all five commands appear

### Your First Rule Test

Let's verify everything works:

1. **Open Cursor in your project directory**
2. **Type `/prd` in the command palette**
3. **You should see the PRD rule activate** with its description
4. **Cancel this command** - we'll use it properly in Chapter 1

### Environment Validation Checklist

- [ ] Cursor IDE installed and running
- [ ] Project directory created
- [ ] `.cursor-rules` directory exists
- [ ] All five `.mdc` files present
- [ ] Commands appear when typing `/` in command palette
- [ ] AI features active (check settings if needed)

**Success Indicator**: When you type `/` you see all five custom commands available and ready to use.

### ✅ Validation Checkpoint: Environment Setup
Before proceeding to Chapter 1, verify:
- [ ] All five commands (`/prd`, `/decompose`, `/task`, `/debug`, `/save`) appear in command palette
- [ ] You can successfully cancel a command without errors
- [ ] Cursor AI features are active and responding
- [ ] Project directory structure is ready for development

**Troubleshooting Common Setup Issues:**
- **Commands not appearing**: Check `.cursor-rules` directory location and file permissions
- **AI features disabled**: Verify Cursor account status and internet connection
- **Permission errors**: Ensure write access to project directory

---

## Chapter 1: The Vision (`/prd`)

### Story: "From Idea to Blueprint"

Meet Sarah. She has an idea: "Users should get notifications when important events happen in our app." This sounds simple, but how do you turn a vague idea into something a developer can actually build?

This is where `/prd` becomes your first ally. It takes brain dumps and transforms them into implementation-ready Product Requirements Documents.

### Starting with a Simple Feature Idea

Sarah's initial idea is typical of how features begin:
> "I want to add notifications to our app. Users should know when something important happens. Maybe email, maybe in-app notifications, not sure yet."

This is perfectly normal—ideas start messy. The `/prd` command helps transform this into clarity.

### How `/prd` Transforms Ideas into Specifications

The `/prd` command acts like an experienced product manager, asking the right questions to turn fuzzy ideas into precise requirements. Here's how it works:

1. **Context Discovery**: Analyzes your existing codebase to understand technical constraints
2. **Requirement Clarification**: Asks specific questions to eliminate ambiguity
3. **PRD Generation**: Creates a comprehensive document with technical precision

### Walking Through Your First PRD Creation

Let's follow Sarah's journey:

**Step 1: Trigger the Command**
```
/prd I want to add a notification system to our web app
```

**Step 2: Context Analysis**
The command reads Sarah's codebase and discovers:
- React frontend with TypeScript
- Node.js backend with Express
- PostgreSQL database
- Existing user authentication system

**Step 3: Clarifying Questions**
The AI asks Sarah:
- "Which events should trigger notifications?"
- "Do you need real-time notifications or is delayed delivery acceptable?"
- "Should notifications be stored for later viewing?"
- "What user preferences should be available?"

**Step 4: PRD Generation**
Based on Sarah's answers, a complete PRD is generated at `docs/prd.md`.

### Understanding Requirements vs Implementation

The PRD focuses on **what** needs to be built, not **how** to build it:

**Requirements (what):**
- Users receive notifications for order status changes
- Notifications appear in-app and optionally via email
- Users can customize notification preferences
- Notification history is preserved for 30 days

**Implementation (how - comes later):**
- WebSocket connection for real-time delivery
- Email service integration
- Database schema for notification storage
- React components for notification display

### PRD Quality Checklist

A good PRD has:
- [ ] **Clear elevator pitch** explaining the feature's value
- [ ] **Specific target users** with defined use cases
- [ ] **Measurable goals** with success criteria
- [ ] **Precise functional requirements** with acceptance criteria
- [ ] **Technical specifications** aligned with existing architecture
- [ ] **Non-goals** that prevent scope creep

**Success Indicator**: Your PRD should be detailed enough that a developer who's never spoken to you could build the feature correctly.

### ✅ Validation Checkpoint: PRD Quality
Before moving to decomposition, verify your PRD has:
- [ ] **Clear problem statement**: What specific user pain point does this solve?
- [ ] **Measurable goals**: Can you quantify success? (e.g., "reduce click time by 50%")
- [ ] **Precise requirements**: Are terms like "fast", "easy", "better" defined specifically?
- [ ] **Technical alignment**: Does the solution fit your existing technology stack?
- [ ] **Scope boundaries**: What features are explicitly excluded?

**Common PRD Problems and Fixes:**
- **Vague requirements**: Replace "user-friendly" with "complete task in under 3 clicks"
- **Missing acceptance criteria**: Add "Given/When/Then" scenarios for each requirement
- **Technical misalignment**: Verify proposed solutions work with existing infrastructure
- **Scope creep**: List specific features that are out of scope for this version

**Self-Assessment Questions:**
1. Can I build a test plan from these requirements?
2. Would another developer understand exactly what to build?
3. Are all technical terms clearly defined?
4. Do I know what "done" looks like for each requirement?

---

## Chapter 2: The Plan (`/decompose`)

### Story: "Breaking Down the Mountain"

Sarah now has a comprehensive PRD, but it feels overwhelming. How do you build something this complex? Where do you even start?

The `/decompose` command acts like an experienced project manager, taking your PRD and creating a step-by-step roadmap with precise task ordering.

### Taking Your PRD and Creating a Roadmap

The decomposition process follows a systematic approach:

1. **Reads the PRD** from `docs/prd.md`
2. **Analyzes technical requirements** and dependencies
3. **Creates granular tasks** with specific implementation details
4. **Orders tasks logically** to prevent breaking existing functionality
5. **Generates `docs/tasks.json`** with complete task definitions

### How `/decompose` Creates Actionable Tasks

Let's see how Sarah's notification system PRD becomes actionable tasks:

**Step 1: Trigger Decomposition**
```
/decompose
```

**Step 2: Systematic Analysis**
The command analyzes Sarah's PRD and identifies major components:
- Database schema for notifications
- Backend API endpoints
- Real-time delivery system
- Frontend notification components
- User preference management

**Step 3: Task Generation**
Each component becomes multiple specific tasks with precise details.

### Understanding Dependencies and Ordering

Tasks are ordered to ensure smooth development:

**Database Layer (DB-001 to DB-003):**
- DB-001: Create notification schema
- DB-002: Add user preference tables
- DB-003: Create database indexes

**Backend Layer (BE-001 to BE-004):**
- BE-001: Create notification service
- BE-002: Build API endpoints
- BE-003: Implement WebSocket handling
- BE-004: Add email integration

**Frontend Layer (FE-001 to FE-003):**
- FE-001: Create notification components
- FE-002: Add real-time connection
- FE-003: Build preference settings

### Your Task Breakdown Walkthrough

Here's what Sarah's `docs/tasks.json` looks like:

```json
{
  "metadata": {
    "prd_file": "docs/prd.md",
    "created_date": "2025-01-15T10:30:00Z",
    "description": "User notification system implementation",
    "total_tasks": 10,
    "estimated_hours": 24,
    "confidence_level": "95%"
  },
  "tasks": [
    {
      "id": "DB-001",
      "title": "Create notification database schema",
      "description": "Design and implement database tables for storing notifications",
      "category": "database",
      "status": "todo",
      "priority": "high",
      "estimated_hours": 2,
      "dependencies": [],
      "files_affected": {
        "create": ["migrations/001_create_notifications.sql"],
        "modify": [],
        "read": ["config/database.js"]
      },
      "implementation_details": {
        "approach": "Create normalized tables for notifications and user preferences",
        "functions_to_implement": ["up()", "down()"],
        "tests_to_write": ["test/migrations/notifications.test.js"],
        "libraries_needed": [],
        "integration_points": ["existing user table"]
      },
      "acceptance_criteria": [
        "Notifications table supports all required fields",
        "Foreign key relationships properly defined",
        "Migration runs without errors"
      ]
    }
  ]
}
```

### Planning Validation Steps

Each task includes validation steps to ensure quality:
- **Acceptance criteria**: What defines task completion
- **Validation steps**: How to verify the task works
- **Potential risks**: Known blockers and dependencies

**Success Indicator**: You have a clear, ordered list of tasks where each task is small enough to complete in one focused session (1-8 hours).

### ✅ Validation Checkpoint: Task Quality
Before starting implementation, verify each task:
- [ ] **Has clear completion criteria**: You know exactly when the task is "done"
- [ ] **Fits in single session**: Estimated at 1-8 hours maximum
- [ ] **Lists specific files**: Exact files to create/modify are identified  
- [ ] **Dependencies are clear**: Prerequisites are explicitly listed
- [ ] **Includes validation steps**: How to test that the task works

**Task Quality Self-Check:**
Rate each task on a scale of 1-5:
- **Clarity**: Is the task description specific and actionable?
- **Scope**: Can this be completed in one focused work session?
- **Dependencies**: Are all prerequisites clearly identified?
- **Validation**: Do I know how to verify this task is complete?

**Red Flags to Fix:**
- ❌ Tasks estimated over 8 hours (break them down further)
- ❌ Vague descriptions like "improve user experience" 
- ❌ Missing file specifications
- ❌ Circular dependencies between tasks
- ❌ No clear completion criteria

**Green Flags (Good Tasks):**
- ✅ "Create user registration form with email validation (3 hours)"
- ✅ "Add password reset API endpoint with token expiration (4 hours)"
- ✅ "Implement responsive navigation menu component (2 hours)"

---

## Chapter 3: The Build (`/task`)

### Story: "One Step at a Time"

Sarah has her roadmap, but now comes the actual building. How do you implement tasks systematically without breaking things?

The `/task` command acts like a senior developer mentor, guiding you through each implementation with a proven two-phase approach.

### Systematic Implementation Approach

The `/task` command follows a rigorous process:

1. **Automatic task selection** from `docs/tasks.json` (or user-guided selection)
2. **Two-phase execution**: Planning first, then implementation
3. **Context gathering** to understand existing code patterns
4. **Systematic implementation** following project conventions
5. **Progress tracking** with status updates

### Two-Phase Execution (Planning then Doing)

**Phase 1: Planning Phase**
- Analyzes current file state
- Understands dependencies and prerequisites
- Develops implementation strategy
- Achieves 95%+ confidence before proceeding
- Seeks explicit user approval

**Phase 2: Execution Phase**
- Updates task status to "in-progress"
- Implements changes following project patterns
- Handles errors systematically
- Marks completion and identifies next tasks

### Working Through Your First Task

Let's follow Sarah implementing her first task:

**Step 1: Task Selection**
```
/task
```
The command automatically selects DB-001 (first uncompleted task).

**Step 2: Planning Phase**
```
PLANNING PHASE - Task DB-001: Create notification database schema

Current State Analysis:
- File: config/database.js - Found existing migration pattern
- Function: migrate() - Uses sequential numbering system
- Dependencies: None - this is the foundation task
- Patterns: Snake_case table names, UUID primary keys

Implementation Plan:
- Create migration file following existing pattern
- Define notifications table with required fields
- Add foreign key to users table
- Include proper indexes for performance

Confidence Assessment: 98% confidence - clear implementation path

Analysis complete with 98% confidence. Ready to implement with systematic approach.
```

**Step 3: User Approval**
Sarah reviews the plan and approves: "Looks good, proceed with implementation."

**Step 4: Execution Phase**
The command:
- Updates task status to "in-progress" in `docs/tasks.json`
- Creates the migration file with proper structure
- Follows existing database patterns exactly
- Tests the migration in a safe environment

### Building Confidence Through Systematic Progress

Each completed task builds confidence:
- **Clear completion criteria** - you know when you're done
- **Validation steps** - you can verify it works
- **Progress tracking** - you see advancement
- **Pattern learning** - you understand the codebase better

### Task Completion Celebration

When DB-001 completes:
```
Task DB-001 completed successfully!

Files changed:
- migrations/001_create_notifications.sql (created)
- docs/tasks.json (status updated)

Next recommended task: DB-002 - Add user preference tables
Dependencies: None - ready to start immediately

SIR-ENGINEER, notification schema is now ready for the application.
```

**Success Indicator**: You can complete tasks confidently, understanding exactly what changed and why.

### ✅ Validation Checkpoint: Task Completion
After completing each task, verify:
- [ ] **Acceptance criteria met**: All requirements from the task are satisfied
- [ ] **Code follows patterns**: New code matches existing project conventions
- [ ] **Tests pass**: Existing tests still work, new tests added if needed
- [ ] **Documentation updated**: Changes reflected in relevant documentation
- [ ] **Next task unblocked**: Dependencies satisfied for subsequent tasks

**Implementation Quality Checklist:**
- [ ] **Code Quality**: Readable, well-structured, follows project patterns
- [ ] **Error Handling**: Appropriate error responses and edge case coverage
- [ ] **Performance**: No obvious performance issues introduced
- [ ] **Security**: No sensitive data exposed or security vulnerabilities added
- [ ] **Compatibility**: Works across intended browsers/platforms

**Common Implementation Mistakes:**
- **Not following existing patterns**: Check how similar features are implemented
- **Missing error handling**: Always plan for things that can go wrong
- **Incomplete testing**: Verify both happy path and error scenarios
- **Breaking existing functionality**: Run existing tests after changes
- **Poor commit messages**: Use clear, descriptive commit messages

**Task Completion Confidence Check:**
- Can I explain to someone else exactly what this task accomplished?
- Would I be comfortable deploying this change to production?
- Did I learn something about the codebase that will help with future tasks?

---

## Chapter 4: The Fix (`/debug`)

### Story: "When Things Go Wrong (And They Will)"

Sarah is implementing BE-002 (API endpoints) when something breaks. The server won't start, and the error message is confusing. This is where `/debug` becomes essential.

Software development includes problems—that's normal. The `/debug` command acts like a quality expert, helping you solve problems systematically rather than randomly trying fixes.

### Why Debugging is Part of the Journey

Debugging isn't failure—it's learning. Every problem teaches you about:
- How systems interact
- Where assumptions were wrong
- How to build more robust solutions
- Prevention strategies for future issues

### Systematic Problem-Solving Approach

The `/debug` command follows a methodical process:

1. **Root cause analysis** - understand why, not just what
2. **Hypothesis generation** - consider multiple possibilities
3. **Evidence gathering** - collect supporting information
4. **Solution proposal** - address underlying problems
5. **Prevention measures** - avoid similar issues

### Common Beginner Issues and Solutions

**Issue Type 1: Dependency Problems**
```
Error: Cannot find module 'express-validator'
```

**Debug Analysis:**
- Hypothesis 1: Package not installed
- Hypothesis 2: Wrong import path
- Hypothesis 3: Version mismatch

**Resolution:**
- Check package.json for missing dependency
- Verify import syntax matches documentation
- Install missing package with correct version

**Issue Type 2: Database Connection Issues**
```
Error: Connection refused to localhost:5432
```

**Debug Analysis:**
- Hypothesis 1: PostgreSQL not running
- Hypothesis 2: Wrong connection credentials
- Hypothesis 3: Database doesn't exist

**Resolution:**
- Start PostgreSQL service
- Verify environment variables
- Create database if missing

### Your First Debug Session

Sarah's error:
```
/debug Server crashes when starting - Error: Cannot read property 'id' of undefined in notifications.js:15
```

**Debug Analysis:**
```
Root Cause Analysis:

Hypothesis 1: User object undefined when creating notification
- Evidence: Error occurs at notifications.js:15
- Supporting: This line accesses user.id

Hypothesis 2: Database query returning null
- Evidence: user might be null from database
- Supporting: No error handling for failed user lookup

Hypothesis 3: Incorrect parameter passing
- Evidence: Function called with wrong arguments
- Supporting: New notification creation code

Resolution Proposal:
- Root cause: Missing null check for user object
- Solution: Add validation before accessing user.id
- Prevention: Implement consistent error handling pattern
```

**Implementation:**
```javascript
// Before (crashes)
const notificationUserId = user.id;

// After (safe)
if (!user) {
  throw new Error('User not found for notification');
}
const notificationUserId = user.id;
```

### Learning from Errors

Each debug session teaches valuable lessons:
- **Defensive programming**: Always validate inputs
- **Error handling patterns**: Consistent approach across codebase
- **Testing strategies**: How to prevent similar issues
- **System understanding**: How components interact

**Success Indicator**: You can systematically identify and fix problems while learning patterns to prevent similar issues.

### ✅ Validation Checkpoint: Debug Effectiveness
After each debug session, verify:
- [ ] **Root cause identified**: You understand why the problem occurred, not just what happened
- [ ] **Solution addresses cause**: Fix targets underlying issue, not just symptoms
- [ ] **Prevention measures added**: Steps taken to avoid similar problems
- [ ] **Knowledge gained**: You learned something about the system or debugging process
- [ ] **Documentation updated**: Solution and learning captured for future reference

**Debug Quality Assessment:**
Rate your debug session (1-5):
- **Problem Analysis**: Did I gather sufficient evidence before proposing solutions?
- **Solution Quality**: Does my fix address the root cause?
- **Prevention**: Did I add measures to prevent similar issues?
- **Learning**: Do I understand the system better now?

**Common Debug Pitfalls:**
- **Treating symptoms**: Fixing visible errors without understanding causes
- **Random solutions**: Trying fixes without understanding why they might work
- **No prevention**: Fixing the immediate issue but not preventing recurrence
- **Poor documentation**: Not capturing the learning for future debugging

**Debug Success Indicators:**
- ✅ **Systematic approach**: Followed hypothesis-evidence-solution process
- ✅ **Root cause focus**: Identified underlying problem, not just surface symptoms
- ✅ **Prevention added**: Implemented safeguards against similar issues
- ✅ **Knowledge transfer**: Documented solution for team/future reference

---

## Chapter 5: The Save (`/save`)

### Story: "Preserving Your Progress"

Sarah has been coding for hours and needs to wrap up her session. How do you capture everything you've accomplished and prepare for next time?

The `/save` command acts like a project historian, documenting your journey and ensuring no progress is lost.

### Why Documentation Matters

Good documentation:
- **Preserves context** for future sessions
- **Tracks decisions** and reasoning
- **Enables collaboration** with other developers
- **Prevents duplicate work** and maintains progress
- **Builds institutional knowledge** about the project

### Capturing Your Development Journey

The `/save` command creates comprehensive session documentation:

1. **Session summary** - what was accomplished
2. **File changes** - specific modifications made
3. **Task progress** - current status and next priorities
4. **Development environment** - dependencies and configuration
5. **Lessons learned** - insights and observations

### Preparing for Next Sessions

**Session State Documentation:**
```markdown
## Session Overview
Session State Summary: 3 tasks finished, 5 files modified, 30% project completion

## Actions Performed
- **migrations/001_create_notifications.sql**: Created notification schema (45 lines)
  - Functions added: up(), down()
  - Purpose: Foundation for notification storage
  - Impact: Enables notification persistence and querying

- **services/NotificationService.js**: Implemented core notification logic (120 lines)
  - Functions added: createNotification(), getUserNotifications(), markAsRead()
  - Purpose: Business logic for notification management
  - Impact: Provides API layer with notification operations

## Task Progress Status
Current Task: BE-003 - Implement WebSocket handling (in-progress)
Next Priority: BE-004 - Add email integration
Blocked Tasks: None
Ready Tasks: FE-001, FE-002 (backend foundation complete)
```

### Sharing Your Work

Documentation enables effective collaboration:
- **Clear change descriptions** help team members understand your work
- **Decision rationale** explains why choices were made
- **Next steps** guide future development
- **Blocker identification** prevents wasted effort

### Project Completion Celebration

When all tasks are complete:
```markdown
## Project Completion: User Notification System
All implementation tasks completed successfully!

Features delivered:
- Real-time notification delivery
- Email notification options
- User preference management
- Notification history with 30-day retention
- Responsive UI components

Next steps:
- User acceptance testing
- Performance optimization
- Production deployment
```

**Success Indicator**: Anyone (including future you) can understand exactly what was accomplished and continue the work effectively.

### ✅ Validation Checkpoint: Session Documentation
Before ending your session, verify your documentation includes:
- [ ] **Clear summary**: What was accomplished in measurable terms
- [ ] **File changes**: Specific modifications made and their purpose
- [ ] **Task progress**: Current status and next priorities clearly identified
- [ ] **Lessons learned**: Insights that will help future development
- [ ] **Blockers identified**: Any issues that need resolution before continuing

**Documentation Quality Check:**
- Can someone else pick up where I left off?
- Are all decisions and reasoning captured?
- Is the next session's starting point clear?
- Are any configuration or environment changes documented?

**Common Documentation Mistakes:**
- **Vague summaries**: "Fixed some bugs" vs "Resolved authentication timeout issue in user login flow"
- **Missing context**: What you changed but not why you changed it
- **No next steps**: Unclear what to work on next session
- **Lost decisions**: Important choices not captured for future reference

**Session Success Indicators:**
- ✅ **Progress measurable**: Can quantify what was accomplished
- ✅ **Context preserved**: Future you will understand the current state
- ✅ **Decisions documented**: Important choices and reasoning captured
- ✅ **Next steps clear**: Obvious starting point for next session

---

## Your First Complete Project

### Simple but Realistic Project Walkthrough

Let's walk through a complete mini-project using all five rules. We'll build a simple task reminder system—small enough to complete quickly, realistic enough to demonstrate the full workflow.

**Project Goal**: Build a personal task reminder that sends notifications when tasks are due.

### Using All Five Rules in Sequence

**Step 1: Vision with `/prd`**
```
/prd I want a simple task reminder system where I can add tasks with due dates and get notified when they're due
```

**Generated PRD Summary:**
- Personal task management with due date notifications
- Simple web interface for task creation and management
- Browser notifications when tasks are due
- Local storage for task persistence

**Functional Requirements:**
- FR-001: Task creation with title, description, and due date
- FR-002: Task list display with filtering options
- FR-003: Browser notifications 5 minutes before due time
- FR-004: Local storage persistence across browser sessions

**Step 2: Planning with `/decompose`**
```
/decompose
```

**Generated Tasks (tasks.json excerpt):**
```json
{
  "tasks": [
    {
      "id": "FE-001",
      "title": "Create task input form",
      "description": "Build HTML form with validation for task creation",
      "estimated_hours": 2,
      "files_affected": {
        "create": ["index.html", "style.css", "script.js"]
      }
    },
    {
      "id": "FE-002", 
      "title": "Build task list display",
      "description": "Create dynamic task list with edit/delete functionality",
      "estimated_hours": 3,
      "dependencies": ["FE-001"]
    },
    {
      "id": "FE-003",
      "title": "Implement notification system", 
      "description": "Add browser notification API with permission handling",
      "estimated_hours": 2,
      "dependencies": ["FE-002"]
    }
  ]
}
```

**Step 3: Building with `/task`**
```
/task FE-001
```

**Sample Implementation (FE-001):**
```html
<!-- index.html -->
<form id="taskForm">
  <input type="text" id="title" placeholder="Task title" required>
  <textarea id="description" placeholder="Description"></textarea>
  <input type="datetime-local" id="dueDate" required>
  <button type="submit">Add Task</button>
</form>
<div id="taskList"></div>
```

```javascript
// script.js
class TaskManager {
  constructor() {
    this.tasks = this.loadTasks();
    this.initializeForm();
    this.requestNotificationPermission();
  }
  
  addTask(title, description, dueDate) {
    const task = {
      id: Date.now(),
      title,
      description,
      dueDate: new Date(dueDate),
      completed: false
    };
    this.tasks.push(task);
    this.saveTasks();
    this.renderTasks();
    this.scheduleNotification(task);
  }
}
```

**Step 4: Fixing with `/debug`** (when needed)
```
/debug Notifications not appearing in Chrome
```

**Debug Analysis:**
```
Root Cause: Browser notification permission not granted
Solution: Add permission request with user feedback
Prevention: Check permission status before scheduling notifications

Fixed Implementation:
async requestNotificationPermission() {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Please enable notifications for task reminders");
    }
  }
}
```

**Step 5: Saving with `/save`**
```
/save
```

**Session Documentation:**
```markdown
## Task Reminder System - Session Complete

### Completed Features:
- ✅ Task creation form with validation
- ✅ Dynamic task list display  
- ✅ Browser notifications with permission handling
- ✅ Local storage persistence
- ✅ Responsive design for mobile

### Files Created:
- index.html (45 lines) - Main interface
- style.css (80 lines) - Responsive styling
- script.js (150 lines) - Task management logic

### Next Session:
- Add task editing functionality
- Implement task categories
- Add export/import features
```

### Common Pitfalls and How to Avoid Them

**Pitfall 1: Skipping the PRD**
- Problem: Jump straight to coding without clear requirements
- Solution: Always start with `/prd` to clarify the vision

**Pitfall 2: Making Tasks Too Large**
- Problem: Tasks that take more than a day to complete
- Solution: Use `/decompose` to break large tasks into smaller pieces

**Pitfall 3: Not Following Task Order**
- Problem: Implementing frontend before backend is ready
- Solution: Respect dependency order in tasks.json

**Pitfall 4: Ignoring Debug Output**
- Problem: Not understanding why problems occur
- Solution: Read debug analysis carefully and implement prevention measures

### Success Metrics and Next Steps

**Project Success Indicators:**
- [ ] All five rules used effectively
- [ ] Complete workflow from idea to implementation
- [ ] Working application that meets PRD requirements
- [ ] Documentation captures development journey
- [ ] Understanding of systematic development approach

### ✅ Final Validation Checkpoint: Complete Workflow Mastery
After completing your first full project, assess your understanding:

**Rule Mastery Self-Assessment (Rate 1-5):**
- **`/prd` Usage**: Can I transform vague ideas into clear, implementable requirements?
- **`/decompose` Skills**: Can I break complex features into manageable, ordered tasks?
- **`/task` Execution**: Can I implement tasks systematically with confidence?
- **`/debug` Effectiveness**: Can I solve problems systematically and learn from them?
- **`/save` Documentation**: Can I preserve context and progress effectively?

**Workflow Integration Check:**
- [ ] I understand how each rule builds on the previous ones
- [ ] I can identify when to use each rule appropriately
- [ ] I can troubleshoot issues when rules don't work as expected
- [ ] I can adapt the workflow to different types of projects
- [ ] I can explain the workflow to another beginner

**Confidence Indicators:**
- ✅ **Independent Usage**: Can use all five rules without referring to documentation
- ✅ **Problem Solving**: Can adapt when things don't go according to plan
- ✅ **Quality Output**: Produce working code that follows good practices
- ✅ **Knowledge Transfer**: Can teach the workflow to another beginner

**Next Steps:**
- Try more complex projects
- Experiment with advanced rule combinations
- Share your experience with other beginners
- Contribute to rule improvements

---

## Building Your Skills

### Practice Projects and Challenges

**Beginner Projects (2-4 hours each):**
1. **Calculator App**: Basic arithmetic with operation history
2. **Weather Widget**: Display current weather for user's location
3. **Note Taking**: Simple text notes with categories
4. **Color Palette**: Generate and save color combinations

**Intermediate Projects (1-2 days each):**
1. **Budget Tracker**: Income/expense tracking with categories
2. **Recipe Manager**: Store and search cooking recipes
3. **Habit Tracker**: Daily habit monitoring with streaks
4. **Photo Gallery**: Upload and organize images

**Advanced Projects (3-5 days each):**
1. **Project Management**: Tasks, deadlines, and team collaboration
2. **E-commerce Store**: Products, cart, and checkout flow
3. **Social Platform**: User posts, comments, and interactions
4. **Analytics Dashboard**: Data visualization and insights

### Advanced Patterns and Techniques

**Rule Combinations:**
- **`/prd` + `/decompose`**: Complete feature planning workflow
- **`/task` + `/debug`**: Implementation with error resolution
- **`/debug` + `/save`**: Problem-solving documentation

**Advanced Usage:**
- **Custom PRD templates**: Standardize requirements for your project types
- **Task batching**: Group related tasks for efficient development sessions
- **Debug patterns**: Build library of common solutions
- **Save automation**: Integrate with version control workflows

### Community Resources and Support

**Learning Resources:**
- **Cursor Documentation**: Official guides and tutorials
- **Developer Forums**: Community discussions and problem-solving
- **GitHub Examples**: Real projects using Cursor rules
- **Video Tutorials**: Step-by-step implementation guides

**Getting Help:**
- **Discord Community**: Real-time chat with other developers
- **Stack Overflow**: Tagged questions for specific problems
- **GitHub Issues**: Report bugs and request features
- **Office Hours**: Live Q&A sessions with experts

### Your Development Roadmap

**Month 1: Foundation Building**
- Master all five rules individually
- Complete 3-4 beginner projects
- Understand systematic development workflow
- Build confidence with basic debugging

**Month 2: Skill Integration**
- Tackle intermediate projects
- Experiment with rule combinations
- Develop personal development patterns
- Start contributing to community discussions

**Month 3: Advanced Application**
- Complete complex projects
- Mentor other beginners
- Contribute rule improvements
- Integrate with team workflows

**Ongoing: Continuous Improvement**
- Stay updated with new features
- Share your experiences and learnings
- Expand to advanced AI development techniques
- Build reputation in the community

---

## Conclusion

You've now learned how Cursor rules transform software development from chaotic coding to systematic collaboration with AI. The five-rule workflow provides structure while maintaining creativity, enabling you to build software with confidence.

**Remember the journey:**
- **`/prd`** turns ideas into clear specifications
- **`/decompose`** breaks complexity into manageable tasks
- **`/task`** guides systematic implementation
- **`/debug`** solves problems systematically
- **`/save`** preserves progress and knowledge

**Your next steps:**
1. Start with a simple project using all five rules
2. Focus on understanding the workflow, not perfection
3. Document your learning journey
4. Share your experience with other beginners

Welcome to the future of systematic AI-powered development. You're ready to build amazing things!