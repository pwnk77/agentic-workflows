---
description: Research and documentation workflow using 3-agent system with goal clarification, parallel research, synthesis loops, and high-quality markdown output
allowed-tools: Bash, Grep, Glob, Read, Write, TodoWrite, Task
argument-hint: [sources_folder] <problem_statement>
---

# DOCUMENTATION ASSISTANCE COMMAND

**Goal**: Comprehensive research and documentation workflow using specialized 3-agent system with iterative feedback loops and approval gates.

**Variables:**
```
sources_folder: $ARGUMENTS (optional: path to existing research materials/sources)
problem_statement: $ARGUMENTS (required: research topic or documentation need)
```

## PHASE 1: RESEARCH GOAL CLARIFICATION

**Research Analyst Agent Invocation:**

<thinking>
- What is the user's fundamental research objective?
- What scope, depth, and audience considerations are needed?
- What success criteria should guide the research?
- Are there existing sources or materials to incorporate?
</thinking>

Deploy Task agent with researcher subagent:
```
TASK: Research Goal Clarification and Planning
SUBAGENT: researcher
REQUIREMENTS:
1. Analyze problem statement: "$ARGUMENTS"
2. Identify ambiguities and scope boundaries
3. Generate 5-7 probing questions covering:
   - Research scope and boundaries
   - Required depth and specificity
   - Target audience and use case
   - Success criteria and deliverables
   - Time constraints and priorities
4. Create research plan with 95%+ confidence
5. Document objectives in docs/[topic]-research-log.md
SOURCES: $sources_folder (if provided)
DELIVERABLE: Research plan with refined objectives and user approval
```

**Goal Confidence Assessment:**
Target: >95% confidence before proceeding to parallel research phase

> **RESEARCH PLAN SUMMARY**
> 
> **Topic**: [Research subject]
> **Scope**: [Boundaries and focus areas]
> **Audience**: [Target consumers of research]
> **Success Criteria**: [How completeness is measured]
> **Sources**: [Existing materials to incorporate]
> 
> **Planned Research Streams:**
> 1. User-Provided References & Existing Materials (Priority Integration)
> 2. Academic & Scholarly Investigation
> 3. Industry & Professional Sources
> 4. Primary Documentation & Official Sources
> 5. Community Insights & Practical Applications
> 6. Historical Context & Foundational Research
> 
> **Deliverables:**
> - docs/[topic]-research-log.md (comprehensive findings with citations)
> - docs/[topic]-report.md (final polished documentation)
> 
> **Confidence:** [X]% - [Justification]
> 
> 🔔 APPROVAL_REQUEST: User approval required
> 
> **RESEARCHER**, plan ready. Confirm approval to proceed.

## PHASE 2: PARALLEL RESEARCH EXECUTION

**Research Execution Protocol:**

Deploy Task agent with researcher subagent:
```
TASK: Comprehensive Parallel Research Investigation  
SUBAGENT: researcher
REQUIREMENTS:
1. Execute 6-stream parallel research approach:
   - Stream A: User-provided references and existing materials (priority integration)
   - Stream B: Academic and scholarly investigation
   - Stream C: Industry and professional sources
   - Stream D: Primary documentation and official sources
   - Stream E: Community insights and practical applications
   - Stream F: Historical context and foundational research
2. Document all findings with A-F source quality ratings
3. Maintain comprehensive citations and verification status
4. Update docs/[topic]-research-log.md continuously
5. Provide synthesis-ready research with gap identification
DELIVERABLE: Comprehensive research log with verified sources and findings
```

**Research Quality Standards:**
- Minimum 3 high-quality sources per major research point
- Cross-verification of all critical claims
- Source diversity across academic, industry, and primary sources
- A-B grade sources prioritized with verification status

## PHASE 3: ITERATIVE SYNTHESIS LOOP

**Synthesis and Quality Validation:**

Deploy Task agent with synthesizer subagent:
```
TASK: Research Synthesis with Goal Alignment Review
SUBAGENT: synthesizer  
REQUIREMENTS:
1. Review research findings against original objectives
2. Assess coverage and quality of all research streams
3. Identify critical gaps requiring additional research
4. Create thematic synthesis of verified findings
5. Collaborate iteratively with researcher until quality standards met
6. Maximum 3 iteration cycles before escalation
7. Update docs/[topic]-research-log.md with synthesis progress
DELIVERABLE: Complete synthesis with goal achievement assessment
```

**Synthesis Quality Gates:**
- All original research objectives addressed with supporting evidence
- Findings organized thematically for logical flow
- Gaps and limitations clearly acknowledged
- Quality assessment transparent and evidence-based

**Iterative Loop Pattern:**
1. **Synthesizer**: Gap analysis and research requests
2. **Researcher**: Targeted investigation of gap areas  
3. **Synthesizer**: Quality validation and completeness review
4. **Iteration**: Repeat until synthesis meets standards
5. **Approval Gate**: Present complete synthesis for validation

