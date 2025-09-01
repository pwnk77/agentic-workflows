/**
 * Utility functions for spec grouping and relationship management
 * This provides a simplified interface for command implementations
 */

export interface GroupingResult {
  feature_group: string;
  theme_category: string;
  priority: string;
  confidence: number;
}

export interface RelationshipSuggestion {
  spec_id: number;
  title: string;
  score: number;
  reason: string;
  relationship_type: string;
}

/**
 * Analyze content and suggest grouping and relationships
 */
export class SpecAnalyzer {
  /**
   * Analyze requirements and extract key information
   */
  static analyzeRequirements(description: string): {
    title: string;
    keywords: string[];
    detectedGroup: string;
    detectedTheme: string;
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    const words = description.toLowerCase().split(/\s+/);
    
    // Extract potential title (first meaningful phrase)
    const titleWords = description.split(' ').slice(0, 8);
    const title = titleWords.join(' ').replace(/[^\w\s-]/g, '').trim();
    
    // Extract keywords
    const technicalKeywords = [
      'auth', 'database', 'api', 'ui', 'frontend', 'backend', 'integration',
      'component', 'service', 'model', 'controller', 'migration', 'test'
    ];
    
    const keywords = words.filter(word => 
      technicalKeywords.includes(word) || 
      word.length > 4
    ).slice(0, 10);
    
    // Detect feature group
    let detectedGroup = 'general';
    if (words.some(w => ['auth', 'login', 'security'].includes(w))) {
      detectedGroup = 'auth';
    } else if (words.some(w => ['ui', 'component', 'frontend', 'dashboard'].includes(w))) {
      detectedGroup = 'ui';
    } else if (words.some(w => ['api', 'endpoint', 'service', 'backend'].includes(w))) {
      detectedGroup = 'api';
    } else if (words.some(w => ['database', 'model', 'migration', 'schema'].includes(w))) {
      detectedGroup = 'data';
    } else if (words.some(w => ['mcp', 'integration', 'external', 'webhook'].includes(w))) {
      detectedGroup = 'integration';
    }
    
    // Detect theme
    const themeMap: Record<string, string> = {
      'auth': 'backend',
      'ui': 'frontend',
      'api': 'backend', 
      'data': 'backend',
      'integration': 'integration'
    };
    const detectedTheme = themeMap[detectedGroup] || 'general';
    
    // Assess complexity
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (description.length > 200 || keywords.length > 6) {
      complexity = 'moderate';
    }
    if (description.length > 500 || words.some(w => ['system', 'architecture', 'complex'].includes(w))) {
      complexity = 'complex';
    }
    
    return {
      title,
      keywords,
      detectedGroup,
      detectedTheme,
      complexity
    };
  }

  /**
   * Generate implementation plan structure based on requirements
   */
  static generateImplementationPlan(requirements: ReturnType<typeof SpecAnalyzer.analyzeRequirements>): {
    layers: string[];
    estimatedTasks: number;
    recommendedApproach: string;
  } {
    const { detectedGroup, detectedTheme, complexity } = requirements;
    
    let layers: string[] = ['Database Layer', 'Backend Layer'];
    let estimatedTasks = 3;
    let recommendedApproach = 'incremental';
    
    // Customize based on detected group
    switch (detectedGroup) {
      case 'ui':
        layers = ['Component Layer', 'Frontend Layer', 'Integration Layer'];
        estimatedTasks = complexity === 'complex' ? 8 : 5;
        break;
        
      case 'api':
        layers = ['Database Layer', 'Backend Layer', 'API Layer', 'Testing Layer'];
        estimatedTasks = complexity === 'complex' ? 10 : 6;
        break;
        
      case 'integration':
        layers = ['MCP Layer', 'Integration Layer', 'Testing Layer'];
        estimatedTasks = complexity === 'complex' ? 7 : 4;
        recommendedApproach = 'prototype-first';
        break;
        
      case 'data':
        layers = ['Database Layer', 'Migration Layer', 'Service Layer', 'Testing Layer'];
        estimatedTasks = complexity === 'complex' ? 9 : 5;
        recommendedApproach = 'schema-first';
        break;
        
      case 'auth':
        layers = ['Security Layer', 'Backend Layer', 'Frontend Layer', 'Testing Layer'];
        estimatedTasks = complexity === 'complex' ? 12 : 7;
        recommendedApproach = 'security-first';
        break;
        
      default:
        if (complexity === 'complex') {
          layers.push('Integration Layer', 'Testing Layer');
          estimatedTasks = 8;
        }
    }
    
    return {
      layers,
      estimatedTasks,
      recommendedApproach
    };
  }

