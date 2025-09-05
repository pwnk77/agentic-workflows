export interface CategoryPattern {
  name: string;
  patterns: RegExp[];
  keywords: string[];
  priority: number; // Higher priority wins in ties
}

export interface CategoryDetectionResult {
  category: string;
  confidence: number;
  matchedKeywords: string[];
  alternativeCategories: Array<{ category: string; confidence: number }>;
}

export class CategoryDetector {
  private patterns: CategoryPattern[] = [
    {
      name: 'authentication',
      patterns: [
        /auth(?:entication|orization)?/i,
        /login|signup|sign[_-]?in|sign[_-]?up/i,
        /oauth|sso|saml|jwt|token/i,
        /password|credential|session|cookie/i,
        /user[_-]?management|account|profile/i,
        /security[_-]?policy|access[_-]?control/i
      ],
      keywords: [
        'authentication', 'authorization', 'login', 'signup', 'oauth', 'sso',
        'password', 'credential', 'token', 'jwt', 'session', 'security',
        'user', 'account', 'profile', 'access', 'permission', 'role'
      ],
      priority: 8
    },
    {
      name: 'payments',
      patterns: [
        /payment|billing|invoice|subscription/i,
        /stripe|paypal|checkout|transaction/i,
        /card|credit|debit|bank|financial/i,
        /pricing|plan|revenue|monetization/i,
        /refund|chargeback|receipt/i
      ],
      keywords: [
        'payment', 'billing', 'invoice', 'subscription', 'stripe', 'paypal',
        'checkout', 'transaction', 'credit', 'card', 'pricing', 'plan',
        'revenue', 'refund', 'receipt', 'financial', 'money', 'cost'
      ],
      priority: 9
    },
    {
      name: 'ui-components',
      patterns: [
        /component|widget|element/i,
        /button|form|input|modal|dialog/i,
        /layout|grid|flexbox|responsive/i,
        /design[_-]?system|style[_-]?guide/i,
        /theme|color|typography|font/i,
        /animation|transition|interaction/i,
        /accessibility|a11y|aria/i
      ],
      keywords: [
        'component', 'widget', 'button', 'form', 'input', 'modal', 'layout',
        'design', 'style', 'theme', 'color', 'font', 'animation', 'ui',
        'ux', 'interface', 'responsive', 'accessibility', 'interaction'
      ],
      priority: 7
    },
    {
      name: 'database',
      patterns: [
        /database|db|sql|nosql/i,
        /schema|migration|model|entity/i,
        /query|index|constraint|relation/i,
        /postgres|mysql|mongodb|sqlite/i,
        /orm|prisma|sequelize|typeorm/i,
        /backup|restore|replication/i
      ],
      keywords: [
        'database', 'schema', 'migration', 'model', 'query', 'sql',
        'postgres', 'mysql', 'mongodb', 'sqlite', 'orm', 'table',
        'index', 'constraint', 'relation', 'backup', 'data'
      ],
      priority: 8
    },
    {
      name: 'api',
      patterns: [
        /api|endpoint|rest|restful/i,
        /graphql|apollo|resolver/i,
        /webhook|callback|integration/i,
        /microservice|service[_-]?layer/i,
        /request|response|http|https/i,
        /swagger|openapi|documentation/i
      ],
      keywords: [
        'api', 'endpoint', 'rest', 'graphql', 'webhook', 'microservice',
        'service', 'request', 'response', 'http', 'integration',
        'swagger', 'openapi', 'documentation', 'client', 'server'
      ],
      priority: 7
    },
    {
      name: 'infrastructure',
      patterns: [
        /deploy|deployment|devops/i,
        /docker|kubernetes|container/i,
        /ci\/cd|continuous[_-]?integration/i,
        /cloud|aws|azure|gcp|serverless/i,
        /monitoring|logging|observability/i,
        /load[_-]?balancing|scaling|performance/i
      ],
      keywords: [
        'deploy', 'deployment', 'docker', 'kubernetes', 'container',
        'cloud', 'aws', 'azure', 'monitoring', 'logging', 'scaling',
        'performance', 'infrastructure', 'devops', 'serverless'
      ],
      priority: 6
    },
    {
      name: 'testing',
      patterns: [
        /test|testing|spec|specification/i,
        /unit[_-]?test|integration[_-]?test/i,
        /e2e|end[_-]?to[_-]?end|selenium/i,
        /jest|cypress|mocha|jasmine/i,
        /mock|stub|fixture|snapshot/i,
        /coverage|tdd|bdd/i
      ],
      keywords: [
        'test', 'testing', 'spec', 'unit', 'integration', 'e2e',
        'jest', 'cypress', 'mocha', 'mock', 'coverage', 'tdd', 'bdd',
        'fixture', 'snapshot', 'assertion', 'verify'
      ],
      priority: 5
    },
    {
      name: 'architecture',
      patterns: [
        /architecture|system[_-]?design/i,
        /pattern|structure|organization/i,
        /module|package|namespace/i,
        /framework|library|dependency/i,
        /config|configuration|setting/i,
        /workflow|process|pipeline/i
      ],
      keywords: [
        'architecture', 'system', 'design', 'pattern', 'structure',
        'module', 'package', 'framework', 'library', 'config',
        'configuration', 'workflow', 'process', 'organization'
      ],
      priority: 4
    },
    {
      name: 'performance',
      patterns: [
        /performance|optimization|speed/i,
        /cache|caching|redis|memcached/i,
        /lazy[_-]?loading|preload|prefetch/i,
        /bundle|minification|compression/i,
        /memory|cpu|resource|efficiency/i,
        /benchmark|profiling|metrics/i
      ],
      keywords: [
        'performance', 'optimization', 'speed', 'cache', 'lazy',
        'bundle', 'minification', 'memory', 'cpu', 'benchmark',
        'metrics', 'efficiency', 'fast', 'slow', 'bottleneck'
      ],
      priority: 6
    },
    {
      name: 'security',
      patterns: [
        /security|secure|vulnerability/i,
        /encryption|decrypt|hash|cipher/i,
        /xss|csrf|sql[_-]?injection/i,
        /firewall|cors|helmet|sanitize/i,
        /audit|compliance|gdpr|privacy/i,
        /threat|risk|attack|malicious/i
      ],
      keywords: [
        'security', 'secure', 'vulnerability', 'encryption', 'hash',
        'xss', 'csrf', 'injection', 'cors', 'audit', 'compliance',
        'privacy', 'threat', 'risk', 'attack', 'protection'
      ],
      priority: 9
    }
  ];

