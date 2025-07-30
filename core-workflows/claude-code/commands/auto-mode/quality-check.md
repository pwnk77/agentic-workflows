---
description: Parallel specialist analysis with SPEC ecosystem integration and engineer delegation for automated fixes
allowed-tools: Task, TodoWrite
argument-hint: <scope-description>
---

# QUALITY-CHECK WORKFLOW COMMAND

**Goal**: Engage specialized agents (quality, performance, security) in parallel to generate comprehensive SPEC documents, then engineer implements fixes from SPEC requirements, and debugger handles any issues during implementation.

**Variables:**
```
scope_description: $ARGUMENTS (required: scope and focus areas for specialist analysis)
```

## ENHANCED PARALLEL SPECIALIST EXECUTION CHAIN

**Chain Flow**: `quality` || `performance` || `security` → **SPEC Generation** → `engineer` (implements from SPEC) → `debugger` (if issues arise)

**Expected Outcome**: Complete specialist SPEC ecosystem with engineer implementation from SPEC requirements and debugger support for any implementation issues.

## PHASE 1: ENHANCED PARALLEL SPECIALIST ANALYSIS WITH SPEC GENERATION

**Execution Strategy**: Launch three enhanced specialists simultaneously for comprehensive SPEC ecosystem creation

### Enhanced Security Specialist Agent
**Agent**: `security` (Enhanced with SEC-SPEC generation)
**Focus**: Comprehensive security analysis with SPEC document creation
**Wait Condition**: SEC-SPEC document completion with actionable recommendations

**Execution**:
```bash
Task(
  description="Enhanced security analysis with SEC-SPEC generation",
  prompt="Perform comprehensive security analysis with SPEC document generation: '$ARGUMENTS'. 

ENHANCED SECURITY SPECIALIST REQUIREMENTS:
- Create comprehensive SEC-SPEC document with OWASP compliance evaluation
- Analyze authentication, authorization, input validation, data protection systematically
- Identify dependency vulnerabilities and supply chain risks with mitigation strategies
- Assess API security, infrastructure security, and threat modeling comprehensively
- Generate actionable security recommendations with implementation priorities
- Cross-reference with existing master SPEC document for architectural integration
- Document security compliance requirements and validation frameworks
- Provide clear implementation requirements for engineer execution

SEC-SPEC DOCUMENT REQUIREMENTS:
- Vulnerability assessment with risk scoring and mitigation strategies
- Security implementation roadmap with priority levels
- Compliance validation framework with automated testing recommendations
- Cross-domain security impact assessment for quality and performance integration
- Specific implementation requirements for engineer execution",
  subagent_type="security"
)
```

**Enhanced Security Analysis with SPEC Integration**:
- **Threat Modeling**: Complete attack surface analysis with SPEC documentation
- **Compliance Framework**: OWASP, PCI DSS, GDPR compliance with implementation roadmap
- **Vulnerability Management**: Systematic assessment with remediation priorities
- **Security Architecture**: Integration patterns with existing SPEC ecosystem
- **Automated Security Testing**: Framework recommendations for continuous validation
- **Implementation Requirements**: Specific tasks with security validation criteria for engineer

### Enhanced Performance Specialist Agent
**Agent**: `performance` (Enhanced with PERF-SPEC generation)
**Focus**: Comprehensive performance analysis with SPEC document creation
**Wait Condition**: PERF-SPEC document completion with optimization roadmap

**Execution**:
```bash
Task(
  description="Enhanced performance analysis with PERF-SPEC generation",
  prompt="Perform comprehensive performance analysis with SPEC document generation: '$ARGUMENTS'. 

ENHANCED PERFORMANCE SPECIALIST REQUIREMENTS:
- Create comprehensive PERF-SPEC document with scalability and optimization roadmap
- Analyze database performance, application efficiency, and infrastructure scaling systematically
- Identify bottlenecks with quantified performance impact and improvement opportunities
- Assess frontend performance, network optimization, and monitoring strategies comprehensively
- Generate actionable performance recommendations with measurable targets
- Cross-reference with existing master SPEC document for architectural integration
- Document performance benchmarks and validation frameworks
- Provide clear delegation tasks for engineer implementation

PERF-SPEC DOCUMENT REQUIREMENTS:
- Bottleneck analysis with quantified impact assessment and optimization strategies
- Performance implementation roadmap with measurable improvement targets
- Scalability validation framework with load testing recommendations
- Cross-domain performance impact assessment for security and quality integration
- Engineer delegation tasks with specific optimization requirements",
  subagent_type="performance"
)
```