  /**
   * Format spec content with proper structure
   */
  static formatSpecContent(
    requirements: ReturnType<typeof SpecAnalyzer.analyzeRequirements>,
    implementationPlan: ReturnType<typeof SpecAnalyzer.generateImplementationPlan>
  ): string {
    const { title, detectedGroup, detectedTheme, complexity } = requirements;
    const { layers, estimatedTasks, recommendedApproach } = implementationPlan;
    
    const date = new Date().toISOString().split('T')[0];
    
    return `# SPEC-${date.replace(/-/g, '')}-${title.toLowerCase().replace(/\s+/g, '-')}

## Executive Summary
**Feature**: ${title}
**Impact**: ${this.getImpactDescription(detectedGroup, complexity)}
**Effort**: ${estimatedTasks} tasks across ${layers.length} layers
**Risk**: ${complexity === 'complex' ? 'Medium' : 'Low'} - ${this.getRiskDescription(detectedGroup, complexity)}
**Dependencies**: ${this.getDependencyDescription(detectedGroup)}

## Product Specifications

### Elevator Pitch
${this.getElevatorPitch(title, detectedGroup, detectedTheme)}

### Target Users
- **Primary**: ${this.getPrimaryUsers(detectedGroup)}
- **Secondary**: ${this.getSecondaryUsers(detectedGroup)}

### Core Goals
1. **Performance**: ${this.getPerformanceGoals(detectedGroup)}
2. **Usability**: ${this.getUsabilityGoals(detectedGroup)}
3. **Scale**: ${this.getScaleGoals(detectedGroup)}

### Functional Requirements
${this.generateFunctionalRequirements(title, detectedGroup)}

### User Stories
${this.generateUserStories(title, detectedGroup)}

### Non-Goals
${this.generateNonGoals(detectedGroup)}

## Technical Specifications

### System Architecture
- **Pattern**: ${this.getArchitecturalPattern(detectedGroup, detectedTheme)}
- **Flow**: ${this.getDataFlow(detectedGroup)}
- **Security**: ${this.getSecurityConsiderations(detectedGroup)}

### Component Design
${this.getComponentDesign(detectedGroup, detectedTheme)}

### Testing Strategy
${this.getTestingStrategy(detectedGroup)}

## Implementation Plan

### Task Breakdown

${this.generateTaskBreakdown(layers, detectedGroup, recommendedApproach)}

### Dependencies
${this.generateDependencies(layers)}

## Success Metrics
${this.getSuccessMetrics(detectedGroup, complexity)}

## Timeline
**Total Effort**: ${estimatedTasks} tasks (${Math.ceil(estimatedTasks / 3)}-${Math.ceil(estimatedTasks / 2)} developer days)
**Critical Path**: ${this.getCriticalPath(layers)}
**Recommended Approach**: ${recommendedApproach}

${layers.map((layer, index) => `- ${layer}: ${Math.ceil(estimatedTasks / layers.length)} tasks`).join('\n')}

**Parallel Development Opportunities:**
${this.getParallelOpportunities(layers)}
`;
  }

  private static getImpactDescription(group: string, complexity: string): string {
    const impacts = {
      'auth': 'Enhance security and user management capabilities',
      'ui': 'Improve user experience and interface functionality', 
      'api': 'Expand backend service capabilities and data access',
      'data': 'Strengthen data management and storage capabilities',
      'integration': 'Enable new external system connections and workflows',
      'general': 'Enhance overall system functionality'
    };
    
    const base = impacts[group] || impacts['general'];
    return complexity === 'complex' ? `${base} with significant architectural changes` : base;
  }

  private static getRiskDescription(group: string, complexity: string): string {
    const risks = {
      'auth': 'Security implementation requires careful validation',
      'ui': 'User interface changes may affect existing workflows',
      'api': 'API changes may impact dependent services',
      'data': 'Database changes require migration planning',
      'integration': 'External dependencies may introduce instability',
      'general': 'Standard implementation with known patterns'
    };
    
    return risks[group] || risks['general'];
  }

  private static getDependencyDescription(group: string): string {
    const deps = {
      'auth': 'User management system, security infrastructure',
      'ui': 'Design system, component library, state management',
      'api': 'Database layer, service architecture, documentation',
      'data': 'Database infrastructure, migration system, backup strategy',
      'integration': 'External API access, MCP infrastructure, error handling',
      'general': 'Core system architecture and development environment'
    };
    
    return deps[group] || deps['general'];
  }

