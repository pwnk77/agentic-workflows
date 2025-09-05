---
description: Comprehensive research and documentation workflow using researcher/synthesizer agents with integrated documentation generation and markdown-only context engineering
allowed-tools: Bash, Grep, Glob, Read, Write, Edit, MultiEdit, TodoWrite, Task
argument-hint: [sources_folder] <problem_statement>
---

# DOCUMENTATION ASSISTANCE COMMAND

**Goal**: Comprehensive research and documentation workflow using specialized 2-agent system (researcher + synthesizer) with integrated documentation generation, iterative feedback loops, and markdown-only context management.

**Process Overview**: You will act as a documentation coordinator orchestrating researcher and synthesizer agents while handling all documentation generation internally. The workflow uses markdown files in the docs/ folder for context storage and handover protocols.

**No MCP Integration**: This command operates entirely with two markdown files in a single folder for streamlined context management and agent handovers.

**Variables:**
```
sources_folder: $ARGUMENTS (optional: path to existing research materials/sources)
problem_statement: $ARGUMENTS (required: research topic or documentation need)
```

**Usage Pattern**: `/writer [sources-folder] <problem-statement>`

**Example Usage:**
- `/writer "API authentication best practices"`
- `/writer existing-docs "user onboarding process documentation"`
- `/writer research-materials "microservices architecture guide"`

## CONTEXT MANAGEMENT PROTOCOL

<context-storage-protocol>
Storage Strategy: Two-file markdown approach for streamlined context engineering

MARKDOWN CONTEXT MANAGEMENT:
- Use research/ folder for all context storage and agent handovers
- Create research/ folder if missing (new repositories)
- Working Document: research/[topic-slug]-log.md (comprehensive research, synthesis, and agent coordination)
- Final Output: research/[topic-slug]-final.md (polished, professional documentation)

CONTEXT ENGINEERING PRINCIPLES:
- All agent coordination and context preserved in the working log file
- Each agent reads and updates the shared log file for handovers
- All research findings, synthesis progress, and decisions documented in log
- Final output generated separately for clean professional presentation

CRITICAL: All context preservation and agent coordination through the shared log file only
</context-storage-protocol>

## PHASE 1: RESEARCH GOAL CLARIFICATION AND PLANNING

This phase transforms user requests into precise research objectives through systematic goal clarification with the researcher agent.

**Deep Analysis Protocol (Internal Monologue):**
Before deploying researcher agent, perform deep analysis and ULTRA THINK about the request

<thinking>
1. **Research Scope and Boundaries:**
   - What is the fundamental research question or documentation need?
   - What are the specific boundaries and focus areas for investigation?
   - What level of depth and technical detail is appropriate?
   - Are there existing sources or materials that must be incorporated?

2. **Target Audience and Use Case:**
   - Who will be the primary consumers of this documentation?
   - What is their technical background and context requirements?
   - How will this documentation be used (reference, training, decision-making)?
   - What format and presentation style best serves the audience?

3. **Success Criteria and Quality Standards:**
   - What constitutes comprehensive coverage of the research topic?
   - What level of source verification and reliability is required?
   - How should conflicting information or gaps be handled?
   - What are the completion criteria for research and documentation phases?

4. **Resource Integration and Constraints:**
   - How should existing materials in sources_folder be prioritized and integrated?
   - Are there time, scope, or resource constraints to consider?
   - What research approaches are most likely to yield high-quality results?
   - How can the workflow be optimized for efficiency without sacrificing quality?
</thinking>

**Context Engineering Setup:**
Initialize single working log file for all agent coordination and context preservation.

1. **Initialize Working Log:**
   Create `research/[topic-slug]-log.md` with:
   - User's original problem statement and requirements
   - Identified sources folder path and integration requirements
   - Initial analysis results and scope boundaries
   - Success criteria and research quality standards
   - Target audience and intended use case information
   - Research objectives section (to be refined by researcher)
   - Research streams tracking (6 parallel streams)
   - Source verification and quality tracking
   - Synthesis readiness indicators

**Researcher Agent Deployment:**

