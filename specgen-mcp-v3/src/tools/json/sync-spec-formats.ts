import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { FileSync } from '../../core/file-sync.js';

export interface SyncSpecFormatsArgs {
  id?: string;
  direction?: 'json-to-md' | 'md-to-json' | 'auto';
  all?: boolean;
}

/**
 * Manual sync trigger between JSON and Markdown formats
 * Useful for resolving conflicts or forcing sync
 */
export async function syncSpecFormats(args: SyncSpecFormatsArgs): Promise<CallToolResult> {
  const { id, direction = 'auto', all = false } = args;

  try {
    if (all) {
      // Sync all specs
      const result = await FileSync.syncAll();
      return {
        content: [{
          type: "text",
          text: `✅ Synced all specs: ${result.synced} successful, ${result.errors} errors`
        }],
        isError: result.errors > 0
      };
    } else if (id) {
      // Sync specific spec
      const success = await FileSync.syncSpec(id, direction);

      if (success) {
        return {
          content: [{
            type: "text",
            text: `✅ Synced spec '${id}' (${direction})`
          }],
          isError: false
        };
      } else {
        throw new Error(`Failed to sync spec '${id}' - spec not found or sync failed`);
      }
    } else {
      throw new Error('Either "id" or "all: true" must be specified');
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to sync spec formats: ${error}`
      }],
      isError: true
    };
  }
}