  private static getElevatorPitch(title: string, group: string, theme: string): string {
    return `A ${theme} solution for ${title.toLowerCase()} that enhances the ${group} capabilities of the system through efficient implementation and seamless integration.`;
  }

  private static getPrimaryUsers(group: string): string {
    const users = {
      'auth': 'End users requiring secure access, daily usage',
      'ui': 'End users interacting with the interface, frequent usage',
      'api': 'Developers and applications consuming the API, programmatic usage',
      'data': 'System administrators and data consumers, operational usage',
      'integration': 'External system operators and integration specialists, automated usage',
      'general': 'System users and administrators, regular usage'
    };
    
    return users[group] || users['general'];
  }

  private static getSecondaryUsers(group: string): string {
    const users = {
      'auth': 'System administrators managing user access',
      'ui': 'System administrators monitoring user interactions',
      'api': 'System administrators monitoring API performance',
      'data': 'Developers requiring data access for features',
      'integration': 'Developers maintaining integration connections',
      'general': 'Technical support team and system monitors'
    };
    
    return users[group] || users['general'];
  }

  private static getPerformanceGoals(group: string): string {
    const goals = {
      'auth': 'Authentication <500ms, authorization <100ms',
      'ui': 'Page load <2s, interactions <200ms',
      'api': 'Response time <300ms, throughput 1000 req/s',
      'data': 'Query time <100ms, data consistency 99.9%',
      'integration': 'External calls <2s, retry success 95%',
      'general': 'System response <1s, availability 99.5%'
    };
    
    return goals[group] || goals['general'];
  }

  private static getUsabilityGoals(group: string): string {
    const goals = {
      'auth': 'Secure and intuitive login flow, password recovery',
      'ui': 'Intuitive interface, accessibility compliance, mobile responsive',
      'api': 'Clear documentation, consistent responses, developer-friendly',
      'data': 'Reliable data access, transaction integrity, backup recovery',
      'integration': 'Seamless data flow, error handling, monitoring dashboards',
      'general': 'User-friendly operation, clear feedback, error recovery'
    };
    
    return goals[group] || goals['general'];
  }

  private static getScaleGoals(group: string): string {
    const goals = {
      'auth': 'Handle 10K+ concurrent users, role-based permissions',
      'ui': 'Support diverse devices, handle 100+ concurrent UI operations',
      'api': 'Scale to 100K+ requests/hour, support API versioning',
      'data': 'Manage 1M+ records, support horizontal scaling',
      'integration': 'Handle 50+ external connections, batch processing',
      'general': 'Scale with system growth, maintain performance standards'
    };
    
    return goals[group] || goals['general'];
  }

  private static generateFunctionalRequirements(title: string, group: string): string {
    // Generate 2-3 functional requirements based on the group
    const requirements = [];
    const baseName = title.replace(/\s+/g, '-').toLowerCase();
    
    switch (group) {
      case 'auth':
        requirements.push(`- **FR-001**: User authentication with ${title.toLowerCase()}
  - **Given**: User provides valid credentials
  - **When**: System processes authentication request
  - **Then**: User gains access with appropriate permissions
  - **Acceptance**: Verified by test \`test_${baseName}_authentication\``);
        break;
        
      case 'ui':
        requirements.push(`- **FR-001**: ${title} user interface implementation
  - **Given**: User navigates to ${title.toLowerCase()} section
  - **When**: Interface loads and renders components
  - **Then**: User can interact with all intended features
  - **Acceptance**: Verified by test \`test_${baseName}_ui_functionality\``);
        break;
        
      case 'api':
        requirements.push(`- **FR-001**: ${title} API endpoint implementation
  - **Given**: Client sends valid API request for ${title.toLowerCase()}
  - **When**: Server processes request with proper validation
  - **Then**: Client receives expected response with correct data
  - **Acceptance**: Verified by test \`test_${baseName}_api_endpoint\``);
        break;
        
      case 'data':
        requirements.push(`- **FR-001**: ${title} data management functionality
  - **Given**: System needs to manage ${title.toLowerCase()} data
  - **When**: Data operations (CRUD) are performed
  - **Then**: Data is stored, retrieved, and modified correctly
  - **Acceptance**: Verified by test \`test_${baseName}_data_operations\``);
        break;
        
      case 'integration':
        requirements.push(`- **FR-001**: ${title} integration functionality
  - **Given**: System needs to integrate ${title.toLowerCase()}
  - **When**: Integration processes are triggered
  - **Then**: Data flows correctly between systems
  - **Acceptance**: Verified by test \`test_${baseName}_integration_flow\``);
        break;
        
      default:
        requirements.push(`- **FR-001**: ${title} core functionality
  - **Given**: User initiates ${title.toLowerCase()} operation
  - **When**: System processes the request
  - **Then**: Operation completes successfully with expected results
  - **Acceptance**: Verified by test \`test_${baseName}_functionality\``);
    }
    
    return requirements.join('\n\n');
  }