Deploy Task agent with researcher subagent for goal clarification:
```
TASK: Research Goal Clarification and Comprehensive Planning
SUBAGENT: researcher
WORKING_LOG: research/[topic-slug]-log.md
REQUIREMENTS:
1. Read working log and analyze user problem statement: "$ARGUMENTS"
2. Identify research scope ambiguities and boundaries needing clarification
3. Generate 5-7 targeted probing questions covering:
   - Research scope, depth, and specific focus areas
   - Target audience, technical level, and use case requirements
   - Success criteria, deliverables, and completion standards
   - Time constraints, resource priorities, and integration needs
4. Iterate with user until achieving 95%+ confidence in research objectives
5. Create comprehensive research plan with 6 parallel investigation streams
6. Update working log with refined objectives and planned approach
7. Prepare synthesis-ready research framework
SOURCES: $sources_folder (if provided - priority integration required)
OUTPUT: Research plan documented in working log with user approval
```

**Goal Confidence Assessment:**
Target: >95% confidence before proceeding to parallel research execution

**Acknowledgment:**
DOC-ASSIST goal clarification phase - Researcher deployed for objective refinement

"DOC-ASSIST, I have deployed the researcher agent to clarify research objectives for `[Problem Statement]`. The researcher will analyze requirements, identify scope boundaries, and create a comprehensive research plan through iterative goal clarification."

## PHASE 2: PARALLEL RESEARCH EXECUTION

Execute comprehensive multi-stream research investigation through researcher agent coordination.

**Researcher Agent Deployment for Investigation:**

Deploy Task agent with researcher subagent for comprehensive research:
```
TASK: Comprehensive Parallel Research Investigation
SUBAGENT: researcher  
WORKING_LOG: research/[topic-slug]-log.md
REQUIREMENTS:
1. Execute 6-stream parallel research approach based on approved plan:
   - Stream A: User-provided references and existing materials (priority integration)
   - Stream B: Academic and scholarly investigation with peer-reviewed sources
   - Stream C: Industry and professional sources with practical applications
   - Stream D: Primary documentation, official sources, and authoritative references
   - Stream E: Community insights, expert opinions, and practical experiences
   - Stream F: Historical context, foundational research, and evolution analysis
2. Document all findings with comprehensive A-F source quality ratings
3. Maintain detailed citations with verification status and reliability assessment
4. Update working log continuously with all research streams
5. Integrate sources_folder materials as priority Stream A content
6. Provide synthesis-ready research with comprehensive gap identification
7. Cross-verify critical claims with multiple high-quality sources
SOURCES: $sources_folder (priority integration as Stream A)
OUTPUT: Comprehensive working log with verified sources and synthesis-ready findings
```

**Research Quality Standards:**
- Minimum 3 high-quality sources per major research point
- Cross-verification of all critical claims with source diversity
- A-B grade sources prioritized with comprehensive verification status
- Source diversity across academic, industry, and primary documentation

**Research Completion Protocol:**
Researcher provides synthesis-ready working log with comprehensive findings across all streams.

## PHASE 3: ITERATIVE SYNTHESIS AND QUALITY VALIDATION

Transform research findings into cohesive insights through synthesizer agent collaboration with iterative feedback loops.

**Synthesis Context Engineering:**
Synthesizer uses the shared working log for all research results and quality requirements.

**Synthesizer Agent Deployment:**

Deploy Task agent with synthesizer subagent for research synthesis:
```
TASK: Research Synthesis with Goal Alignment and Quality Validation
SUBAGENT: synthesizer
WORKING_LOG: research/[topic-slug]-log.md
REQUIREMENTS:
1. Review comprehensive research findings in working log against original objectives
2. Assess coverage quality and reliability across all 6 research streams
3. Identify critical gaps requiring additional targeted research from researcher
4. Create thematic synthesis of verified findings with goal alignment validation
5. Collaborate iteratively with researcher agent until quality standards achieved
6. Maximum 3 iteration cycles with specific gap identification and resolution
7. Update working log with synthesis progress and quality assessments
8. Provide document type recommendation and structure guidance
9. Prepare synthesis for documentation generation phase
DELIVERABLE: Complete goal-aligned synthesis with comprehensive quality validation
```

**Synthesis Quality Gates:**
- All original research objectives addressed with supporting evidence
- Findings organized thematically for logical documentation flow
- Gaps and limitations clearly acknowledged with transparent assessment
- Quality evaluation evidence-based with source reliability verification

