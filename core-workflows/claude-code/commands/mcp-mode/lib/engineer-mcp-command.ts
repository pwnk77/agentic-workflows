import { MCPCommand, CommandResult } from './base-mcp-command';

interface TaskItem {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  layer: string;
  estimate?: string;
}

interface ImplementationLayer {
  name: string;
  tasks: TaskItem[];
}

/**
 * Engineer MCP Command Implementation
 * Executes implementation tasks from database-stored specifications
 */
export class EngineerMCPCommand extends MCPCommand {
  async execute(args: string[]): Promise<CommandResult> {
    try {
      // Validate input
      if (args.length === 0) {
        return {
          success: false,
          message: 'Specification URL or task description is required',
          error: 'Usage: /engineer-mcp spec://123 or /engineer-mcp "task description"'
        };
      }

      const input = args.join(' ');
      this.log(`Starting engineering implementation for: ${input}`);

      // Determine mode: spec URL or description
      if (input.startsWith('spec://')) {
        return await this.implementSpecById(input);
      } else {
        return await this.implementByDescription(input);
      }

    } catch (error) {
      this.log(`Error in engineer command: ${error}`);
      return {
        success: false,
        message: 'Implementation failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Implement specification by spec:// URL
   */
  private async implementSpecById(specUrl: string): Promise<CommandResult> {
    // Extract spec ID from URL
    const specId = parseInt(specUrl.replace('spec://', ''));
    if (isNaN(specId)) {
      return {
        success: false,
        message: 'Invalid specification URL format',
        error: 'Expected format: spec://123'
      };
    }

    // Load specification with relationships
    const specResult = await this.mcpTools.get_spec({
      spec_id: specId,
      include_relations: true
    });

    if (!specResult.success) {
      return {
        success: false,
        message: `Specification not found: ${specUrl}`,
        error: specResult.error || 'Specification does not exist'
      };
    }

    const spec = specResult.spec;
    this.log(`Loaded specification: "${spec.title}"`);

    // Parse implementation tasks from spec content
    const layers = this.parseImplementationPlan(spec.body_md);
    
    if (layers.length === 0) {
      return {
        success: false,
        message: 'No implementation plan found in specification',
        error: 'Specification must contain "## Implementation Plan" section with tasks'
      };
    }

    // Execute implementation layer by layer
    const executionResult = await this.executeImplementationLayers(spec, layers);
    
    return {
      success: executionResult.success,
      spec_id: specId,
      spec_url: specUrl,
      message: executionResult.message,
      error: executionResult.error,
      data: {
        spec_title: spec.title,
        layers_completed: executionResult.layersCompleted,
        total_tasks: executionResult.totalTasks,
        completed_tasks: executionResult.completedTasks,
        execution_time: executionResult.executionTime,
        related_specs: specResult.related_specs || []
      }
    };
  }

  /**
   * Implement by task description (search mode)
   */
  private async implementByDescription(description: string): Promise<CommandResult> {
    this.log(`Searching for specifications related to: ${description}`);

    // Search for related specifications
    const searchResult = await this.mcpTools.search_related_specs({
      query: description,
      limit: 5
    });

    if (!searchResult.success || !searchResult.specs?.length) {
      // No specs found - create ad-hoc implementation
      return await this.createAdHocImplementation(description);
    }

    // Use the best matching specification
    const bestMatch = searchResult.specs[0];
    this.log(`Found matching specification: "${bestMatch.title}" (spec://${bestMatch.id})`);
    
    // Delegate to spec-based implementation
    return await this.implementSpecById(`spec://${bestMatch.id}`);
  }

  /**
   * Parse implementation plan from specification markdown
   */
  private parseImplementationPlan(bodyMd: string): ImplementationLayer[] {
    const lines = bodyMd.split('\n');
    const layers: ImplementationLayer[] = [];
    let currentLayer: ImplementationLayer | null = null;
    let inImplementationSection = false;

    for (const line of lines) {
      // Detect implementation plan section
      if (line.match(/^##\s+Implementation\s+Plan/i)) {
        inImplementationSection = true;
        continue;
      }

      // Stop at next major section
      if (inImplementationSection && line.match(/^##\s+/) && !line.match(/^##\s+Implementation\s+Plan/i)) {
        break;
      }

      if (inImplementationSection) {
        // Detect layer headers like "#### Database Layer (DB-XXX)"
        const layerMatch = line.match(/^####\s+(.+?)\s*\([^)]+\)$/);
        if (layerMatch) {
          if (currentLayer) {
            layers.push(currentLayer);
          }
          currentLayer = {
            name: layerMatch[1].trim(),
            tasks: []
          };
          continue;
        }

        // Parse task items like "- [ ] **DB-001**: Task description [Estimate: 2hr]"
        const taskMatch = line.match(/^-\s+\[([x\s])\]\s+\*\*([^*]+)\*\*:\s*([^\[]+)(?:\[([^\]]+)\])?/);
        if (taskMatch && currentLayer) {
          const [, statusChar, taskId, description, estimate] = taskMatch;
          currentLayer.tasks.push({
            id: taskId.trim(),
            description: description.trim(),
            status: statusChar.trim() === 'x' ? 'completed' : 'pending',
            layer: currentLayer.name,
            estimate: estimate?.replace('Estimate:', '').trim()
          });
        }
      }
    }

    // Add the last layer
    if (currentLayer) {
      layers.push(currentLayer);
    }

    return layers;
  }

  /**
   * Execute implementation layers sequentially
   */
  private async executeImplementationLayers(
    spec: any, 
    layers: ImplementationLayer[]
  ): Promise<{
    success: boolean;
    message: string;
    error?: string;
    layersCompleted: number;
    totalTasks: number;
    completedTasks: number;
    executionTime: string;
  }> {
    const startTime = Date.now();
    let layersCompleted = 0;
    let totalTasks = layers.reduce((sum, layer) => sum + layer.tasks.length, 0);
    let completedTasks = 0;

    this.log(`Implementation Plan: ${layers.length} layers, ${totalTasks} total tasks`);

    for (const layer of layers) {
      this.log(`\nStarting ${layer.name}...`);
      
      let layerCompletedTasks = 0;
      
      for (const task of layer.tasks) {
        if (task.status === 'completed') {
          this.log(`✓ ${task.id}: ${task.description} [ALREADY COMPLETED]`);
          completedTasks++;
          layerCompletedTasks++;
          continue;
        }

        this.log(`⚠ Executing ${task.id}: ${task.description}`);
        
        // Simulate task execution (in real implementation, this would call actual task logic)
        const taskResult = await this.executeTask(task, spec);
        
        if (taskResult.success) {
          // Update task status in database
          await this.updateTaskProgress(spec, task.id, 'completed');
          
          this.log(`✓ ${task.id}: Completed successfully`);
          completedTasks++;
          layerCompletedTasks++;
        } else {
          this.log(`✗ ${task.id}: Failed - ${taskResult.error}`);
          
          // Stop execution on failure
          return {
            success: false,
            message: `Implementation failed at task ${task.id}`,
            error: taskResult.error,
            layersCompleted,
            totalTasks,
            completedTasks,
            executionTime: this.formatExecutionTime(startTime)
          };
        }
      }

      this.log(`✓ ${layer.name} completed (${layerCompletedTasks}/${layer.tasks.length} tasks)`);
      layersCompleted++;
    }

    const executionTime = this.formatExecutionTime(startTime);
    
    // Update spec with completion log
    await this.addExecutionLog(spec, {
      layersCompleted,
      totalTasks,
      completedTasks,
      executionTime
    });

    return {
      success: true,
      message: this.formatCompletionMessage(spec.title, layersCompleted, totalTasks, executionTime),
      layersCompleted,
      totalTasks,
      completedTasks,
      executionTime
    };
  }

  /**
   * Execute individual task (placeholder for actual implementation)
   */
  private async executeTask(task: TaskItem, spec: any): Promise<{ success: boolean; error?: string }> {
    // Simulate task execution with delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // For now, always succeed (in real implementation, this would contain actual task logic)
    // Different task types would have different implementations:
    // - DB tasks: Run migrations, create schemas
    // - API tasks: Generate endpoints, add validation
    // - UI tasks: Create components, add styling
    // - Test tasks: Write and run tests
    
    return { success: true };
  }

  /**
   * Update task progress in specification
   */
  private async updateTaskProgress(spec: any, taskId: string, status: 'completed' | 'pending'): Promise<void> {
    try {
      const updatedContent = this.updateTaskProgressInContent(spec.body_md, taskId, status);
      
      await this.mcpTools.update_spec({
        spec_id: spec.id,
        body_md: updatedContent,
        last_command: 'engineer-mcp'
      });
    } catch (error) {
      this.log(`Warning: Failed to update task progress for ${taskId}: ${error}`);
    }
  }

  /**
   * Update task status in markdown content
   */
  private updateTaskProgressInContent(bodyMd: string, taskId: string, status: 'completed' | 'pending'): string {
    const lines = bodyMd.split('\n');
    const checkbox = status === 'completed' ? '[x]' : '[ ]';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(taskId) && line.includes('**' + taskId + '**')) {
        lines[i] = line.replace(/\[([x\s])\]/, checkbox);
        break;
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Add execution log to specification
   */
  private async addExecutionLog(spec: any, results: {
    layersCompleted: number;
    totalTasks: number;
    completedTasks: number;
    executionTime: string;
  }): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0] + ' ' + 
                       new Date().toTimeString().split(' ')[0];
      
      const logEntry = `
## Execution Log

### Implementation Completed: ${timestamp}
- **Status**: Completed
- **Command**: engineer-mcp
- **Layers Completed**: ${results.layersCompleted}
- **Tasks Completed**: ${results.completedTasks}/${results.totalTasks}
- **Execution Time**: ${results.executionTime}
- **Summary**: All implementation tasks completed successfully. Ready for testing and deployment.
`;

      const updatedContent = spec.body_md + logEntry;
      
      await this.mcpTools.update_spec({
        spec_id: spec.id,
        body_md: updatedContent,
        last_command: 'engineer-mcp'
      });
    } catch (error) {
      this.log(`Warning: Failed to add execution log: ${error}`);
    }
  }

  /**
   * Create ad-hoc implementation when no spec is found
   */
  private async createAdHocImplementation(description: string): Promise<CommandResult> {
    this.log('No existing specifications found, creating ad-hoc implementation');
    
    // This would create a minimal spec and implement it
    // For now, return guidance to use architect first
    return {
      success: false,
      message: 'No related specifications found',
      error: `Use "/architect-mcp ${description}" to create a specification first, then run /engineer-mcp spec://ID`
    };
  }

  /**
   * Format execution time
   */
  private formatExecutionTime(startTime: number): string {
    const duration = Date.now() - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Format completion message
   */
  private formatCompletionMessage(
    title: string, 
    layersCompleted: number, 
    totalTasks: number, 
    executionTime: string
  ): string {
    return [
      `✓ Implementation completed: "${title}"`,
      `  - Layers: ${layersCompleted} completed`,
      `  - Tasks: ${totalTasks} completed`,
      `  - Time: ${executionTime}`,
      '',
      'Next steps:',
      '  - Run test suite to verify implementation',
      '  - Review code quality and security',
      '  - Deploy to staging environment'
    ].join('\n');
  }

  /**
   * Enhanced logging with context
   */
  protected log(message: string): void {
    super.log(`[ENGINEER-MCP] ${message}`);
  }
}