  private static generateUserStories(title: string, group: string): string {
    const stories = [];
    const feature = title.toLowerCase();
    
    switch (group) {
      case 'auth':
        stories.push(`- **US-001**: As a user, I want to ${feature} so that I can securely access the system
  - **Acceptance Criteria**:
    1. Login form accepts valid credentials
    2. System validates user permissions
    3. Session is established securely
    4. User is redirected to appropriate dashboard`);
        break;
        
      case 'ui':
        stories.push(`- **US-001**: As a user, I want to use ${feature} interface so that I can accomplish my tasks efficiently
  - **Acceptance Criteria**:
    1. Interface loads quickly and responsively
    2. All interactive elements work as expected
    3. Visual feedback is provided for user actions
    4. Interface is accessible and mobile-friendly`);
        break;
        
      case 'api':
        stories.push(`- **US-001**: As a developer, I want to use ${feature} API so that I can integrate the functionality into my application
  - **Acceptance Criteria**:
    1. API endpoints are documented and accessible
    2. Responses follow consistent format
    3. Error handling is comprehensive
    4. Rate limiting and security are implemented`);
        break;
        
      default:
        stories.push(`- **US-001**: As a user, I want ${feature} functionality so that I can achieve my goals effectively
  - **Acceptance Criteria**:
    1. Feature works as described in requirements
    2. Performance meets specified benchmarks
    3. Error handling provides clear feedback
    4. Feature integrates well with existing system`);
    }
    
    return stories.join('\n\n');
  }

  private static generateNonGoals(group: string): string {
    const nonGoals = {
      'auth': `- **Advanced SSO Integration**: No enterprise SSO providers - **Reason**: Focus on core authentication first
- **Biometric Authentication**: No fingerprint/face recognition - **Reason**: Added complexity without immediate need
- **Advanced Audit Logging**: No detailed user activity tracking - **Reason**: Basic logging sufficient for initial version`,
      
      'ui': `- **Advanced Animations**: No complex micro-interactions - **Reason**: Focus on core functionality first  
- **Theming System**: No custom themes or dark mode - **Reason**: Standard styling sufficient initially
- **Advanced Accessibility**: No WCAG AAA compliance - **Reason**: WCAG AA compliance is sufficient`,
      
      'api': `- **GraphQL Support**: No GraphQL endpoints - **Reason**: REST API sufficient for current needs
- **Real-time WebSockets**: No live data streaming - **Reason**: Request/response pattern adequate
- **Advanced Caching**: No Redis or complex caching - **Reason**: Basic caching meets performance requirements`,
      
      'data': `- **Advanced Analytics**: No complex reporting or dashboards - **Reason**: Focus on core data operations
- **Data Warehousing**: No OLAP or analytical processing - **Reason**: Transactional data sufficient
- **Advanced Backup**: No point-in-time recovery - **Reason**: Standard backup procedures adequate`,
      
      'integration': `- **Real-time Sync**: No instant bidirectional synchronization - **Reason**: Batch processing sufficient
- **Advanced Retry Logic**: No exponential backoff strategies - **Reason**: Simple retry mechanism adequate
- **Complex Workflows**: No multi-step approval processes - **Reason**: Direct integration preferred`,
      
      'general': `- **Advanced Configuration**: No complex customization options - **Reason**: Standard configuration sufficient
- **Multi-tenancy**: No tenant isolation features - **Reason**: Single-tenant architecture adequate
- **Advanced Monitoring**: No detailed performance analytics - **Reason**: Basic monitoring meets requirements`
    };
    
    return nonGoals[group] || nonGoals['general'];
  }