**Enhanced Performance Analysis with SPEC Integration**:
- **Scalability Assessment**: Comprehensive capacity planning with SPEC documentation
- **Optimization Roadmap**: Prioritized improvements with measurable targets
- **Monitoring Framework**: Performance metrics and alerting system recommendations
- **Database Optimization**: Query analysis and indexing strategies with implementation guides
- **Frontend Performance**: Bundle optimization and rendering efficiency improvements
- **Implementation Requirements**: Specific optimization tasks with performance validation criteria for engineer

### Enhanced Quality Specialist Agent
**Agent**: `quality` (Enhanced with QUAL-SPEC generation)
**Focus**: Comprehensive quality analysis with SPEC document creation
**Wait Condition**: QUAL-SPEC document completion with maintainability roadmap

**Execution**:
```bash
Task(
  description="Enhanced quality analysis with QUAL-SPEC generation",
  prompt="Perform comprehensive quality analysis with SPEC document generation: '$ARGUMENTS'. 

ENHANCED QUALITY SPECIALIST REQUIREMENTS:
- Create comprehensive QUAL-SPEC document with multi-domain quality assessment
- Analyze test coverage, code maintainability, and technical debt systematically
- Assess architecture compliance, error handling, and team development standards
- Integrate security awareness and performance considerations into quality analysis
- Generate actionable quality recommendations with implementation priorities
- Cross-reference with existing master SPEC document for architectural integration
- Document quality validation frameworks and automated testing strategies
- Provide clear delegation tasks for engineer implementation

QUAL-SPEC DOCUMENT REQUIREMENTS:
- Technical debt assessment with refactoring priorities and maintenance burden analysis
- Quality implementation roadmap with test coverage improvements and code standards
- Risk assessment matrix with cross-domain quality correlation
- Multi-domain integration for security awareness and performance consideration
- Engineer delegation tasks with specific quality improvement requirements",
  subagent_type="quality"
)
```

**Enhanced Quality Analysis with SPEC Integration**:
- **Multi-Domain Quality Assessment**: Quality analysis with security awareness and performance consideration
- **Technical Debt Management**: Systematic assessment with refactoring roadmap
- **Test Coverage Enhancement**: Comprehensive testing strategy with automation frameworks
- **Architecture Compliance**: Pattern adherence with long-term sustainability focus
- **Cross-Domain Integration**: Quality correlation with security and performance requirements
- **Implementation Requirements**: Specific quality improvement tasks with validation criteria for engineer

**Enhanced Parallel Completion Signals**:
- **🔔 SEC_SPEC_COMPLETE**: Enhanced security analysis finished with SEC-SPEC document and implementation requirements
- **🔔 PERF_SPEC_COMPLETE**: Enhanced performance analysis finished with PERF-SPEC document and optimization requirements  
- **🔔 QUAL_SPEC_COMPLETE**: Enhanced quality analysis finished with QUAL-SPEC document and improvement requirements

**⚠️ APPROVAL CHECKPOINT**: Human approval required to review all specialist SPEC documents and implementation requirements before proceeding to engineer execution

## PHASE 2: ENGINEER IMPLEMENTATION FROM SPEC ECOSYSTEM

**Trigger**: All three specialist SPEC documents complete with implementation requirements
**Agent**: `engineer` (Enhanced with specialist SPEC integration)
**Process**: Implement all specialist requirements from SPEC documents with coordinated execution

**Execution**:
```bash
Task(
  description="Specialist implementation from SPEC ecosystem",
  prompt="Implement all specialist requirements from SPEC ecosystem: Read and integrate 'docs/SEC-SPEC-YYYYMMDD-[scope].md', 'docs/PERF-SPEC-YYYYMMDD-[scope].md', and 'docs/QUAL-SPEC-YYYYMMDD-[scope].md'. 

ENHANCED ENGINEER IMPLEMENTATION REQUIREMENTS:
- Read all three specialist SPEC documents for comprehensive context
- Implement security requirements with SEC-SPEC compliance validation
- Execute performance optimizations with PERF-SPEC benchmark targets
- Apply quality improvements with QUAL-SPEC standards adherence
- Use intelligent parallel processing for independent specialist tasks
- Coordinate cross-domain implementations where specialist requirements overlap
- Document implementation progress in each respective SPEC document
- Validate implementation against specialist criteria and acceptance standards
- Hand off to debugger if implementation issues arise during execution

SPECIALIST INTEGRATION PROTOCOL:
- Prioritize critical security implementations first for risk mitigation
- Execute performance optimizations with measurable validation
- Apply quality improvements with test coverage and maintainability focus
- Coordinate implementations where multiple specialist domains overlap
- Update each SPEC document with implementation status and validation results
- Ensure all implementations meet specialist validation criteria
- If issues arise during implementation, collaborate with debugger for systematic resolution",
  subagent_type="engineer"
)
```