**Iterative Loop Management:**
When synthesizer identifies research gaps:

1. **Gap Analysis Documentation:**
   Synthesizer updates research log with specific gap identification and research requests

2. **Researcher Re-deployment:**
   Deploy researcher agent with focused gap investigation requirements
   ```
   TASK: Targeted Research Gap Investigation
   SUBAGENT: researcher
   WORKING_LOG: research/[topic-slug]-log.md
   REQUIREMENTS:
   1. Review synthesizer gap analysis and specific information needs
   2. Conduct focused investigation on identified gap areas using appropriate streams
   3. Provide additional sources and verification for gap areas
   4. Update working log with gap-specific findings and improved coverage
   5. Cross-reference new information with existing findings for consistency
   OUTPUT: Updated working log with comprehensive gap coverage
   ```

3. **Synthesis Validation:**
   Re-deploy synthesizer for gap coverage validation and synthesis completion

**Synthesis Completion:**
Synthesizer provides complete goal-aligned synthesis with document type recommendation.

## PHASE 4: INTEGRATED DOCUMENTATION GENERATION

Transform synthesized research into professional documentation using integrated documentation generation (no separate documenter agent).

**Document Type Classification and Style Selection:**

Based on synthesizer recommendations and research findings, conduct document type classification:

<thinking>
For optimal documentation approach:
1. **Document Type Assessment**: What type of document best serves the research objectives?
2. **Content Structure**: What organizational approach optimizes information flow?
3. **Audience Adaptation**: What tone and presentation style serves the target audience?
4. **Visual Enhancement**: Where do tables, diagrams, or formatting improve understanding?
5. **Professional Standards**: What formatting conventions ensure professional presentation?
</thinking>

**Document Type Options:**
Present document type selection based on synthesis findings:

> **DOCUMENT TYPE SELECTION**
> 
> **Synthesizer Recommendation**: [Document type from synthesis analysis]
> **Rationale**: [Why this type best serves research objectives and findings]
> 
> **Available Document Types:**
> 1. **Policy Document** - Organizational rules, governance, and compliance standards
> 2. **Procedure Guide** - Step-by-step operational instructions and workflows
> 3. **Framework Document** - Conceptual structures, methodologies, and systematic approaches
> 4. **Guidelines** - Best practices, recommendations, and advisory standards
> 5. **Technical Documentation** - System specifications, API docs, and implementation guides
> 6. **Blog/Article** - Engaging educational content and thought leadership
> 7. **Research Report** - Academic-style analysis, findings, and recommendations
> 8. **Strategic Plan** - Roadmaps, objectives, and implementation strategies
> 
> 🔔 DOCUMENT_TYPE_REQUEST: Confirm synthesizer recommendation or select different type
> 
> **DOC-ASSIST**, document type selection required before proceeding to documentation generation.

**Adaptive Documentation Generation:**

After document type confirmation, generate professional documentation using integrated approach:

**Content Development Process:**
1. **Structure Template Application**: Apply document type-specific structure and hierarchy
2. **Content Transformation**: Transform synthesis into document-specific format and tone
3. **Visual Enhancement Integration**: Add appropriate tables, diagrams, and formatting elements
4. **Professional Formatting**: Ensure compliance with document type standards and conventions
5. **Quality Assurance**: Validate formatting, flow, and professional presentation standards

**Document Type Structures and Styles:**

**Policy Document Generation:**
```markdown
# [Policy Title]
**Document ID**: [POL-XXX] | **Version**: 1.0 | **Effective Date**: [Date]

## 1. Purpose and Scope
[Authoritative, formal tone with clear mandates and organizational context]

## 2. Policy Statement
[Clear requirements using "must," "shall," "required" language]

## 3. Definitions
[Key terms and concepts with precise definitions]

## 4. Responsibilities
[Role-specific responsibilities with clear accountability]

## 5. Procedures
[Step-by-step compliance procedures with decision points]

## 6. Compliance and Enforcement
[Monitoring, reporting, and consequences for non-compliance]

## 7. Review and Revision
[Policy maintenance and update procedures]

## 8. Approval
[Approval signatures and authorization information]
```