  private static getArchitecturalPattern(group: string, theme: string): string {
    const patterns = {
      'auth': 'JWT-based authentication → Role validation → Permission checking',
      'ui': 'Component-based architecture → State management → Event handling',
      'api': 'RESTful services → Data validation → Response formatting',
      'data': 'Repository pattern → Service layer → Data access objects',
      'integration': 'MCP protocol → Message queuing → Event-driven processing',
      'general': 'Layered architecture → Service abstraction → Clean interfaces'
    };
    
    return patterns[group] || patterns['general'];
  }

  private static getDataFlow(group: string): string {
    const flows = {
      'auth': 'Client credentials → Authentication service → JWT token → Permission validation',
      'ui': 'User interaction → Component state → Action dispatch → UI update',
      'api': 'API request → Validation → Business logic → Database → Response',
      'data': 'Data input → Validation → Transformation → Storage → Retrieval',
      'integration': 'External trigger → Message processing → Data transformation → System update',
      'general': 'User input → Processing → Validation → Storage → Response'
    };
    
    return flows[group] || flows['general'];
  }

  private static getSecurityConsiderations(group: string): string {
    const security = {
      'auth': 'Password hashing, session management, CSRF protection, rate limiting',
      'ui': 'XSS prevention, CSRF tokens, input sanitization, secure cookies',
      'api': 'API key validation, rate limiting, input validation, SQL injection prevention',
      'data': 'Data encryption, access controls, audit logging, backup security',
      'integration': 'API authentication, data validation, secure transmission, error handling',
      'general': 'Standard security practices, input validation, secure communication'
    };
    
    return security[group] || security['general'];
  }

  private static getComponentDesign(group: string, theme: string): string {
    return `**${theme.charAt(0).toUpperCase() + theme.slice(1)} Architecture:**
${this.getComponentDetails(group)}`;
  }

  private static getComponentDetails(group: string): string {
    const details = {
      'auth': `\`\`\`typescript
class AuthenticationService {
  async authenticate(credentials: UserCredentials): Promise<AuthResult> {
    // Validate credentials
    // Generate JWT token
    // Set session
    return { success: true, token, user };
  }
}
\`\`\``,
      
      'ui': `\`\`\`typescript
interface ComponentProps {
  data: any;
  onAction: (action: string) => void;
}

const FeatureComponent: React.FC<ComponentProps> = ({ data, onAction }) => {
  // Component implementation
  return <div>{/* UI elements */}</div>;
};
\`\`\``,
      
      'api': `\`\`\`typescript
class ApiController {
  @Post('/endpoint')
  async handleRequest(@Body() data: RequestDTO): Promise<ResponseDTO> {
    // Validate input
    // Process business logic
    // Return formatted response
  }
}
\`\`\``,
      
      'data': `\`\`\`typescript
class DataService {
  async create(data: EntityData): Promise<Entity> {
    // Validate data
    // Save to database
    // Return created entity
  }
}
\`\`\``,
      
      'integration': `\`\`\`typescript
class IntegrationService {
  async processExternalData(data: ExternalData): Promise<void> {
    // Transform data
    // Validate format
    // Update internal systems
  }
}
\`\`\``,
      
      'general': `\`\`\`typescript
class FeatureService {
  async execute(input: FeatureInput): Promise<FeatureOutput> {
    // Process input
    // Apply business logic
    // Return result
  }
}
\`\`\``
    };
    
    return details[group] || details['general'];
  }

  private static getTestingStrategy(group: string): string {
    const strategies = {
      'auth': `- **Unit Tests**: Authentication logic, token validation, password hashing
- **Integration Tests**: Login flow, session management, permission checks
- **Security Tests**: Penetration testing, vulnerability scanning
- **Performance Tests**: Concurrent login load, token generation speed`,
      
      'ui': `- **Unit Tests**: Component rendering, state management, event handling
- **Integration Tests**: User workflows, form validation, navigation
- **E2E Tests**: Complete user journeys, cross-browser compatibility
- **Accessibility Tests**: Screen reader compatibility, keyboard navigation`,
      
      'api': `- **Unit Tests**: Controller logic, data validation, response formatting
- **Integration Tests**: Database interactions, external service calls
- **API Tests**: Endpoint functionality, error handling, rate limiting
- **Performance Tests**: Response times, throughput, concurrent requests`,
      
      'data': `- **Unit Tests**: Data models, validation logic, transformation functions
- **Integration Tests**: Database operations, migration scripts
- **Performance Tests**: Query optimization, large dataset handling
- **Data Integrity Tests**: Constraint validation, referential integrity`,
      
      'integration': `- **Unit Tests**: Message processing, data transformation, validation
- **Integration Tests**: External system communication, error handling
- **End-to-End Tests**: Complete data flow, system synchronization
- **Reliability Tests**: Network failures, retry mechanisms, data consistency`,
      
      'general': `- **Unit Tests**: Core functionality, business logic, utility functions
- **Integration Tests**: Component interactions, data flow
- **System Tests**: Complete feature workflows, error scenarios
- **Performance Tests**: Response times, resource usage, scalability`
    };
    
    return strategies[group] || strategies['general'];
  }

