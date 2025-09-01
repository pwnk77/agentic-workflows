import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

export interface CommandResult {
  success: boolean;
  spec_id?: number;
  spec_url?: string;
  message: string;
  error?: string;
  data?: any;
}

export interface MCPToolSet {
  create_spec_with_grouping: (args: any) => Promise<any>;
  search_related_specs: (args: any) => Promise<any>;
  get_spec: (args: any) => Promise<any>;
  update_spec: (args: any) => Promise<any>;
  update_spec_relationships: (args: any) => Promise<any>;
  list_specs: (args: any) => Promise<any>;
}

/**
 * Base class for MCP-integrated Claude Code commands
 */
export abstract class MCPCommand {
  protected projectRoot: string;
  protected mcpTools: MCPToolSet;

  constructor() {
    this.projectRoot = this.detectProject(process.cwd());
    this.mcpTools = this.initializeMCPTools();
  }

  /**
   * Execute the command with given arguments
   */
  abstract execute(args: string[]): Promise<CommandResult>;

  /**
   * Detect the project root directory
   */
  protected detectProject(startDir: string): string {
    let currentDir = startDir;
    
    // Look for project indicators
    const projectIndicators = [
      'package.json',
      '.git',
      'pyproject.toml',
      'Cargo.toml',
      '.specgen'
    ];

    while (currentDir !== path.dirname(currentDir)) {
      for (const indicator of projectIndicators) {
        if (existsSync(path.join(currentDir, indicator))) {
          return currentDir;
        }
      }
      currentDir = path.dirname(currentDir);
    }

    // If no project root found, use current directory
    return startDir;
  }