**Procedure Guide Generation:**
```markdown
# [Procedure Title]
**Version**: 1.0 | **Last Updated**: [Date] | **Owner**: [Role/Department]

## Overview
[Clear purpose and scope in imperative instruction style]

## Prerequisites
[Required materials, permissions, and preparation steps]

## Step-by-Step Instructions
### Step 1: [Action Title]
[Clear imperative instructions with specific actions]
- Sub-step details with precise directions
- Expected outcomes and validation points

### Step 2: [Action Title]
[Continued sequential instructions]

## Troubleshooting
[Common issues and resolution steps]

## FAQs
[Frequently asked questions with clear answers]

## Related Documents
[Links to associated procedures and policies]
```

**Framework Document Generation:**
```markdown
# [Framework Name]

## Executive Summary
[Strategic overview with conceptual approach and key benefits]

## Framework Overview
[High-level conceptual structure and systematic approach]

## Core Principles
[Foundational concepts and guiding principles]

## Components and Relationships
[Detailed component descriptions with interaction models]

## Implementation Methodology
[Step-by-step implementation approach with phases]

## Governance and Oversight
[Management structure and decision-making processes]

## Success Metrics
[Measurement criteria and evaluation methods]

## Appendices
[Supporting materials and reference information]
```

**Guidelines Generation:**
```markdown
# [Guidelines Title]

## Introduction
[Advisory tone with "should," "recommend," "consider" language]

## Best Practices Overview
[Recommended approaches with flexibility acknowledgment]

## Implementation Guidelines
### Guideline 1: [Practice Area]
[Advisory recommendations with alternatives and considerations]
- Benefits and risk analysis
- Implementation tips and common pitfalls
- Adaptation guidance for different contexts

## Case Studies and Examples
[Real-world applications and lessons learned]

## Risk Mitigation
[Common challenges and recommended responses]

## Resources and Tools
[Supporting materials and implementation aids]
```

**Technical Documentation Generation:**
```markdown
# [System/API Name] Documentation

## Getting Started
[Precise technical language with setup requirements]

## Authentication
[Security requirements and implementation details]

## API Reference
### Endpoints
[Detailed endpoint documentation with parameters]
### Parameters
[Comprehensive parameter specifications]
### Response Formats
[Response structure with examples and error codes]

## Code Examples
[Implementation examples with syntax highlighting]

## Error Handling
[Error codes, troubleshooting, and resolution guidance]

## Integration Guides
[Step-by-step integration procedures]

## Changelog
[Version history and update information]
```

**Blog/Article Generation:**
```markdown
# [Engaging Title with Hook]

## Introduction
[Conversational tone with engaging opening and clear value proposition]

## Key Concepts
[Educational content with storytelling elements and relatable examples]

## Practical Applications
[Real-world scenarios and implementation guidance]

## Benefits and Considerations
[Value analysis with balanced perspective]

## Implementation Steps
[Actionable guidance with tips and best practices]

## Conclusion
[Summary with call-to-action and reader engagement]

## Further Reading
[Additional resources and next steps]
```

**Research Report Generation:**
```markdown
# [Research Report Title]

## Executive Summary
[Academic, analytical tone with evidence-based conclusions]

## Methodology
[Research approach and investigation methods]

## Literature Review
[Existing knowledge and comparative analysis]

## Findings
[Data presentation with analysis and statistical information]

## Discussion
[Interpretation of findings with implications]

## Limitations
[Research constraints and areas for future investigation]

## Conclusions and Recommendations
[Evidence-based conclusions with actionable recommendations]

## References
[Complete source attribution and bibliography]
```

**Strategic Plan Generation:**
```markdown
# [Strategic Plan Title]

## Executive Summary
[Visionary, forward-looking tone with clear strategic direction]

## Strategic Objectives
[SMART goals with measurable outcomes and success criteria]

## Current State Analysis
[Situational assessment with strengths and opportunities]

## Strategic Initiatives
[Major projects and programs with resource allocation]

## Implementation Timeline
[Milestone tracking with phases and deliverables]

## Resource Requirements
[Budget, personnel, and infrastructure needs]

## Risk Assessment
[Potential challenges with mitigation strategies]

## Success Metrics
[Key performance indicators and measurement methods]

## Governance and Oversight
[Management structure and accountability frameworks]
```

**Visual Enhancement Integration:**