  /**
   * Detect category for given title and content
   */
  detect(title: string, content: string): string {
    const result = this.detectWithConfidence(title, content);
    return result.category;
  }

  /**
   * Detect category with detailed confidence analysis
   */
  detectWithConfidence(title: string, content: string): CategoryDetectionResult {
    const text = `${title} ${content}`.toLowerCase();
    const words = this.tokenize(text);
    const wordSet = new Set(words);
    
    const scores = new Map<string, {
      score: number;
      matchedKeywords: string[];
      patternMatches: number;
    }>();

    // Initialize scores for all categories
    this.patterns.forEach(pattern => {
      scores.set(pattern.name, {
        score: 0,
        matchedKeywords: [],
        patternMatches: 0
      });
    });

    // Score each category
    for (const pattern of this.patterns) {
      const categoryScore = scores.get(pattern.name)!;
      
      // Pattern matching (higher weight)
      let patternScore = 0;
      for (const regex of pattern.patterns) {
        if (regex.test(text)) {
          patternScore += 3;
          categoryScore.patternMatches++;
          
          // Extra weight for title matches
          if (regex.test(title.toLowerCase())) {
            patternScore += 2;
          }
        }
      }
      
      // Keyword matching
      let keywordScore = 0;
      const matchedKeywords: string[] = [];
      for (const keyword of pattern.keywords) {
        if (wordSet.has(keyword.toLowerCase())) {
          keywordScore += 1;
          matchedKeywords.push(keyword);
          
          // Extra weight for title keywords
          if (title.toLowerCase().includes(keyword.toLowerCase())) {
            keywordScore += 1;
          }
        }
      }
      
      // Calculate final score with priority weighting
      const rawScore = (patternScore * 2) + keywordScore;
      const priorityMultiplier = pattern.priority / 10;
      const finalScore = rawScore * priorityMultiplier;
      
      categoryScore.score = finalScore;
      categoryScore.matchedKeywords = matchedKeywords;
    }

    // Find best match
    const sortedCategories = Array.from(scores.entries())
      .filter(([, data]) => data.score > 0)
      .sort(([, a], [, b]) => b.score - a.score);

    if (sortedCategories.length === 0) {
      return {
        category: 'general',
        confidence: 0,
        matchedKeywords: [],
        alternativeCategories: []
      };
    }

    const [bestCategory, bestScore] = sortedCategories[0];
    const maxPossibleScore = this.calculateMaxScore(bestCategory);
    const confidence = Math.min(1, bestScore.score / maxPossibleScore);

    const alternatives = sortedCategories.slice(1, 4).map(([category, data]) => ({
      category,
      confidence: Math.min(1, data.score / this.calculateMaxScore(category))
    }));

    return {
      category: bestCategory,
      confidence: Math.round(confidence * 100) / 100,
      matchedKeywords: bestScore.matchedKeywords,
      alternativeCategories: alternatives
    };
  }

