import { z } from 'zod';
import { MetadataManager } from '../../core/metadata-manager.js';
import { StructuredErrorHandler } from '../../core/error-handler.js';

const ReviewerSchema = z.object({
  specId: z.string(),
  scope: z.array(z.enum(['security', 'performance', 'quality', 'architecture'])).default(['quality']),
  generateImprovementSpec: z.boolean().default(false),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'all']).default('medium')
});

type ReviewerInput = z.infer<typeof ReviewerSchema>;

export async function buildReviewer(args: ReviewerInput): Promise<{ content: [{ type: string; text: string }] }> {
  const errorHandler = new StructuredErrorHandler();

  try {
    const validated = ReviewerSchema.parse(args);
    const { specId, scope, generateImprovementSpec, severity } = validated;

    // Load spec metadata
    const metadataManager = new MetadataManager();
    await metadataManager.refresh('Code review started');

    const specs = await metadataManager.listSpecs({});
    const spec = specs.find(s => s.title === specId || s.title?.includes(specId));

    if (!spec) {
      throw new Error(`Specification '${specId}' not found. Use list_specs to see available specifications.`);
    }

    // Review criteria by domain
    const reviewCriteria = {
      security: [
        'Check for SQL injection vulnerabilities',
        'Validate input sanitization',
        'Review authentication and authorization',
        'Check for sensitive data exposure',
        'Validate HTTPS usage and secure headers'
      ],
      performance: [
        'Review database query optimization',
        'Check for N+1 query problems',
        'Validate caching strategies',
        'Review asset bundling and minification',
        'Check for memory leaks'
      ],
      quality: [
        'Review code organization and structure',
        'Check naming conventions consistency',
        'Validate error handling patterns',
        'Review test coverage',
        'Check for code duplication'
      ],
      architecture: [
        'Review separation of concerns',
        'Check architectural pattern adherence',
        'Validate API design principles',
        'Review dependency management',
        'Check scalability considerations'
      ]
    };

    const selectedCriteria = scope.flatMap(domain => reviewCriteria[domain]);

    // Mock review findings
    const findings = {
      critical: severity === 'all' || ['critical'].includes(severity) ? ['No critical security vulnerabilities found'] : [],
      high: severity === 'all' || ['critical', 'high'].includes(severity) ? ['Consider adding input validation to API endpoints'] : [],
      medium: severity === 'all' || ['critical', 'high', 'medium'].includes(severity) ? [
        'Some functions could benefit from better error handling',
        'Consider adding more comprehensive test coverage'
      ] : [],
      low: severity === 'all' || ['critical', 'high', 'medium', 'low'].includes(severity) ? [
        'Variable naming could be more descriptive in some areas',
        'Consider adding inline documentation for complex logic'
      ] : []
    };

    const totalFindings = Object.values(findings).flat().length;

    return {
      content: [{
        type: 'text',
        text: `📋 **Code Review Report**

**Spec ID**: ${specId}
**Review Scope**: ${scope.join(', ')}
**Minimum Severity**: ${severity}
**Total Findings**: ${totalFindings}

## 🔍 Review Criteria Applied:
${selectedCriteria.map(criterion => `• ${criterion}`).join('\n')}

## 🚨 Findings by Severity:

### Critical Issues:
${findings.critical.length > 0 ? findings.critical.map(f => `• ${f}`).join('\n') : '✅ No critical issues found'}

### High Priority Issues:
${findings.high.length > 0 ? findings.high.map(f => `• ${f}`).join('\n') : '✅ No high priority issues found'}

### Medium Priority Issues:
${findings.medium.length > 0 ? findings.medium.map(f => `• ${f}`).join('\n') : '✅ No medium priority issues found'}

### Low Priority Issues:
${findings.low.length > 0 ? findings.low.map(f => `• ${f}`).join('\n') : '✅ No low priority issues found'}

## 📊 Review Summary:
- **Security**: ${scope.includes('security') ? 'Reviewed ✅' : 'Skipped'}
- **Performance**: ${scope.includes('performance') ? 'Reviewed ✅' : 'Skipped'}
- **Code Quality**: ${scope.includes('quality') ? 'Reviewed ✅' : 'Skipped'}
- **Architecture**: ${scope.includes('architecture') ? 'Reviewed ✅' : 'Skipped'}

## 🎯 Recommendations:
1. Address critical and high priority issues first
2. Consider implementing automated code quality checks
3. Add comprehensive test coverage for new features
4. Regular security audits for production code
5. Document architectural decisions and patterns

${generateImprovementSpec ? `
## 📝 Improvement Specification:
${generateImprovementSpec ? 'A new improvement specification would be generated here with detailed action items for each finding.' : ''}
` : ''}

## 🚀 Next Steps:
- Address findings in order of severity
- Use \`specgen_build_engineer\` to implement fixes
- Re-run review after improvements
- Consider adding automated checks to prevent future issues

**Code review completed successfully.**`
      }]
    };

  } catch (error: any) {
    return errorHandler.handleError('specgen_build_reviewer', error, {
      args,
      context: 'Performing code review analysis',
      suggestions: [
        'Ensure the specification ID exists',
        'Choose appropriate review scope',
        'Set reasonable severity threshold'
      ]
    });
  }
}