import matter from 'gray-matter';
import { SpecDocument } from '../types/index.js';

/**
 * MarkdownGenerator - Bidirectional conversion between JSON and Markdown
 * Handles template-based generation and parsing for SpecGen v3.1
 */
export class MarkdownGenerator {

  /**
   * Generate markdown from JSON spec document
   */
  static generateFromJSON(spec: SpecDocument): string {
    // Create frontmatter
    const frontmatter: any = {
      title: spec.metadata.title,
      status: spec.metadata.status,
      category: spec.metadata.category,
      priority: spec.metadata.priority,
      created_at: spec.metadata.created_at,
      updated_at: spec.metadata.updated_at
    };

    // Add optional fields if they exist
    if (spec.metadata.created_via) frontmatter.created_via = spec.metadata.created_via;
    if (spec.metadata.related_specs) frontmatter.related_specs = spec.metadata.related_specs;
    if (spec.metadata.parent_spec_id) frontmatter.parent_spec_id = spec.metadata.parent_spec_id;
    if (spec.metadata.tags) frontmatter.tags = spec.metadata.tags;
    if (spec.metadata.effort_estimate) frontmatter.effort_estimate = spec.metadata.effort_estimate;
    if (spec.metadata.completion !== undefined) frontmatter.completion = spec.metadata.completion;

    // Build markdown content using template
    let content = `# ${spec.metadata.title}\n\n`;

    // Add summary section
    if (spec.sections.summary) {
      content += `## 📊 Executive Summary\n\n${spec.sections.summary}\n\n`;
    }

    // Add requirements section
    if (spec.sections.requirements) {
      content += `## 📝 Requirements\n\n${spec.sections.requirements}\n\n`;
    }

    // Add architecture section
    if (spec.sections.architecture) {
      content += `## 🏗️ Architecture\n\n${spec.sections.architecture}\n\n`;
    }

    // Add implementation section if it exists
    if (spec.sections.implementation) {
      content += `## 🛠️ Implementation\n\n${spec.sections.implementation}\n\n`;
    }

    // Add execution logs if they exist
    if (spec.sections.execution_logs) {
      content += `## 📈 Execution Logs\n\n${spec.sections.execution_logs}\n\n`;
    }

    // Add debug logs if they exist
    if (spec.sections.debug_logs) {
      content += `## 🐛 Debug Logs\n\n${spec.sections.debug_logs}\n\n`;
    }

    // Use gray-matter to combine frontmatter and content
    const result = matter.stringify(content, frontmatter);
    return result;
  }

  /**
   * Parse markdown to JSON spec document
   */
  static parseToJSON(markdown: string): SpecDocument {
    // Parse frontmatter and content
    const parsed = matter(markdown);
    const frontmatter = parsed.data;
    const content = parsed.content;

    // Extract metadata from frontmatter
    const metadata = {
      title: frontmatter.title || this.extractTitle(content),
      status: frontmatter.status || 'draft',
      category: frontmatter.category || 'General',
      priority: frontmatter.priority || 'medium',
      created_at: frontmatter.created_at || new Date().toISOString(),
      updated_at: frontmatter.updated_at || new Date().toISOString(),
      ...(frontmatter.created_via && { created_via: frontmatter.created_via }),
      ...(frontmatter.related_specs && { related_specs: frontmatter.related_specs }),
      ...(frontmatter.parent_spec_id && { parent_spec_id: frontmatter.parent_spec_id }),
      ...(frontmatter.tags && { tags: frontmatter.tags }),
      ...(frontmatter.effort_estimate && { effort_estimate: frontmatter.effort_estimate }),
      ...(frontmatter.completion !== undefined && { completion: frontmatter.completion })
    };

    // Parse sections from content
    const sections = this.parseSections(content);

    // Generate ID based on title if not provided
    const id = frontmatter.id || this.generateIdFromTitle(metadata.title);

    return {
      id,
      metadata,
      sections
    };
  }

  /**
   * Parse content into sections based on markdown headers
   */
  private static parseSections(content: string): SpecDocument['sections'] {
    const sections: SpecDocument['sections'] = {
      summary: '',
      requirements: '',
      architecture: '',
      implementation: '',
      execution_logs: '',
      debug_logs: ''
    };

    // Split content by ## headers
    const headerRegex = /^## (.+)$/gm;
    const parts = content.split(headerRegex);

    // Process each section
    for (let i = 1; i < parts.length; i += 2) {
      const headerText = parts[i].trim();
      const sectionContent = parts[i + 1]?.trim() || '';

      // Map headers to section keys
      const normalizedHeader = this.normalizeHeaderText(headerText);

      if (normalizedHeader.includes('summary') || normalizedHeader.includes('executive')) {
        sections.summary = sectionContent;
      } else if (normalizedHeader.includes('requirements') || normalizedHeader.includes('requirement')) {
        sections.requirements = sectionContent;
      } else if (normalizedHeader.includes('architecture') || normalizedHeader.includes('design')) {
        sections.architecture = sectionContent;
      } else if (normalizedHeader.includes('implementation') || normalizedHeader.includes('technical')) {
        sections.implementation = sectionContent;
      } else if (normalizedHeader.includes('execution') || normalizedHeader.includes('logs')) {
        sections.execution_logs = sectionContent;
      } else if (normalizedHeader.includes('debug') || normalizedHeader.includes('troubleshoot')) {
        sections.debug_logs = sectionContent;
      } else {
        // If we can't categorize it, add to implementation as fallback
        if (sections.implementation) {
          sections.implementation += `\n\n### ${headerText}\n\n${sectionContent}`;
        } else {
          sections.implementation = `### ${headerText}\n\n${sectionContent}`;
        }
      }
    }

    return sections;
  }

  /**
   * Normalize header text for section matching
   */
  private static normalizeHeaderText(headerText: string): string {
    return headerText
      .toLowerCase()
      .replace(/[📊📝🏗️🛠️📈🐛]/g, '') // Remove emojis
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim();
  }

  /**
   * Extract title from content if not in frontmatter
   */
  private static extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+)/m);
    return match ? match[1].trim() : 'Untitled';
  }

  /**
   * Generate ID from title for consistency
   */
  private static generateIdFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Update a specific section in markdown content
   * Returns updated markdown string
   */
  static updateMarkdownSection(
    markdown: string,
    sectionKey: keyof SpecDocument['sections'],
    newContent: string
  ): string {
    const spec = this.parseToJSON(markdown);
    spec.sections[sectionKey] = newContent;
    spec.metadata.updated_at = new Date().toISOString();
    return this.generateFromJSON(spec);
  }

  /**
   * Validate that markdown can be properly parsed
   */
  static validateMarkdown(markdown: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const parsed = matter(markdown);

      // Check for required frontmatter fields
      if (!parsed.data.title) {
        errors.push('Missing title in frontmatter');
      }

      // Check for basic content structure
      if (!parsed.content || parsed.content.trim().length < 10) {
        errors.push('Content is too short or empty');
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Parsing error: ${error}`);
      return { valid: false, errors };
    }
  }

  /**
   * Get content preview for display purposes
   */
  static getPreview(spec: SpecDocument, maxLength: number = 200): string {
    const content = spec.sections.summary || spec.sections.requirements || spec.sections.architecture;
    if (!content) return 'No content available';

    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  }
}