**Enhanced Implementation Coordination**:
1. **Multi-SPEC Context Loading**: Engineer reads all specialist SPEC documents for comprehensive understanding
2. **Priority-Based Implementation**: Execute critical security tasks first, then performance and quality
3. **Parallel Processing**: Use intelligent concurrency for independent specialist tasks
4. **Cross-Domain Coordination**: Handle overlapping requirements with specialist integration
5. **SPEC Documentation Updates**: Update each specialist document with implementation progress
6. **Validation Integration**: Ensure implementations meet all specialist criteria
7. **Debugger Collaboration**: Hand off to debugger for systematic issue resolution when needed

## PHASE 3: DEBUGGER SUPPORT (IF NEEDED)

**Trigger**: Implementation issues arise during engineer execution
**Agent**: `debugger` (Systematic root cause analysis)
**Process**: Systematic debugging with multiple hypothesis testing and resolution

**Execution**:
```bash
Task(
  description="Systematic debugging of implementation issues",
  prompt="Debug implementation issues from SPEC-based execution: Analyze failures in specialist implementation requirements from SPEC documents.

DEBUGGER IMPLEMENTATION SUPPORT REQUIREMENTS:
- Load context from master SPEC document and specialist SPEC documents
- Identify root cause of implementation failures using multiple hypothesis framework
- Focus on fundamental issues, not just symptoms
- Create failing tests that expose the core problem
- Collaborate with engineer for systematic fix implementation
- Document debug session in master SPEC Debug Log section
- Ensure resolution validates against specialist SPEC requirements

ROOT CAUSE ANALYSIS PROTOCOL:
- Hypothesis 1 (Logic Error): Implementation logic or algorithm issues
- Hypothesis 2 (Integration Error): Specialist requirement integration problems  
- Hypothesis 3 (Environment Error): Configuration or dependency issues
- Hypothesis 4 (Specification Error): SPEC requirements unclear or conflicting
- Evidence-based investigation with systematic validation
- Test-driven fix approach with engineer collaboration",
  subagent_type="debugger"
)
```

## PHASE 4: SPECIALIST SPEC VALIDATION (OPTIONAL)

**Trigger**: Engineer implementation complete (or debugger resolution complete if Phase 3 occurred)
**Agents**: `security` || `performance` || `quality` (Parallel validation)
**Process**: Each specialist validates their respective implementations against SPEC requirements

### Security SPEC Loop Closure
```bash
Task(
  description="Security SPEC loop closure with validation",
  prompt="Validate security implementations and close SEC-SPEC loop: Review engineer implementations in 'docs/SEC-SPEC-YYYYMMDD-[scope].md'. 

SECURITY SPEC LOOP CLOSURE REQUIREMENTS:
- Validate all security delegation tasks have been implemented correctly
- Test security implementations against OWASP compliance criteria
- Verify vulnerability mitigations are effective and properly implemented
- Confirm security benchmarks and validation frameworks are operational
- Update SEC-SPEC document with implementation validation results
- Document any remaining security tasks or follow-up requirements
- Close security loop with comprehensive validation confirmation
- Generate security compliance certification for implemented features",
  subagent_type="security"
)
```

### Performance SPEC Loop Closure
```bash
Task(
  description="Performance SPEC loop closure with validation",
  prompt="Validate performance implementations and close PERF-SPEC loop: Review engineer implementations in 'docs/PERF-SPEC-YYYYMMDD-[scope].md'. 

PERFORMANCE SPEC LOOP CLOSURE REQUIREMENTS:
- Validate all performance delegation tasks meet measurable improvement targets
- Test performance optimizations against benchmark requirements
- Verify scalability improvements and bottleneck resolutions are effective
- Confirm performance monitoring and validation frameworks are operational
- Update PERF-SPEC document with performance validation results
- Document any remaining optimization tasks or scaling considerations
- Close performance loop with quantified improvement confirmation
- Generate performance compliance certification with benchmark validation",
  subagent_type="performance"
)
```