Add document type-appropriate visual elements:
- **Policy/Procedure**: Numbered lists, decision trees, compliance matrices
- **Framework/Guidelines**: Process diagrams, conceptual models, comparison tables
- **Technical Documentation**: Code blocks, API tables, integration diagrams
- **Blog/Article**: Engaging formatting, pull quotes, scannable structure
- **Research Report**: Data tables, statistical presentations, chart placeholders
- **Strategic Plan**: Timeline charts, milestone tracking, responsibility matrices

**Professional Formatting Standards:**
- Clean, scannable layout with appropriate white space
- Consistent heading hierarchy and navigation structure
- Strategic emphasis on key findings and recommendations
- Print-friendly formatting that works across platforms
- Citation-free final output with professional presentation

## PHASE 5: QUALITY ASSURANCE AND COMPLETION

**Final Quality Review:**
1. **Content Accuracy**: Verify synthesis insights accurately represented without citations
2. **Structure Compliance**: Confirm document follows appropriate type template
3. **Style Consistency**: Validate document type style applied throughout
4. **Visual Enhancement**: Check visual elements match document type conventions
5. **Professional Standards**: Ensure formatting meets organizational requirements

**File Management:**
- **Working Document**: `research/[topic-slug]-log.md` (comprehensive research, citations, synthesis)
- **Final Output**: `research/[topic-slug]-final.md` (professional, citation-free documentation)

**Workflow Completion Protocol:**

🔔 DOC_ASSIST_COMPLETE: Comprehensive research and documentation workflow finished - 2-agent collaboration with integrated documentation generation complete

"DOC-ASSIST analysis complete for `[Problem Statement]`. Comprehensive documentation workflow delivered:
- **Research Phase**: [X] parallel streams investigated with [Y] verified sources
- **Synthesis Phase**: [Z] iterations with quality validation and goal alignment
- **Documentation Type**: [Document Type] with professional formatting and visual enhancements
- **Final Deliverables**: 
  - `research/[topic-slug]-log.md` (comprehensive research and synthesis)
  - `research/[topic-slug]-final.md` (professional [Document Type] ready for publication)

Documentation complete with streamlined two-file markdown workflow."

---

## WORKFLOW COORDINATION AND CONTEXT ENGINEERING

**Agent Communication Pattern:**
- **Shared Log Handoffs**: All agents read/write context through single working log file
- **Quality Gates**: User approval required at major phase transitions
- **Iterative Loops**: Synthesizer-researcher collaboration until standards met
- **Context Preservation**: All decisions, findings, and protocols documented in working log

**Context Engineering Protocols:**
- **Single Working Log**: All agent coordination through shared log file
- **Shared State**: Working log maintains all findings and synthesis progress
- **Streamlined Handoffs**: Agent outputs update shared log for seamless coordination
- **Quality Tracking**: All quality assessments and iterations documented in working log

**Success Metrics:**
- 95%+ confidence in goal clarification phase
- Comprehensive coverage across all research objectives
- Source diversity with A-B grade verification for critical claims
- Successful synthesis-researcher iteration loops (max 3 cycles)
- Professional documentation meeting publication standards

**Error Handling:**
- Maximum 3 synthesis-research iteration cycles before escalation
- Gap identification and transparent limitation acknowledgment
- Source verification and reliability assessment throughout process
- User escalation if goals cannot be met within iteration limits

---

## USAGE EXAMPLES

```bash
# Basic research and documentation request
/doc-assist "API authentication best practices"

# With existing sources folder
/doc-assist research-materials "microservices architecture guide"

# Complex policy documentation
/doc-assist existing-policies "remote work policy framework"

# Technical documentation with sources
/doc-assist api-docs "database migration procedures"

# Strategic planning documentation  
/doc-assist planning-docs "digital transformation roadmap"
```

**Integration Workflow:**
1. **Goal Clarification**: Researcher agent refines objectives through iterative questioning
2. **Comprehensive Research**: Researcher conducts parallel investigation across 6 streams
3. **Quality Synthesis**: Synthesizer creates goal-aligned insights with iterative refinement
4. **Professional Documentation**: Integrated generation with document type specialization
5. **Quality Assurance**: Final validation and professional presentation standards

**Context Management:**
All agent coordination through shared working log file with streamlined context engineering ensuring perfect handovers and information preservation throughout the workflow.