  private static generateTaskBreakdown(layers: string[], group: string, approach: string): string {
    const taskTemplates = {
      'Database Layer': ['Create database schema', 'Implement migrations', 'Add indexes and constraints'],
      'Backend Layer': ['Implement service logic', 'Create API endpoints', 'Add validation'],
      'Frontend Layer': ['Create UI components', 'Implement state management', 'Add user interactions'],
      'Component Layer': ['Design component structure', 'Implement base components', 'Add component logic'],
      'API Layer': ['Define API contracts', 'Implement endpoints', 'Add documentation'],
      'Integration Layer': ['Set up external connections', 'Implement data transformation', 'Add error handling'],
      'Testing Layer': ['Write unit tests', 'Create integration tests', 'Add performance tests'],
      'Security Layer': ['Implement authentication', 'Add authorization', 'Security validation'],
      'MCP Layer': ['Configure MCP tools', 'Implement MCP handlers', 'Add MCP integration']
    };

    let taskId = 1;
    const sections = layers.map(layer => {
      const tasks = taskTemplates[layer] || ['Implement core functionality', 'Add validation', 'Create tests'];
      const layerCode = layer.split(' ')[0].toUpperCase().substring(0, 3);
      
      const taskItems = tasks.map(task => {
        const id = `${layerCode}-${String(taskId).padStart(3, '0')}`;
        taskId++;
        return `- [ ] **${id}**: ${task} [Estimate: 2-3hr]`;
      }).join('\n');

      return `#### ${layer} (${layerCode}-XXX)
${taskItems}`;
    }).join('\n\n');

    return sections;
  }

  private static generateDependencies(layers: string[]): string {
    const deps = layers.map((layer, index) => {
      if (index === 0) return `- ${layer} is the foundation layer`;
      return `- ${layer} depends on ${layers[index - 1]}`;
    }).join('\n');
    
    return deps + '\n- All implementation tasks must complete before testing begins';
  }

  private static getSuccessMetrics(group: string, complexity: string): string {
    const baseMetrics = {
      'auth': '- **Security**: 100% password hashing, session timeout enforced\n- **Performance**: Login <500ms, token validation <100ms\n- **Reliability**: 99.9% authentication success rate',
      'ui': '- **Performance**: Page load <2s, interaction response <200ms\n- **Usability**: 95% user task completion rate\n- **Accessibility**: WCAG AA compliance verified',
      'api': '- **Performance**: API response <300ms, throughput 1000 req/s\n- **Reliability**: 99.5% uptime, comprehensive error handling\n- **Documentation**: 100% endpoint documentation coverage',
      'data': '- **Performance**: Query response <100ms, transaction integrity 100%\n- **Reliability**: Data consistency checks pass\n- **Scale**: Handle expected data volume efficiently',
      'integration': '- **Reliability**: 95% external call success rate with retries\n- **Performance**: Integration processes complete within SLA\n- **Monitoring**: Full integration health dashboard',
      'general': '- **Functionality**: 100% requirements implemented and tested\n- **Performance**: System response within specified limits\n- **Quality**: Code review approval and test coverage >80%'
    };
    
    const base = baseMetrics[group] || baseMetrics['general'];
    
    if (complexity === 'complex') {
      return `${base}\n- **Complexity Management**: Architecture review approved\n- **Integration**: Seamless compatibility with existing systems`;
    }
    
    return base;
  }

  private static getCriticalPath(layers: string[]): string {
    return layers.join(' → ');
  }

  private static getParallelOpportunities(layers: string[]): string {
    if (layers.length <= 2) {
      return '- Documentation can be written alongside implementation\n- Test planning can begin during design phase';
    }
    
    const middle = Math.floor(layers.length / 2);
    const parallel1 = layers.slice(1, middle + 1).join(' and ');
    const parallel2 = layers.slice(middle + 1).join(' and ');
    
    return `- ${parallel1} can be developed simultaneously after ${layers[0]}\n- ${parallel2} can begin once core layers are stable\n- Documentation and testing can be written alongside implementation`;
  }
}