  /**
   * Calculate maximum possible score for a category
   */
  private calculateMaxScore(categoryName: string): number {
    const pattern = this.patterns.find(p => p.name === categoryName);
    if (!pattern) return 1;
    
    const maxPatternScore = pattern.patterns.length * 5; // 3 + 2 for title bonus
    const maxKeywordScore = pattern.keywords.length * 2; // 1 + 1 for title bonus
    const maxRawScore = (maxPatternScore * 2) + maxKeywordScore;
    
    return maxRawScore * (pattern.priority / 10);
  }

  /**
   * Tokenize text into individual words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 1);
  }

  /**
   * Add a custom category pattern
   */
  addPattern(pattern: CategoryPattern): void {
    // Remove existing pattern with same name
    this.patterns = this.patterns.filter(p => p.name !== pattern.name);
    // Add new pattern
    this.patterns.push(pattern);
    // Sort by priority (highest first)
    this.patterns.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return this.patterns.map(p => p.name).sort();
  }

  /**
   * Get category pattern information
   */
  getCategoryInfo(categoryName: string): CategoryPattern | null {
    return this.patterns.find(p => p.name === categoryName) || null;
  }

  /**
   * Analyze text and return detailed breakdown
   */
  analyze(title: string, content: string): {
    detectedCategory: string;
    confidence: number;
    allScores: Array<{
      category: string;
      score: number;
      confidence: number;
      matchedKeywords: string[];
      patternMatches: number;
    }>;
    suggestions: string[];
  } {
    const result = this.detectWithConfidence(title, content);
    const text = `${title} ${content}`.toLowerCase();
    const allScores: any[] = [];

    // Get scores for all categories
    for (const pattern of this.patterns) {
      const categoryResult = this.scoreCategory(pattern, text, title);
      allScores.push({
        category: pattern.name,
        score: categoryResult.score,
        confidence: categoryResult.confidence,
        matchedKeywords: categoryResult.matchedKeywords,
        patternMatches: categoryResult.patternMatches
      });
    }

    // Sort by score
    allScores.sort((a, b) => b.score - a.score);

    // Generate suggestions
    const suggestions: string[] = [];
    if (result.confidence < 0.7) {
      suggestions.push('Consider adding more specific keywords to improve category detection');
    }
    if (result.alternativeCategories.length > 0 && result.alternativeCategories[0].confidence > 0.5) {
      suggestions.push(`This could also be categorized as '${result.alternativeCategories[0].category}'`);
    }
    if (result.matchedKeywords.length === 0) {
      suggestions.push('No specific keywords found - defaulting to general category');
    }

    return {
      detectedCategory: result.category,
      confidence: result.confidence,
      allScores,
      suggestions
    };
  }

  /**
   * Score a specific category against text
   */
  private scoreCategory(
    pattern: CategoryPattern,
    text: string,
    title: string
  ): {
    score: number;
    confidence: number;
    matchedKeywords: string[];
    patternMatches: number;
  } {
    const words = this.tokenize(text);
    const wordSet = new Set(words);

    let patternMatches = 0;
    let patternScore = 0;

    // Pattern matching
    for (const regex of pattern.patterns) {
      if (regex.test(text)) {
        patternScore += 3;
        patternMatches++;
        
        // Bonus for title match
        if (regex.test(title.toLowerCase())) {
          patternScore += 2;
        }
      }
    }

    // Keyword matching
    let keywordScore = 0;
    const matchedKeywords: string[] = [];
    for (const keyword of pattern.keywords) {
      if (wordSet.has(keyword.toLowerCase())) {
        keywordScore += 1;
        matchedKeywords.push(keyword);
        
        // Bonus for title keyword
        if (title.toLowerCase().includes(keyword.toLowerCase())) {
          keywordScore += 1;
        }
      }
    }

    // Calculate final score
    const rawScore = (patternScore * 2) + keywordScore;
    const priorityMultiplier = pattern.priority / 10;
    const finalScore = rawScore * priorityMultiplier;
    
    const maxScore = this.calculateMaxScore(pattern.name);
    const confidence = maxScore > 0 ? Math.min(1, finalScore / maxScore) : 0;

    return {
      score: finalScore,
      confidence: Math.round(confidence * 100) / 100,
      matchedKeywords,
      patternMatches
    };
  }
}

// Export singleton instance
export const categoryDetector = new CategoryDetector();