### Quality SPEC Loop Closure
```bash
Task(
  description="Quality SPEC loop closure with validation",
  prompt="Validate quality implementations and close QUAL-SPEC loop: Review engineer implementations in 'docs/QUAL-SPEC-YYYYMMDD-[scope].md'. 

QUALITY SPEC LOOP CLOSURE REQUIREMENTS:
- Validate all quality delegation tasks improve maintainability and test coverage
- Test quality improvements against technical debt reduction targets
- Verify code quality standards and architectural compliance implementations
- Confirm quality validation frameworks and automated testing are operational
- Update QUAL-SPEC document with quality validation results
- Document any remaining quality improvements or refactoring considerations
- Close quality loop with comprehensive improvement confirmation
- Generate quality compliance certification with standards validation",
  subagent_type="quality"
)
```

**Enhanced SPEC Loop Closure Protocol**:
1. **Implementation Validation**: Each specialist validates their respective engineer implementations
2. **Compliance Testing**: Verify implementations meet specialist criteria and standards
3. **SPEC Document Updates**: Update respective SPEC documents with validation results
4. **Loop Closure Confirmation**: Each specialist confirms their loop is closed with evidence
5. **Cross-Domain Validation**: Ensure implementations don't conflict across specialist domains
6. **Final Certification**: Generate compliance certifications for implemented improvements

**SPEC Loop Closure Completion Signals**:
- **🔔 SEC_LOOP_CLOSED**: Security implementations validated and SEC-SPEC loop closed with compliance certification
- **🔔 PERF_LOOP_CLOSED**: Performance implementations validated and PERF-SPEC loop closed with benchmark confirmation
- **🔔 QUAL_LOOP_CLOSED**: Quality implementations validated and QUAL-SPEC loop closed with standards certification

**⚠️ APPROVAL CHECKPOINT**: Human approval required for all specialist SPEC loop closures and implementation validation

## ENHANCED WORKFLOW COORDINATION WITH SPEC ECOSYSTEM

### Enhanced Parallel Execution Management

**Phase 1 - Simultaneous SPEC Generation**: All three specialists start analysis and SPEC creation concurrently
**Phase 2 - Engineer Implementation**: Engineer reads all SPEC documents and executes implementation requirements with parallel processing
**Phase 3 - Debugger Support**: If implementation issues arise, debugger provides systematic root cause analysis and resolution  
**Phase 4 - Specialist Validation**: Specialists validate implementations against their SPEC requirements (optional)
**Context Preservation**: Complete SPEC ecosystem maintained with cross-references and implementation history

### Enhanced Document Flow with SPEC Ecosystem

**Phase 1 - Specialist SPEC Documents Generated**:
- `docs/SEC-SPEC-YYYYMMDD-[scope].md` (Security specialist analysis with delegation tasks)
- `docs/PERF-SPEC-YYYYMMDD-[scope].md` (Performance specialist analysis with optimization roadmap)
- `docs/QUAL-SPEC-YYYYMMDD-[scope].md` (Quality specialist analysis with improvement priorities)

**Phase 2 - Implementation Integration**:
- Each SPEC document updated with engineer implementation progress
- Cross-domain coordination documented in respective SPEC documents
- Implementation validation results appended to specialist SPEC documents

**Phase 3 - SPEC Loop Closure Documentation**:
- Each specialist SPEC document updated with final validation results
- Compliance certifications generated for security/performance/quality domains
- Complete implementation history preserved in SPEC ecosystem

**Master Integration Point**:
- Existing master SPEC document cross-references all specialist SPEC documents
- Complete specialist analysis integrated into overall architectural documentation

### Enhanced Error Handling with SPEC Integration

**Phase 1 - Single Specialist Failure**: Continue with available SPEC documents, note limitation in specialist coverage
**Phase 1 - Multiple Specialist Failures**: Provide partial SPEC ecosystem with clear scope limitations
**Phase 2 - Engineer Implementation Failure**: Return specific specialist tasks to respective specialists for guidance refinement
**Phase 3 - SPEC Loop Closure Failure**: Individual specialist can fail loop closure while others complete successfully
**Complete Workflow Failure**: Escalate with comprehensive SPEC ecosystem analysis and specialist coordination review

## ENHANCED USAGE EXAMPLES WITH SPEC ECOSYSTEM

### Pre-Release Quality Gate with Automated Fixes
```bash
/quality-check "comprehensive analysis of user authentication system before major release"
```

