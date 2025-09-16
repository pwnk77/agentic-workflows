import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { JSONStorage } from '../../core/json-storage.js';
import { FileSync } from '../../core/file-sync.js';
import { SpecDocument } from '../../types/index.js';

export interface CreateSpecJSONArgs {
  title: string;
  category?: string;
  priority?: string;
  summary?: string;
  requirements?: string;
  architecture?: string;
  sync_to_markdown?: boolean;
}

/**
 * Create a new spec in JSON format
 * Provides clean API for programmatic spec creation
 */
export async function createSpecJSON(args: CreateSpecJSONArgs): Promise<CallToolResult> {
  const {
    title,
    category = 'General',
    priority = 'medium',
    summary = '',
    requirements = '',
    architecture = '',
    sync_to_markdown = true
  } = args;

  try {
    // Generate new spec document
    const spec: SpecDocument = {
      id: JSONStorage.generateId(),
      metadata: {
        title,
        status: 'draft',
        category,
        priority,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_via: 'mcp-tool'
      },
      sections: {
        summary,
        requirements,
        architecture,
        implementation: '',
        execution_logs: '',
        debug_logs: ''
      }
    };

    // Save to JSON storage
    await JSONStorage.save(spec);

    // Optionally sync to markdown
    if (sync_to_markdown) {
      await FileSync.syncJSONToMarkdown(spec.id);
    }

    return {
      content: [{
        type: "text",
        text: `✅ Created new spec '${title}' with ID '${spec.id}'${sync_to_markdown ? ' and synced to markdown' : ''}`
      }],
      isError: false
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to create spec: ${error}`
      }],
      isError: true
    };
  }
}