## PHASE 4: DOCUMENT TYPE SELECTION

**Document Type Classification:**

Deploy Task agent with documenter subagent for type selection:
```
TASK: Document Type Classification and Style Selection
SUBAGENT: documenter
REQUIREMENTS:
1. Present document type options to user:
   - Policy Document (organizational rules, governance)
   - Procedure Guide (step-by-step instructions)
   - Framework Document (methodologies, systematic approaches)
   - Guidelines (best practices, recommendations)
   - Technical Documentation (specs, API docs, implementation)
   - Blog/Article (engaging educational content)
   - Research Report (academic-style analysis)
   - Strategic Plan (roadmaps, implementation strategies)
2. Obtain user selection for document type
3. Consider synthesizer's document type recommendation from research log
4. Configure appropriate writing style and structure template
5. Plan document-specific visual enhancements
DELIVERABLE: Confirmed document type with style configuration
```

> **DOCUMENT TYPE CHECKPOINT**
> 
> **Synthesizer Recommendation**: [Document type recommended based on research findings]
> **Rationale**: [Why this type best serves the objectives]
> 
> **Available Document Types:**
> 1. **Policy Document** - Organizational rules and governance standards
> 2. **Procedure Guide** - Step-by-step operational instructions  
> 3. **Framework Document** - Conceptual structures and methodologies
> 4. **Guidelines** - Best practices and recommendations
> 5. **Technical Documentation** - System specs and implementation guides
> 6. **Blog/Article** - Engaging educational content
> 7. **Research Report** - Academic-style analysis and findings
> 8. **Strategic Plan** - Roadmaps and implementation strategies
> 
> 🔔 DOCUMENT_TYPE_REQUEST: Confirm synthesizer recommendation or select different type
> 
> **DOCUMENTER**, document type selection required before proceeding.

## PHASE 5: PROFESSIONAL DOCUMENTATION

**Adaptive Documentation Creation:**

Deploy Task agent with documenter subagent:
```
TASK: Professional Documentation Creation with Adaptive Style
SUBAGENT: documenter
REQUIREMENTS:
1. Apply selected document type style and structure template
2. Transform synthesis into document-specific format and tone
3. Integrate document-type appropriate visual enhancements:
   - Policy/Procedure: Numbered lists, decision trees, compliance matrices
   - Framework/Guidelines: Process diagrams, conceptual models, comparison tables
   - Technical Documentation: Code blocks, API tables, integration diagrams
   - Blog/Article: Engaging elements, pull quotes, social media formatting
   - Research Report: Data visualizations, statistical tables
   - Strategic Plan: Timeline charts, milestone tracking, responsibility matrices
4. Ensure compliance with document type standards and conventions
5. Generate docs/[topic]-report.md as final deliverable
6. Maintain all citations in research log only
DELIVERABLE: Publication-ready document with type-appropriate formatting
```

**Document Type Standards:**
- Document-specific structure and formatting conventions
- Appropriate tone and language for selected document type
- Type-specific visual enhancements and organizational patterns
- Professional presentation matching organizational standards
- Citation-free final output with comprehensive formatting

## WORKFLOW COORDINATION

**Agent Communication Pattern:**
- **Document-Based Handoffs**: Each agent updates and reads from research log
- **Quality Gates**: User approval required at major phase transitions
- **Iterative Loops**: Synthesizer-researcher collaboration until standards met
- **Final Validation**: All deliverables reviewed before completion

**File Management:**
- **Working Document**: `docs/[topic]-research-log.md` (all research, citations, synthesis)
- **Final Output**: `docs/[topic]-report.md` (clean, professional documentation)
- **Sources Integration**: Existing materials in $sources_folder incorporated as appropriate

## SUCCESS METRICS

**Research Quality Indicators:**
- 95%+ confidence in goal clarification phase
- Comprehensive coverage across all research objectives
- Source diversity with A-B grade verification for critical claims
- Successful synthesis-researcher iteration loops
- Professional documentation meeting publication standards

**Completion Signals:**
- **🔔 RESEARCH_COMPLETE**: Comprehensive research finished across parallel streams
- **🔔 SYNTHESIS_COMPLETE**: Goal-aligned synthesis with quality validation
- **🔔 DOCUMENT_TYPE_SELECTED**: Document type confirmed with style configuration
- **🔔 DOCUMENTATION_COMPLETE**: Professional document type ready for publication

## ERROR HANDLING

**Quality Control Measures:**
- Maximum 3 synthesis-research iteration cycles
- Escalation to user if goals cannot be met within iterations
- Gap identification and transparent limitation acknowledgment
- Source verification and reliability assessment throughout process

**Completion:**
🔔 DOC_ASSIST_COMPLETE: Research and documentation workflow finished - comprehensive 3-agent collaboration complete

"Research and documentation complete with high-quality deliverables in `docs/[topic]-research-log.md` (comprehensive findings) and `docs/[topic]-report.md` (professional documentation)."