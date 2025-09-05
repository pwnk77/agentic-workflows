import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { glob } from 'glob';

export interface SpecMetadata {
  id: number;
  title: string;
  status: 'draft' | 'todo' | 'in-progress' | 'done';
  category: string;
  file_path: string;
  file_size: number;
  checksum: string;
  created_at: string;
  updated_at: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface SpecsMetadataIndex {
  version: string;
  project: {
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
  settings: {
    auto_organize: boolean;
    default_status: string;
    default_priority: string;
    categories: string[];
  };
  specs: Record<string, SpecMetadata>;
  next_id: number;
  search_index: {
    version: string;
    last_rebuilt: string;
    token_count: number;
  };
}

export interface SpecFrontmatter {
  id: number;
  title: string;
  status: 'draft' | 'todo' | 'in-progress' | 'done';
  category: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  created_via: string;
  related_specs?: number[];
  parent_spec_id?: number | null;
  tags?: string[];
  effort_estimate?: string | null;
  completion?: number;
}

export interface CreateSpecData {
  title: string;
  body_md: string;
  status?: 'draft' | 'todo' | 'in-progress' | 'done';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  related_specs?: number[];
  parent_spec_id?: number | null;
  created_via?: string;
  effort_estimate?: string;
}

export interface UpdateSpecData {
  title?: string;
  body_md?: string;
  status?: 'draft' | 'todo' | 'in-progress' | 'done';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  related_specs?: number[];
  parent_spec_id?: number | null;
  effort_estimate?: string;
  completion?: number;
}

export interface Spec extends SpecFrontmatter {
  body_md: string;
}

export class FileSpecService {
  private metadataPath = '../docs/specs-metadata.json';
  private docsPath = '../docs';
  private metadataCache: SpecsMetadataIndex | null = null;
  private fileLocks = new Map<string, Promise<void>>();

  /**
   * Initialize file-based storage system
   */
  async initialize(): Promise<void> {
    try {
      // 1. Create folder structure if missing
      await this.ensureFolderStructure();
      
      // 2. Load or create metadata
      await this.loadOrCreateMetadata();
      
      // 3. Scan for existing markdown files (but don't auto-organize)
      const existingSpecs = await this.scanExistingMarkdown();
      
      // 4. Auto-organization disabled for safety - use organize_docs tool instead
      console.log(`Found ${existingSpecs.length} existing markdown files (auto-organization disabled)`)
      
      // 5. Generate/update metadata index
      await this.buildMetadataFromFiles();
      
      console.log('FileSpecService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FileSpecService:', error);
      throw error;
    }
  }

  /**
   * Initialize a project with custom settings and discovery
   */
  async initializeProject(setup: {
    project_root?: string;
    discover_existing?: boolean;
    auto_organize?: boolean;
    project_name?: string;
    project_description?: string;
  }): Promise<void> {
    try {
      // Change working directory if project_root is provided
      if (setup.project_root && setup.project_root !== process.cwd()) {
        this.metadataPath = path.join(setup.project_root, 'docs', 'specs-metadata.json');
        this.docsPath = path.join(setup.project_root, 'docs');
      }

      // 1. Create folder structure if missing
      await this.ensureFolderStructure();
      
      // 2. Create metadata with custom project settings
      this.metadataCache = await this.createCustomMetadata(setup);
      
      // 3. Scan for existing markdown files if discovery is enabled
      let existingSpecs: string[] = [];
      if (setup.discover_existing !== false) {
        existingSpecs = await this.scanExistingMarkdown();
      }
      
      // 4. Standardize frontmatter for existing files
      if (existingSpecs.length > 0) {
        await this.standardizeAllFrontmatter(existingSpecs);
      }
      
      // 5. Auto-organization disabled for safety - use organize_docs tool instead  
      if (existingSpecs.length > 0) {
        console.log(`Found ${existingSpecs.length} existing markdown files. Use organize_docs tool to organize them.`);
      }
      
      // 6. Generate/update metadata index
      await this.buildMetadataFromFiles();
      
      console.log(`SpecGen project initialized successfully in ${setup.project_root || process.cwd()}`);
    } catch (error) {
      console.error('Failed to initialize SpecGen project:', error);
      throw error;
    }
  }

  /**
   * Create metadata structure with custom project settings
   */
  private async createCustomMetadata(setup: {
    project_name?: string;
    project_description?: string;
    auto_organize?: boolean;
  }): Promise<SpecsMetadataIndex> {
    // Detect project context and generate appropriate categories
    const contextualCategories = await this.detectProjectCategories(setup.project_name, setup.project_description);
    
    return {
      version: '2.0.0',
      project: {
        name: setup.project_name || 'Unnamed Project',
        description: setup.project_description || 'SpecGen managed project',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      settings: {
        auto_organize: setup.auto_organize !== false, // default true
        default_status: 'draft',
        default_priority: 'medium',
        categories: contextualCategories
      },
      specs: {},
      next_id: 1,
      search_index: {
        version: '1.0.0',
        last_rebuilt: new Date().toISOString(),
        token_count: 0
      }
    };
  }

  /**
   * Generate contextual category based on spec content analysis
   * This method creates appropriate category names based on the actual content
   */
  private async generateContextualCategory(title: string, content: string): Promise<string> {
    // Extract key information for analysis
    // Future: Could use analysisText for LLM-based categorization
    
    // For now, use intelligent pattern matching
    // In the future, this could be enhanced with LLM-based categorization via MCP
    return this.analyzeContentForCategory(title, content);
  }

  /**
   * Analyze content to determine contextual category
   */
  private analyzeContentForCategory(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase();
    
    // SpecGen and architecture-related content
    if (text.includes('specgen') || text.includes('spec generation') || 
        text.includes('clean architecture') || text.includes('system design') ||
        text.includes('database schema') || text.includes('architectural')) {
      return 'specgen-architecture';
    }
    
    // Claude Code hooks and automation
    if (text.includes('claude code') || text.includes('hook event') || 
        text.includes('posttooluse') || text.includes('automation workflow')) {
      return 'claude-code-automation';
    }
    
    // PDF and learning applications  
    if (text.includes('pdf learning') || text.includes('learning app') ||
        text.includes('educational') || text.includes('study tool')) {
      return 'learning-applications';
    }
    
    // Repository and workflow transformation
    if (text.includes('repository') || text.includes('workflow guide') ||
        text.includes('contribution guidelines') || text.includes('cursor rules')) {
      return 'repository-workflows';
    }
    
    // Dashboard and UI components
    if (text.includes('dashboard') || text.includes('modal') || 
        text.includes('ui component') || text.includes('frontend') ||
        text.includes('interactive') || text.includes('color improvement')) {
      return 'dashboard-ui';
    }
    
    // Migration and technical research
    if (text.includes('migration') || text.includes('typescript') || 
        text.includes('javascript') || text.includes('research log') ||
        text.includes('mcp server') || text.includes('sqlite')) {
      return 'technical-research';
    }
    
    // MCP and integration
    if (text.includes('mcp') || text.includes('commands integration') ||
        text.includes('server integration')) {
      return 'mcp-integration';
    }
    
    // Testing and workflows
    if (text.includes('test workflow') || text.includes('integration test')) {
      return 'testing-workflows';
    }
    
    // Default to general if no specific pattern matches
    return 'general';
  }

  /**
   * Detect appropriate categories based on project context
   */
  private async detectProjectCategories(projectName?: string, projectDescription?: string): Promise<string[]> {
    // const { categoryDetector } = await import('./category-detector.service.js');
    
    // Base categories that work for most projects
    const baseCategories = ['general', 'architecture', 'testing'];
    
    // Analyze project context to suggest relevant categories
    const contextText = `${projectName || ''} ${projectDescription || ''}`.toLowerCase();
    
    const conditionalCategories = [];
    
    // Add categories based on project context
    if (contextText.includes('auth') || contextText.includes('login') || contextText.includes('user')) {
      conditionalCategories.push('authentication');
    }
    
    if (contextText.includes('ui') || contextText.includes('frontend') || contextText.includes('component') || 
        contextText.includes('react') || contextText.includes('vue') || contextText.includes('angular')) {
      conditionalCategories.push('ui-components');
    }
    
    if (contextText.includes('payment') || contextText.includes('billing') || contextText.includes('stripe') || 
        contextText.includes('commerce') || contextText.includes('transaction')) {
      conditionalCategories.push('payments');
    }
    
    if (contextText.includes('api') || contextText.includes('backend') || contextText.includes('server') ||
        contextText.includes('endpoint') || contextText.includes('microservice')) {
      conditionalCategories.push('api');
    }
    
    if (contextText.includes('database') || contextText.includes('sql') || contextText.includes('nosql') ||
        contextText.includes('mongo') || contextText.includes('postgres')) {
      conditionalCategories.push('database');
    }
    
    if (contextText.includes('deploy') || contextText.includes('infrastructure') || contextText.includes('docker') ||
        contextText.includes('kubernetes') || contextText.includes('cloud')) {
      conditionalCategories.push('infrastructure');
    }
    
    if (contextText.includes('security') || contextText.includes('encryption') || contextText.includes('vulnerability')) {
      conditionalCategories.push('security');
    }
    
    if (contextText.includes('performance') || contextText.includes('optimization') || contextText.includes('cache')) {
      conditionalCategories.push('performance');
    }
    
    // Combine and deduplicate
    const allCategories = [...baseCategories, ...conditionalCategories];
    return [...new Set(allCategories)].sort();
  }

  /**
   * Scan for existing markdown files in the project
   */
  private async scanExistingMarkdown(): Promise<string[]> {
    const { glob } = await import('glob');
    
    try {
      // Search for markdown files in common documentation directories
      const patterns = [
        'docs/**/*.md',
        'documentation/**/*.md', 
        'specs/**/*.md',
        'specifications/**/*.md',
        '*.md', // Root directory
        '**/*SPEC*.md', // Any SPEC files
        '**/*spec*.md' // Any spec files
      ];
      
      let allFiles: string[] = [];
      
      for (const pattern of patterns) {
        try {
          const files = await glob(pattern, {
            ignore: ['node_modules/**', '.git/**', '.specgen/**', 'dist/**', 'build/**'],
            nodir: true
          });
          allFiles.push(...files);
        } catch (e) {
          // Continue with other patterns if one fails
          console.warn(`Failed to search pattern ${pattern}:`, e);
        }
      }
      
      // Remove duplicates and filter out our organized files
      const uniqueFiles = [...new Set(allFiles)].filter(file => {
        // Don't re-process files we've already organized
        return !file.startsWith('docs/draft/') && 
               !file.startsWith('docs/todo/') && 
               !file.startsWith('docs/in-progress/') && 
               !file.startsWith('docs/done/');
      });
      
      console.log(`Found ${uniqueFiles.length} existing markdown files to organize`);
      return uniqueFiles;
    } catch (error) {
      console.error('Error scanning for markdown files:', error);
      return [];
    }
  }

  /**
   * Preview organization changes without executing them
   */
  async previewOrganization(): Promise<{
    files_found: number;
    changes: Array<{
      current_path: string;
      proposed_path: string;
      reason: string;
      category: string;
      title: string;
    }>;
    safe_to_proceed: boolean;
    warnings: string[];
  }> {
    try {
      const existingSpecs = await this.scanExistingMarkdown();
      const changes: Array<{
        current_path: string;
        proposed_path: string;
        reason: string;
        category: string;
        title: string;
      }> = [];
      const warnings: string[] = [];

      for (const filePath of existingSpecs) {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const parsed = this.parseMarkdown(content);
          
          // Get proposed new path
          const proposedPath = this.getSpecPath(parsed.frontmatter);
          
          if (filePath !== proposedPath) {
            changes.push({
              current_path: filePath,
              proposed_path: proposedPath,
              reason: `Organize into category-based structure`,
              category: parsed.frontmatter.category,
              title: parsed.frontmatter.title
            });
          }
        } catch (error) {
          warnings.push(`Could not process ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        files_found: existingSpecs.length,
        changes,
        safe_to_proceed: changes.length > 0 && warnings.length === 0,
        warnings
      };
    } catch (error) {
      throw new Error(`Failed to preview organization: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute the organization with user confirmation
   */
  async organizeDocsWithConfirmation(): Promise<{
    success: boolean;
    organized_count: number;
    errors: string[];
  }> {
    const preview = await this.previewOrganization();
    
    if (!preview.safe_to_proceed) {
      return {
        success: false,
        organized_count: 0,
        errors: preview.warnings
      };
    }

    const errors: string[] = [];
    let organized_count = 0;

    for (const change of preview.changes) {
      try {
        const content = await fs.readFile(change.current_path, 'utf-8');
        
        // Ensure destination directory exists
        await fs.mkdir(path.dirname(change.proposed_path), { recursive: true });
        
        // Move the file
        await fs.writeFile(change.proposed_path, content, 'utf-8');
        await fs.unlink(change.current_path);
        
        organized_count++;
        console.log(`✅ Moved: ${change.current_path} → ${change.proposed_path}`);
      } catch (error) {
        errors.push(`Failed to move ${change.current_path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Update metadata after organization
    await this.buildMetadataFromFiles();

    return {
      success: errors.length === 0,
      organized_count,
      errors
    };
  }

  /**
   * Organize existing specs into the proper folder structure with contextual categorization
   * @deprecated Use organizeDocsWithConfirmation() instead for safety
   */
  // @ts-ignore - Unused but kept for compatibility
  private async organizeExistingSpecs(specFiles: string[]): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    for (const filePath of specFiles) {
      try {
        // Read the file content
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Parse frontmatter if it exists
        let title = '';
        let category = '';
        let status = 'draft';
        let body = content;
        let existingFrontmatter: any = {};
        
        if (content.startsWith('---')) {
          const frontmatterMatch = content.match(/^---\n(.*?)\n---\n(.*)/s);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            body = frontmatterMatch[2];
            
            // Parse existing frontmatter
            const lines = frontmatter.split('\n');
            for (const line of lines) {
              const match = line.match(/^(\w+):\s*(.*)$/);
              if (match) {
                const [, key, value] = match;
                existingFrontmatter[key] = value.replace(/^["']|["']$/g, '');
              }
            }
            
            title = existingFrontmatter.title || '';
            category = existingFrontmatter.category || '';
            status = existingFrontmatter.status || 'draft';
          }
        }
        
        // If no title from frontmatter, extract from filename or first heading
        if (!title) {
          const basename = path.basename(filePath, '.md');
          if (basename.startsWith('SPEC-')) {
            // Extract title from SPEC filename
            title = basename.replace(/^SPEC-\d+/, '').replace(/^-/, '').replace(/-/g, ' ');
          } else {
            // Use first heading or filename
            const headingMatch = body.match(/^#\s+(.+)$/m);
            title = headingMatch ? headingMatch[1] : basename.replace(/-/g, ' ');
          }
        }
        
        // Generate contextual category based on content analysis
        if (!category) {
          category = await this.generateContextualCategory(title, body);
        }
        
        // Create the spec with enhanced frontmatter
        const spec = await this.createSpec({
          title,
          body_md: body,
          status: status as any,
          category,
          created_via: 'discovery',
          priority: 'medium'
        });
        
        const targetPath = this.getSpecPath({
          id: spec.id,
          title: spec.title,
          status: spec.status,
          category: spec.category,
          priority: spec.priority,
          created_at: spec.created_at,
          updated_at: spec.updated_at,
          created_via: spec.created_via,
          related_specs: spec.related_specs,
          parent_spec_id: spec.parent_spec_id,
          tags: spec.tags,
          effort_estimate: spec.effort_estimate,
          completion: spec.completion
        });
        console.log(`Organized: ${filePath} -> ${targetPath} [Category: ${category}]`);
        
        // Remove the original file
        await fs.unlink(filePath);
        
      } catch (error) {
        console.error(`Failed to organize ${filePath}:`, error);
      }
    }
  }


  /**
   * Ensure folder structure exists for given categories
   */
  private async ensureFolderStructure(categories: string[] = []): Promise<void> {
    // Ensure basic docs directory exists
    await fs.mkdir(this.docsPath, { recursive: true });
    
    // If specific categories provided, create those folders
    for (const category of categories) {
      const dirPath = path.join(this.docsPath, category);
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Ensure folder structure exists for a specific category
   */
  private async ensureCategoryFolders(category: string): Promise<void> {
    const dirPath = path.join(this.docsPath, category);
    await fs.mkdir(dirPath, { recursive: true });
  }

  /**
   * Load metadata or create new one
   */
  private async loadOrCreateMetadata(): Promise<SpecsMetadataIndex> {
    try {
      const content = await fs.readFile(this.metadataPath, 'utf-8');
      this.metadataCache = JSON.parse(content);
      return this.metadataCache!;
    } catch (error) {
      // Create new metadata if file doesn't exist
      this.metadataCache = await this.createEmptyMetadata();
      await this.saveMetadata(this.metadataCache);
      return this.metadataCache;
    }
  }

  /**
   * Create empty metadata structure
   */
  private async createEmptyMetadata(): Promise<SpecsMetadataIndex> {
    return {
      version: '2.0.0',
      project: {
        name: 'Project',
        description: 'Specification management',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      settings: {
        auto_organize: true,
        default_status: 'draft',
        default_priority: 'medium',
        categories: ['general', 'authentication', 'ui-components', 'payments', 'architecture', 'infrastructure', 'testing']
      },
      specs: {},
      next_id: 1,
      search_index: {
        version: '1.0.0',
        last_rebuilt: new Date().toISOString(),
        token_count: 0
      }
    };
  }

  /**
   * Save metadata to file with atomic write
   */
  private async saveMetadata(metadata: SpecsMetadataIndex): Promise<void> {
    const content = JSON.stringify(metadata, null, 2);
    const tempPath = `${this.metadataPath}.tmp`;
    
    await this.withLock(this.metadataPath, async () => {
      await fs.writeFile(tempPath, content, 'utf-8');
      await fs.rename(tempPath, this.metadataPath);
      this.metadataCache = metadata;
    });
  }

  /**
   * Load metadata from cache or file
   */
  async loadMetadata(): Promise<SpecsMetadataIndex> {
    if (this.metadataCache) {
      return this.metadataCache;
    }
    return await this.loadOrCreateMetadata();
  }


  /**
   * Check if content has frontmatter
   */
  private hasFrontmatter(content: string): boolean {
    return content.startsWith('---\n');
  }

  /**
   * Parse markdown content with frontmatter
   */
  parseMarkdown(content: string): { frontmatter: SpecFrontmatter; body: string } {
    if (!this.hasFrontmatter(content)) {
      throw new Error('Content does not have frontmatter');
    }
    
    const lines = content.split('\n');
    let frontmatterEnd = -1;
    
    // Find end of frontmatter
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        frontmatterEnd = i;
        break;
      }
    }
    
    if (frontmatterEnd === -1) {
      throw new Error('Invalid frontmatter format');
    }
    
    // Parse YAML frontmatter (simple parser for our needs)
    const frontmatterLines = lines.slice(1, frontmatterEnd);
    const frontmatter: any = {};
    
    for (const line of frontmatterLines) {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          const items = value.slice(1, -1).split(',').map(v => v.trim()).filter(v => v);
          frontmatter[key] = items.map(item => {
            // Try to parse as number first
            const num = Number(item);
            if (!isNaN(num) && item.match(/^\d+$/)) {
              return num;
            }
            // Handle quoted strings
            if ((item.startsWith('"') && item.endsWith('"')) ||
                (item.startsWith("'") && item.endsWith("'"))) {
              return item.slice(1, -1);
            }
            return item;
          });
        }
        // Handle null
        else if (value === 'null' || value === '') {
          frontmatter[key] = null;
        }
        // Handle numbers
        else if (!isNaN(Number(value))) {
          frontmatter[key] = Number(value);
        }
        // Handle strings with quotes
        else if ((value.startsWith('"') && value.endsWith('"')) || 
                 (value.startsWith("'") && value.endsWith("'"))) {
          frontmatter[key] = value.slice(1, -1);
        }
        // Default to string
        else {
          frontmatter[key] = value;
        }
      }
    }
    
    const body = lines.slice(frontmatterEnd + 1).join('\n').trim();
    
    return { frontmatter: frontmatter as SpecFrontmatter, body };
  }

  /**
   * Build markdown with comprehensive frontmatter
   */
  buildMarkdown(frontmatter: SpecFrontmatter, body: string): string {
    const yamlLines = [
      '---',
      `id: ${frontmatter.id}`,
      `title: "${frontmatter.title}"`,
      `status: "${frontmatter.status}"`,
      `category: "${frontmatter.category}"`,
      `priority: "${frontmatter.priority || 'medium'}"`,
      `created_at: "${frontmatter.created_at}"`,
      `updated_at: "${frontmatter.updated_at}"`,
      `created_via: "${frontmatter.created_via || 'manual'}"`,
      `related_specs: [${(frontmatter.related_specs || []).join(', ')}]`,
      `parent_spec_id: ${frontmatter.parent_spec_id || 'null'}`,
      `tags: [${(frontmatter.tags || []).map(t => `"${t}"`).join(', ')}]`,
      `effort_estimate: ${frontmatter.effort_estimate ? `"${frontmatter.effort_estimate}"` : 'null'}`,
      `completion: ${frontmatter.completion || 0}`,
      '---',
      '',
      body.trim()
    ];
    
    return yamlLines.join('\n');
  }

  /**
   * Standardize frontmatter across all files - add missing fields
   */
  private async standardizeFrontmatter(filePath: string, content: string): Promise<string> {
    let frontmatter: SpecFrontmatter;
    let body: string;

    if (this.hasFrontmatter(content)) {
      const parsed = this.parseMarkdown(content);
      frontmatter = parsed.frontmatter;
      body = parsed.body;
    } else {
      // Create frontmatter for files that don't have it
      const metadata = await this.loadMetadata();
      const id = metadata.next_id++;
      const filename = path.basename(filePath, '.md');
      const title = this.extractTitle(content) || this.humanize(filename);
      const category = await this.generateContextualCategory(title, content);

      frontmatter = {
        id,
        title,
        status: this.detectStatus(filePath) || 'draft',
        category,
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_via: 'standardization',
        related_specs: [],
        parent_spec_id: null,
        tags: this.extractTags(content),
        effort_estimate: null,
        completion: 0
      };

      body = content;
      await this.saveMetadata(metadata);
    }

    // Ensure all required fields are present with defaults
    frontmatter.priority = frontmatter.priority || 'medium';
    frontmatter.created_via = frontmatter.created_via || 'manual';
    frontmatter.related_specs = frontmatter.related_specs || [];
    frontmatter.parent_spec_id = frontmatter.parent_spec_id || null;
    frontmatter.tags = frontmatter.tags || this.extractTags(body);
    frontmatter.effort_estimate = frontmatter.effort_estimate || null;
    frontmatter.completion = frontmatter.completion || 0;

    return this.buildMarkdown(frontmatter, body);
  }

  /**
   * Standardize frontmatter across all existing files
   */
  private async standardizeAllFrontmatter(specFiles: string[]): Promise<void> {
    const fs = await import('fs/promises');
    
    console.log(`Standardizing frontmatter for ${specFiles.length} files...`);
    
    for (const filePath of specFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const standardizedContent = await this.standardizeFrontmatter(filePath, content);
        
        // Only rewrite if content changed
        if (standardizedContent !== content) {
          await fs.writeFile(filePath, standardizedContent, 'utf-8');
          console.log(`Standardized frontmatter: ${filePath}`);
        }
      } catch (error) {
        console.error(`Failed to standardize frontmatter for ${filePath}:`, error);
      }
    }
    
    console.log('Frontmatter standardization complete.');
  }

  /**
   * Get spec file path based on frontmatter
   */
  private getSpecPath(frontmatter: SpecFrontmatter): string {
    const filename = `SPEC-${String(frontmatter.id).padStart(3, '0')}-${this.slugify(frontmatter.title)}.md`;
    return path.join(this.docsPath, frontmatter.category, filename);
  }

  /**
   * Create new specification
   */
  async createSpec(data: CreateSpecData): Promise<Spec> {
    const metadata = await this.loadMetadata();
    const id = metadata.next_id++;
    
    // Auto-detect category if not provided
    let category = data.category;
    
    if (!category) {
      // Try smart categorization first
      const smartCategory = await this.smartCategorize(data.title, data.body_md);
      if (smartCategory && smartCategory.confidence !== 'low') {
        category = smartCategory.category;
      } else {
        // Fall back to regex-based detection
        category = await this.detectCategory(data.title, data.body_md);
      }
    }
    
    // Generate frontmatter
    const frontmatter: SpecFrontmatter = {
      id,
      title: data.title,
      status: data.status || 'draft',
      category,
      priority: data.priority || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_via: data.created_via || 'manual',
      related_specs: data.related_specs || [],
      parent_spec_id: data.parent_spec_id || null,
      tags: this.extractTags(data.body_md),
      effort_estimate: data.effort_estimate || null,
      completion: 0
    };
    
    // Create markdown with frontmatter
    const markdown = this.buildMarkdown(frontmatter, data.body_md);
    const filePath = this.getSpecPath(frontmatter);
    
    // Ensure category folder structure exists
    await this.ensureCategoryFolders(category);
    
    // Write file
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, markdown, 'utf-8');
    
    // Update metadata
    metadata.specs[id] = {
      id,
      title: data.title,
      status: frontmatter.status,
      category: frontmatter.category,
      file_path: filePath,
      file_size: markdown.length,
      checksum: this.calculateChecksum(markdown),
      created_at: frontmatter.created_at,
      updated_at: frontmatter.updated_at,
      priority: frontmatter.priority
    };
    
    await this.saveMetadata(metadata);
    
    return {
      ...frontmatter,
      body_md: data.body_md
    };
  }

  /**
   * Update existing specification
   */
  async updateSpec(id: number, updates: UpdateSpecData): Promise<Spec> {
    const metadata = await this.loadMetadata();
    const specMeta = metadata.specs[id];
    if (!specMeta) {
      throw new Error(`Spec ${id} not found`);
    }
    
    // Read current file
    const content = await fs.readFile(specMeta.file_path, 'utf-8');
    const { frontmatter, body } = this.parseMarkdown(content);
    
    // Apply updates to frontmatter
    const updatedFrontmatter = { ...frontmatter };
    if (updates.title !== undefined) updatedFrontmatter.title = updates.title;
    if (updates.status !== undefined) updatedFrontmatter.status = updates.status;
    if (updates.category !== undefined) updatedFrontmatter.category = updates.category;
    if (updates.priority !== undefined) updatedFrontmatter.priority = updates.priority;
    if (updates.related_specs !== undefined) updatedFrontmatter.related_specs = updates.related_specs;
    if (updates.parent_spec_id !== undefined) updatedFrontmatter.parent_spec_id = updates.parent_spec_id;
    if (updates.effort_estimate !== undefined) updatedFrontmatter.effort_estimate = updates.effort_estimate;
    if (updates.completion !== undefined) updatedFrontmatter.completion = updates.completion;
    
    updatedFrontmatter.updated_at = new Date().toISOString();
    
    // Handle status/category changes (requires file move)
    const oldPath = specMeta.file_path;
    const newPath = this.getSpecPath(updatedFrontmatter);
    
    // Update content
    const newBody = updates.body_md !== undefined ? updates.body_md : body;
    const newMarkdown = this.buildMarkdown(updatedFrontmatter, newBody);
    
    // Write to new location (or overwrite)
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.writeFile(newPath, newMarkdown, 'utf-8');
    
    // Remove old file if moved
    if (oldPath !== newPath) {
      try {
        await fs.unlink(oldPath);
        await this.cleanupEmptyDirs(path.dirname(oldPath));
      } catch (error) {
        console.error('Failed to remove old file:', error);
      }
    }
    
    // Update metadata
    metadata.specs[id] = {
      ...specMeta,
      title: updatedFrontmatter.title,
      status: updatedFrontmatter.status,
      category: updatedFrontmatter.category,
      file_path: newPath,
      file_size: newMarkdown.length,
      checksum: this.calculateChecksum(newMarkdown),
      updated_at: updatedFrontmatter.updated_at,
      priority: updatedFrontmatter.priority
    };
    
    await this.saveMetadata(metadata);
    
    return {
      ...updatedFrontmatter,
      body_md: newBody
    };
  }

  /**
   * Get specification by ID
   */
  async getSpecById(id: number): Promise<Spec | null> {
    const metadata = await this.loadMetadata();
    const specMeta = metadata.specs[id];
    
    if (!specMeta) {
      return null;
    }
    
    try {
      const content = await fs.readFile(specMeta.file_path, 'utf-8');
      const { frontmatter, body } = this.parseMarkdown(content);
      
      return {
        ...frontmatter,
        body_md: body
      };
    } catch (error) {
      console.error(`Failed to read spec ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete specification
   */
  async deleteSpec(id: number): Promise<void> {
    const metadata = await this.loadMetadata();
    const specMeta = metadata.specs[id];
    
    if (!specMeta) {
      throw new Error(`Spec ${id} not found`);
    }
    
    // Delete file
    try {
      await fs.unlink(specMeta.file_path);
      await this.cleanupEmptyDirs(path.dirname(specMeta.file_path));
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
    
    // Remove from metadata
    delete metadata.specs[id];
    await this.saveMetadata(metadata);
  }

  /**
   * List specifications with filters
   */
  async listSpecs(options: {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<{ specs: SpecMetadata[]; total: number }> {
    const metadata = await this.loadMetadata();
    let specs = Object.values(metadata.specs);
    
    // Apply filters
    if (options.status) {
      specs = specs.filter(s => s.status === options.status);
    }
    if (options.category) {
      specs = specs.filter(s => s.category === options.category);
    }
    
    // Apply sorting
    if (options.sort_by) {
      specs.sort((a, b) => {
        const aVal = (a as any)[options.sort_by!];
        const bVal = (b as any)[options.sort_by!];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return options.sort_order === 'desc' ? -comparison : comparison;
      });
    }
    
    // Apply pagination
    const start = options.offset || 0;
    const end = start + (options.limit || 100);
    
    return {
      specs: specs.slice(start, end),
      total: specs.length
    };
  }

  /**
   * Build metadata from existing files
   */
  private async buildMetadataFromFiles(): Promise<void> {
    const metadata = await this.loadMetadata();
    const files = await glob(path.join(this.docsPath, '**/*.md'));
    
    // Clear existing specs
    metadata.specs = {};
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        if (this.hasFrontmatter(content)) {
          const { frontmatter } = this.parseMarkdown(content);
          const stats = await fs.stat(file);
          
          metadata.specs[frontmatter.id] = {
            id: frontmatter.id,
            title: frontmatter.title,
            status: frontmatter.status,
            category: frontmatter.category,
            file_path: file,
            file_size: stats.size,
            checksum: this.calculateChecksum(content),
            created_at: frontmatter.created_at,
            updated_at: frontmatter.updated_at,
            priority: frontmatter.priority
          };
        }
      } catch (error) {
        console.error(`Failed to index ${file}:`, error);
      }
    }
    
    metadata.project.updated_at = new Date().toISOString();
    await this.saveMetadata(metadata);
  }

  // Helper methods

  private calculateChecksum(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private async withLock<T>(key: string, operation: () => Promise<T>): Promise<T> {
    // Wait for existing lock
    if (this.fileLocks.has(key)) {
      await this.fileLocks.get(key);
    }
    
    // Create new lock
    let resolve: () => void;
    const lock = new Promise<void>(r => { resolve = r; });
    this.fileLocks.set(key, lock);
    
    try {
      return await operation();
    } finally {
      this.fileLocks.delete(key);
      resolve!();
    }
  }

  private extractTitle(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : null;
  }

  private humanize(str: string): string {
    return str
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\bSpec\b/gi, '')
      .trim();
  }

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  private detectStatus(filePath: string): 'draft' | 'todo' | 'in-progress' | 'done' | null {
    if (filePath.includes('/done/') || filePath.includes('completed')) return 'done';
    if (filePath.includes('/in-progress/') || filePath.includes('wip')) return 'in-progress';
    if (filePath.includes('/todo/') || filePath.includes('planned')) return 'todo';
    if (filePath.includes('/draft/')) return 'draft';
    return null;
  }

  /**
   * Smart categorization using similarity matching
   */
  private async smartCategorize(title: string, content: string): Promise<{ category: string; confidence: 'high' | 'medium' | 'low'; score: number } | null> {
    try {
      // Import similarity utilities
      const { findBestMatch, calculateConfidence } = await import('../utils/similarity.js');
      
      // Get existing specs to build category samples
      const metadata = await this.loadMetadata();
      const categoryTexts: Map<string, string[]> = new Map();
      
      // Aggregate text samples by category
      for (const spec of Object.values(metadata.specs)) {
        if (!categoryTexts.has(spec.category)) {
          categoryTexts.set(spec.category, []);
        }
        categoryTexts.get(spec.category)?.push(spec.title);
      }
      
      // Build candidates from existing categories
      const candidates: Array<{ id: string; text: string; keywords?: string[] }> = [];
      const categoryKeywords: Record<string, string[]> = {
        'authentication': ['auth', 'login', 'oauth', 'sso', 'jwt', 'token', 'password', 'session'],
        'payments': ['payment', 'billing', 'stripe', 'paypal', 'transaction', 'invoice', 'subscription'],
        'ui-components': ['component', 'widget', 'button', 'form', 'modal', 'layout', 'design', 'theme'],
        'database': ['database', 'schema', 'migration', 'query', 'sql', 'orm', 'model', 'table'],
        'api': ['api', 'endpoint', 'rest', 'graphql', 'webhook', 'request', 'response', 'http'],
        'testing': ['test', 'testing', 'unit', 'integration', 'e2e', 'mock', 'assertion', 'coverage'],
        'deployment': ['deploy', 'ci', 'cd', 'docker', 'kubernetes', 'aws', 'cloud', 'infrastructure'],
        'monitoring': ['monitor', 'logging', 'metrics', 'alert', 'observability', 'tracing', 'analytics'],
        'security': ['security', 'vulnerability', 'encryption', 'firewall', 'compliance', 'audit', 'permission'],
        'performance': ['performance', 'optimization', 'cache', 'speed', 'latency', 'throughput', 'scaling']
      };
      
      for (const [category, texts] of categoryTexts.entries()) {
        candidates.push({
          id: category,
          text: texts.join(' '),
          keywords: categoryKeywords[category] || []
        });
      }
      
      // If no existing categories, return null to fall back to regex detection
      if (candidates.length === 0) {
        return null;
      }
      
      // Combine title and content for analysis
      const targetText = `${title} ${content}`;
      
      // Find best matching category
      const matches = findBestMatch(targetText, candidates);
      if (matches.length === 0) {
        return null;
      }
      
      const topMatch = matches[0];
      const confidence = calculateConfidence(topMatch.similarity.score);
      
      return {
        category: topMatch.id,
        confidence,
        score: topMatch.similarity.score
      };
    } catch (error) {
      console.error('Smart categorization failed:', error);
      return null;
    }
  }

  private async detectCategory(title: string, content: string): Promise<string> {
    // This will be implemented by CategoryDetector
    const text = `${title} ${content}`.toLowerCase();
    
    const patterns = {
      authentication: /auth|login|signup|oauth|sso|password|credential/i,
      payments: /payment|stripe|billing|subscription|invoice|checkout/i,
      'ui-components': /component|button|form|modal|layout|design|style/i,
      architecture: /database|schema|migration|model|architecture|system/i,
      infrastructure: /deploy|docker|kubernetes|ci|cd|monitoring/i,
      testing: /test|spec|jest|cypress|unit|integration|e2e/i
    };
    
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return category;
      }
    }
    
    return 'general';
  }

  extractTags(content: string): string[] {
    const tags = new Set<string>();
    
    // Extract hashtags
    const hashtagMatches = content.match(/#(\w+)/g);
    if (hashtagMatches) {
      hashtagMatches.forEach(tag => tags.add(tag.slice(1).toLowerCase()));
    }
    
    // Extract common keywords
    const keywords = ['api', 'database', 'frontend', 'backend', 'security', 'performance'];
    keywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        tags.add(keyword);
      }
    });
    
    return Array.from(tags).slice(0, 10);
  }

  private async cleanupEmptyDirs(dirPath: string): Promise<void> {
    try {
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.rmdir(dirPath);
        // Recursively check parent
        const parentDir = path.dirname(dirPath);
        if (parentDir !== this.docsPath && parentDir !== '.') {
          await this.cleanupEmptyDirs(parentDir);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be removed
    }
  }
}

// Export singleton instance
export const fileSpecService = new FileSpecService();