  /**
   * Initialize MCP tools for spec operations
   */
  protected initializeMCPTools(): MCPToolSet {
    // Mock implementation - in real usage, this would connect to the MCP server
    // For now, we'll use direct service calls
    return {
      create_spec_with_grouping: async (args: any) => {
        try {
          // Import services dynamically to avoid circular dependencies
          const { SpecService, CreateSpecData } = await import('../../../specgen/src/services/spec.service');
          const { SpecGroupingService } = await import('../../../specgen/src/services/grouping.service');
          const { RelationshipService } = await import('../../../specgen/src/services/relationship.service');

          const detectedFeatureGroup = args.feature_group || SpecGroupingService.detectFeatureGroup(args.title, args.body_md);
          const detectedThemeCategory = args.theme_category || SpecGroupingService.detectThemeCategory(detectedFeatureGroup, args.body_md);
          const detectedPriority = args.priority || SpecGroupingService.detectPriority(args.title, args.body_md);

          const spec = SpecService.createSpec({
            ...args,
            feature_group: detectedFeatureGroup,
            theme_category: detectedThemeCategory,
            priority: detectedPriority
          } as CreateSpecData);

          const relationshipSuggestions = RelationshipService.autoDetectRelationships(spec);

          return {
            success: true,
            spec,
            spec_id: spec.id,
            spec_url: `spec://${spec.id}`,
            detected_grouping: {
              feature_group: detectedFeatureGroup,
              theme_category: detectedThemeCategory,
              priority: detectedPriority
            },
            suggested_relationships: relationshipSuggestions
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      },

      search_related_specs: async (args: any) => {
        try {
          const { SpecService } = await import('../../../specgen/src/services/spec.service');
          const { RelationshipService } = await import('../../../specgen/src/services/relationship.service');

          if (args.current_spec_id) {
            const currentSpec = SpecService.getSpecById(args.current_spec_id);
            if (!currentSpec) {
              return { success: false, error: `Specification with ID ${args.current_spec_id} not found` };
            }

            const relatedSpecs = RelationshipService.findRelatedSpecs(currentSpec, {
              limit: args.limit || 10,
              minScore: 0.2
            });

            return {
              success: true,
              specs: relatedSpecs.map(rel => {
                const spec = SpecService.getSpecById(rel.spec_id)!;
                return { ...spec, relationship_score: rel.score, relationship_reason: rel.reason };
              }),
              relationship_suggestions: relatedSpecs
            };
          } else {
            const result = SpecService.searchSpecs(args.query, args);
            return { success: true, specs: result.results, ...result };
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      },

      get_spec: async (args: any) => {
        try {
          const { SpecService } = await import('../../../specgen/src/services/spec.service');
          const spec = SpecService.getSpecById(args.spec_id);
          
          if (!spec) {
            return { success: false, error: `Specification with ID ${args.spec_id} not found` };
          }

          let result: any = { success: true, spec };

          if (args.include_relations && spec.related_specs) {
            try {
              const relatedSpecIds = JSON.parse(spec.related_specs);
              const relatedSpecs = relatedSpecIds.map((id: number) => SpecService.getSpecById(id)).filter(Boolean);
              result.related_specs = relatedSpecs;
            } catch (e) {
              // Related specs JSON parsing failed, continue without relations
            }
          }

          return result;
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      },

      update_spec: async (args: any) => {
        try {
          const { SpecService, UpdateSpecData } = await import('../../../specgen/src/services/spec.service');
          const { spec_id, ...updates } = args;
          
          const spec = SpecService.updateSpec(spec_id, updates as UpdateSpecData);
          
          if (!spec) {
            return { success: false, error: `Specification with ID ${spec_id} not found` };
          }
          
          return { success: true, spec };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      },

      update_spec_relationships: async (args: any) => {
        try {
          const { RelationshipService } = await import('../../../specgen/src/services/relationship.service');
          const { SpecService } = await import('../../../specgen/src/services/spec.service');
          
          const success = RelationshipService.updateSpecRelationships(args.spec_id, args.related_specs, args.parent_spec_id);
          
          if (!success) {
            return { success: false, error: `Failed to update relationships for specification with ID ${args.spec_id}` };
          }
          
          const spec = SpecService.getSpecById(args.spec_id);
          const hierarchy = RelationshipService.getSpecHierarchy(args.spec_id);
          
          return { success: true, spec, hierarchy };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      },

      list_specs: async (args: any) => {
        try {
          const { SpecService } = await import('../../../specgen/src/services/spec.service');
          const result = SpecService.listSpecs(args || {});
          return { success: true, ...result };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    };
  }

  /**
   * Parse implementation tasks from spec markdown content
   */
  protected parseImplementationTasks(bodyMd: string): Array<{ id: string; description: string; status: string }> {
    const tasks: Array<{ id: string; description: string; status: string }> = [];
    const lines = bodyMd.split('\n');
    
    let inImplementationSection = false;
    let currentTaskId = '';
    
    for (const line of lines) {
      // Detect implementation plan section
      if (line.match(/^##\s+Implementation\s+Plan/i)) {
        inImplementationSection = true;
        continue;
      }
      
      // Stop at next major section
      if (inImplementationSection && line.match(/^##\s+/)) {
        if (!line.match(/^##\s+Implementation\s+Plan/i)) {
          break;
        }
      }
      
      if (inImplementationSection) {
        // Match task items like "- [ ] **CMD-001**: Task description"
        const taskMatch = line.match(/^-\s+\[([x\s])\]\s+\*\*([^*]+)\*\*:\s*(.+)/);
        if (taskMatch) {
          const [, status, taskId, description] = taskMatch;
          tasks.push({
            id: taskId.trim(),
            description: description.trim(),
            status: status.trim() === 'x' ? 'completed' : 'pending'
          });
          currentTaskId = taskId.trim();
        }
      }
    }
    
    return tasks;
  }

  /**
   * Update task progress in spec markdown content
   */
  protected updateTaskProgress(bodyMd: string, taskId: string, newStatus: 'completed' | 'pending'): string {
    const lines = bodyMd.split('\n');
    const checkbox = newStatus === 'completed' ? '[x]' : '[ ]';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const taskMatch = line.match(/^(-\s+)\[([x\s])\](\s+\*\*[^*]+\*\*:\s*.+)/);
      if (taskMatch && line.includes(taskId)) {
        lines[i] = `${taskMatch[1]}${checkbox}${taskMatch[3]}`;
        break;
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Log progress to console
   */
  protected log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  /**
   * Format success message with spec URL
   */
  protected formatSuccessMessage(title: string, specId: number, additionalInfo?: string): string {
    const baseMessage = `✓ ${title} (spec://${specId})`;
    return additionalInfo ? `${baseMessage} - ${additionalInfo}` : baseMessage;
  }
}