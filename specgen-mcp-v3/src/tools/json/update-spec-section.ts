import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { JSONStorage } from '../../core/json-storage.js';
import { FileSync } from '../../core/file-sync.js';
import { SpecDocument } from '../../types/index.js';

export interface UpdateSpecSectionArgs {
  id: string;
  section: keyof SpecDocument['sections'];
  content: string;
  sync_to_markdown?: boolean;
}

/**
 * Update a specific section of a JSON spec
 * Solves token limit problem by allowing partial updates
 */
export async function updateSpecSection(args: UpdateSpecSectionArgs): Promise<CallToolResult> {
  const { id, section, content, sync_to_markdown = true } = args;

  try {
    // Validate section key
    const validSections: (keyof SpecDocument['sections'])[] = [
      'summary', 'requirements', 'architecture', 'implementation', 'execution_logs', 'debug_logs'
    ];

    if (!validSections.includes(section)) {
      throw new Error(`Invalid section: ${section}. Valid sections: ${validSections.join(', ')}`);
    }

    // Update the section
    const success = await JSONStorage.updateSection(id, section, content);

    if (!success) {
      throw new Error(`Spec with ID '${id}' not found`);
    }

    // Optionally sync to markdown
    if (sync_to_markdown) {
      await FileSync.syncJSONToMarkdown(id);
    }

    return {
      content: [{
        type: "text",
        text: `✅ Updated section '${section}' for spec '${id}'${sync_to_markdown ? ' and synced to markdown' : ''}`
      }],
      isError: false
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to update spec section: ${error}`
      }],
      isError: true
    };
  }
}