**Expected Enhanced Flow**:
1. **Parallel SPEC Generation**: Security creates SEC-SPEC with auth vulnerabilities || Performance creates PERF-SPEC with login optimization || Quality creates QUAL-SPEC with test coverage analysis
2. **Engineer Implementation**: Engineer implements security fixes, performance optimizations, and quality improvements from all three SPEC documents
3. **SPEC Loop Closure**: Security validates auth security || Performance confirms login performance || Quality verifies test coverage - all loops closed with certifications

### Production Issue Investigation with Resolution
```bash
/quality-check "investigate quality issues in payment processing after recent performance complaints"
```

**Expected Enhanced Flow**:
1. **Specialist SPEC Creation**: Security generates SEC-SPEC with PCI compliance analysis || Performance creates PERF-SPEC with transaction optimization || Quality develops QUAL-SPEC with error handling improvements
2. **Engineer Implementation**: Engineer executes payment security fixes, performance optimizations, and reliability improvements from SPEC requirements
3. **Debugger Support**: If issues arise during implementation, debugger provides systematic root cause analysis and resolution
4. **Validation**: Specialists validate their respective implementations against SPEC requirements (optional)

### Architecture Review with Implementation
```bash
/quality-check "evaluate overall system quality for microservices migration planning"
```

**Expected Enhanced Flow**:
1. **Comprehensive SPEC Ecosystem**: Security creates service security SPEC || Performance develops scaling optimization SPEC || Quality generates migration quality SPEC
2. **Migration Implementation**: Engineer implements security patterns, performance optimizations, and quality standards from specialist SPEC documents
3. **Migration Validation**: All specialists validate migration readiness and close SPEC loops with architectural compliance certifications

### Technical Debt Assessment with Automated Remediation
```bash
/quality-check "assess technical debt and quality issues across legacy user management module"
```

**Expected Enhanced Flow**:
1. **Legacy Analysis SPEC Creation**: Security creates SEC-SPEC with dependency updates || Performance develops PERF-SPEC with optimization roadmap || Quality generates QUAL-SPEC with refactoring priorities
2. **Technical Debt Resolution**: Engineer implements security updates, performance improvements, and refactoring tasks from all specialist SPEC documents
3. **Debt Closure Validation**: All specialists validate technical debt resolution and close SPEC loops with modernization certifications

## ENHANCED SUCCESS METRICS WITH SPEC ECOSYSTEM

**Complete SPEC Ecosystem**: All three specialist domains analyzed with comprehensive SPEC documentation
**Automated Implementation**: Specialist delegation tasks executed by engineer with validation
**Closed Loop Validation**: All specialist SPEC loops closed with compliance certifications
**Cross-Domain Integration**: Understanding of how specialist requirements interconnect and coordinate

**Enhanced Business Value**:
- **Automated Risk Mitigation**: Critical issues identified and automatically implemented with specialist validation
- **Systematic Optimization**: Performance, security, and quality improvements implemented with measurable results
- **Accelerated Development**: Technical debt and quality issues resolved automatically with specialist oversight
- **Compliance Assurance**: Security, performance, and quality compliance achieved with specialist certifications

**SPEC Ecosystem Benefits**:
- **Living Documentation**: Complete specialist SPEC documents provide ongoing reference for future development
- **Specialist Integration**: Quality, performance, and security considerations permanently integrated into project architecture
- **Automated Validation**: Specialist loop closure ensures implementations meet domain expertise standards
- **Continuous Improvement**: SPEC ecosystem enables ongoing specialist analysis and enhancement

**Integration with Development Pipeline**:
- **Build Workflow Integration**: Quality-check SPEC ecosystem enhances `/build` workflow specialist placeholder integration
- **Fix Workflow Support**: Specialist SPEC documents provide context for `/fix` workflow TDD debugging
- **Production Readiness**: Complete specialist validation ensures production deployment confidence

**🔔 QUALITY_CHECK_COMPLETE**: Enhanced specialist analysis finished - Complete SPEC ecosystem with [X] specialist implementations, engineer execution, and debugger support as needed

**Seamless Pipeline Integration**: This enhanced quality-check workflow works seamlessly with `/build` (idea to SPEC) and `/fix` (TDD debugging) to create the complete "idea to production" pipeline where prime agents handle idea-to-PR and specialist agents handle PR-to-production.

Use this enhanced workflow for systematic specialist analysis with automated implementation and validation. The parallel specialist approach with SPEC ecosystem integration provides complete quality assurance across all critical domains with permanent documentation and compliance validation.