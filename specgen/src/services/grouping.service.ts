/**
 * Service for intelligent specification grouping and theme detection
 */
export class SpecGroupingService {
  /**
   * Detect feature group based on title and content analysis
   */
  static detectFeatureGroup(title: string, content: string): string {
    const combined = (title + ' ' + content).toLowerCase();
    
    // Define feature patterns with keywords and weightings
    const patterns = {
      'auth': {
        keywords: ['authentication', 'login', 'user', 'security', 'jwt', 'oauth', 'session', 'password', 'token'],
        weight: 1.0
      },
      'ui': {
        keywords: ['dashboard', 'component', 'frontend', 'react', 'interface', 'page', 'view', 'layout', 'design'],
        weight: 1.0
      },
      'api': {
        keywords: ['endpoint', 'rest', 'graphql', 'service', 'backend', 'controller', 'route', 'handler'],
        weight: 1.0
      },
      'data': {
        keywords: ['database', 'migration', 'schema', 'model', 'storage', 'query', 'sql', 'table', 'record'],
        weight: 1.0
      },
      'integration': {
        keywords: ['mcp', 'webhook', 'external', 'api client', 'sync', 'third-party', 'connector', 'plugin'],
        weight: 1.0
      },
      'testing': {
        keywords: ['test', 'spec', 'unit', 'integration', 'e2e', 'mock', 'fixture', 'coverage'],
        weight: 0.9
      },
      'deployment': {
        keywords: ['deploy', 'docker', 'kubernetes', 'pipeline', 'ci/cd', 'build', 'release'],
        weight: 0.9
      },
      'documentation': {
        keywords: ['docs', 'documentation', 'readme', 'guide', 'tutorial', 'manual'],
        weight: 0.8
      }
    };

    let maxScore = 0;
    let detectedGroup = 'general';

    for (const [group, config] of Object.entries(patterns)) {
      const matches = config.keywords.filter(keyword => combined.includes(keyword));
      const score = (matches.length / config.keywords.length) * config.weight;
      
      if (score > maxScore && matches.length >= 2) { // Require at least 2 matches
        maxScore = score;
        detectedGroup = group;
      }
    }

    return detectedGroup;
  }

  /**
   * Detect theme category based on feature group and content
   */
  static detectThemeCategory(featureGroup: string, content?: string): string {
    const themeMap: Record<string, string> = {
      'auth': 'backend',
      'ui': 'frontend',
      'api': 'backend',
      'data': 'backend',
      'integration': 'integration',
      'testing': 'general',
      'deployment': 'infrastructure',
      'documentation': 'general'
    };

    // Check for theme overrides based on content
    if (content) {
      const combined = content.toLowerCase();
      
      if (combined.includes('frontend') || combined.includes('ui') || combined.includes('component')) {
        return 'frontend';
      }
      
      if (combined.includes('backend') || combined.includes('server') || combined.includes('api')) {
        return 'backend';
      }
      
      if (combined.includes('infrastructure') || combined.includes('devops') || combined.includes('deployment')) {
        return 'infrastructure';
      }
      
      if (combined.includes('integration') || combined.includes('mcp') || combined.includes('external')) {
        return 'integration';
      }
    }

    return themeMap[featureGroup] || 'general';
  }

  /**
   * Detect priority based on content analysis
   */
  static detectPriority(title: string, content: string): string {
    const combined = (title + ' ' + content).toLowerCase();
    
    // High priority indicators
    const highPriorityKeywords = [
      'critical', 'urgent', 'blocker', 'security', 'bug fix',
      'hotfix', 'emergency', 'production', 'breaking'
    ];
    
    // Low priority indicators  
    const lowPriorityKeywords = [
      'nice to have', 'enhancement', 'optimization', 'refactor',
      'cleanup', 'documentation', 'future', 'ideas'
    ];
    
    const hasHighPriority = highPriorityKeywords.some(keyword => combined.includes(keyword));
    const hasLowPriority = lowPriorityKeywords.some(keyword => combined.includes(keyword));
    
    if (hasHighPriority) return 'high';
    if (hasLowPriority) return 'low';
    
    return 'medium';
  }

  /**
   * Extract meaningful keywords for relationship detection
   */
  static extractKeywords(text: string): string[] {
    const combined = text.toLowerCase();
    
    // Remove common stop words and extract meaningful terms
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
      'might', 'can', 'must', 'shall', 'we', 'you', 'they', 'it', 'he', 'she', 'i', 'me',
      'my', 'your', 'his', 'her', 'our', 'their'
    ]);
    
    // Extract words, filter stop words, and keep meaningful terms
    const words = combined
      .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word) &&
        !word.match(/^\d+$/) // Remove pure numbers
      );

    // Extract technical terms and compound words
    const technicalTerms = combined.match(/\b[a-z]+[-_][a-z]+\b/g) || [];
    
    return [...new Set([...words, ...technicalTerms])];
  }

  /**
   * Calculate relationship score between two specs
   */
  static calculateRelationshipScore(spec1Keywords: string[], spec2Keywords: string[]): number {
    if (spec1Keywords.length === 0 || spec2Keywords.length === 0) return 0;
    
    const intersection = spec1Keywords.filter(k => spec2Keywords.includes(k));
    const union = new Set([...spec1Keywords, ...spec2Keywords]);
    
    // Jaccard similarity with minimum threshold
    const jaccardSimilarity = intersection.length / union.size;
    
    // Boost score for common technical terms
    const technicalBoost = intersection.filter(term => 
      term.includes('-') || term.includes('_') || term.length > 8
    ).length * 0.1;
    
    return Math.min(jaccardSimilarity + technicalBoost, 1.0);
  }

  /**
   * Suggest related specs based on content analysis
   */
  static suggestRelatedSpecs(
    currentSpec: { title: string; body_md: string; feature_group?: string },
    candidateSpecs: Array<{ id: number; title: string; body_md: string; feature_group?: string }>,
    minScore: number = 0.2
  ): Array<{ id: number; score: number; reason: string }> {
    const currentKeywords = this.extractKeywords(currentSpec.title + ' ' + currentSpec.body_md);
    
    const relationships = candidateSpecs.map(candidate => {
      const candidateKeywords = this.extractKeywords(candidate.title + ' ' + candidate.body_md);
      const score = this.calculateRelationshipScore(currentKeywords, candidateKeywords);
      
      // Additional scoring factors
      let bonusScore = 0;
      let reason = 'Content similarity';
      
      // Same feature group bonus
      if (currentSpec.feature_group && candidate.feature_group === currentSpec.feature_group) {
        bonusScore += 0.15;
        reason = 'Same feature group + content similarity';
      }
      
      // Title similarity bonus
      const titleWords1 = currentSpec.title.toLowerCase().split(/\s+/);
      const titleWords2 = candidate.title.toLowerCase().split(/\s+/);
      const titleOverlap = titleWords1.filter(w => titleWords2.includes(w)).length;
      if (titleOverlap > 0) {
        bonusScore += titleOverlap * 0.1;
        reason = 'Title and content similarity';
      }
      
      return {
        id: candidate.id,
        score: Math.min(score + bonusScore, 1.0),
        reason
      };
    });

    return relationships
      .filter(rel => rel.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Limit to top 10 suggestions
  }
}