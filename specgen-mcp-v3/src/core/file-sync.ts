import * as chokidar from 'chokidar';
import * as fs from 'fs-extra';
import * as path from 'path';
import { CONFIG } from './config.js';
import { JSONStorage } from './json-storage.js';
import { MarkdownGenerator } from './markdown-generator.js';
import { SpecDocument } from '../types/index.js';

/**
 * FileSync - Bidirectional sync between JSON and Markdown with chokidar watching
 * Uses proven chokidar pattern with 500ms debounce
 */
export class FileSync {
  private static watchers: chokidar.FSWatcher[] = [];
  private static syncLocks = new Set<string>(); // Prevent circular syncing
  private static debounceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Start watching both JSON and markdown directories
   */
  static async startWatching(): Promise<void> {
    console.log('Starting file sync watchers...');

    // Ensure directories exist
    await JSONStorage.ensureDirectories();

    // Stop any existing watchers
    await this.stopWatching();

    // Watch JSON specs directory
    await this.watchJSONSpecs();

    // Watch markdown specs directory
    await this.watchMarkdownSpecs();

    console.log('File sync watchers started successfully');
  }

  /**
   * Stop all watchers
   */
  static async stopWatching(): Promise<void> {
    for (const watcher of this.watchers) {
      await watcher.close();
    }
    this.watchers = [];

    // Clear any pending debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    console.log('File sync watchers stopped');
  }

  /**
   * Watch JSON specs directory for changes
   */
  private static async watchJSONSpecs(): Promise<void> {
    const jsonWatcher = chokidar.watch(
      path.join(CONFIG.jsonSpecsPath, '*.json'),
      {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true // Don't trigger on startup
      }
    );

    jsonWatcher
      .on('add', (filePath) => this.handleJSONChange(filePath, 'add'))
      .on('change', (filePath) => this.handleJSONChange(filePath, 'change'))
      .on('unlink', (filePath) => this.handleJSONChange(filePath, 'delete'));

    this.watchers.push(jsonWatcher);
    console.log(`Watching JSON specs: ${CONFIG.jsonSpecsPath}`);
  }

  /**
   * Watch markdown specs directory for changes
   */
  private static async watchMarkdownSpecs(): Promise<void> {
    const markdownWatcher = chokidar.watch(
      path.join(CONFIG.markdownSpecsPath, '*.md'),
      {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true // Don't trigger on startup
      }
    );

    markdownWatcher
      .on('add', (filePath) => this.handleMarkdownChange(filePath, 'add'))
      .on('change', (filePath) => this.handleMarkdownChange(filePath, 'change'))
      .on('unlink', (filePath) => this.handleMarkdownChange(filePath, 'delete'));

    this.watchers.push(markdownWatcher);
    console.log(`Watching markdown specs: ${CONFIG.markdownSpecsPath}`);
  }

  /**
   * Handle JSON file changes with debouncing
   */
  private static handleJSONChange(filePath: string, eventType: string): void {
    const fileId = path.basename(filePath, '.json');
    const debounceKey = `json-${fileId}`;

    // Clear existing timer
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!);
    }

    // Set new debounced timer (500ms as per proven pattern)
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(debounceKey);

      // Skip if we're in a sync lock to prevent circular updates
      if (this.syncLocks.has(fileId)) {
        return;
      }

      try {
        if (eventType === 'delete') {
          await this.handleJSONDelete(fileId);
        } else {
          await this.syncJSONToMarkdown(fileId);
        }
      } catch (error) {
        console.error(`Failed to sync JSON change for ${fileId}:`, error);
      }
    }, 500);

    this.debounceTimers.set(debounceKey, timer);
  }

  /**
   * Handle markdown file changes with debouncing
   */
  private static handleMarkdownChange(filePath: string, eventType: string): void {
    const fileId = path.basename(filePath, '.md');
    const debounceKey = `md-${fileId}`;

    // Clear existing timer
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!);
    }

    // Set new debounced timer
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(debounceKey);

      // Skip if we're in a sync lock to prevent circular updates
      if (this.syncLocks.has(fileId)) {
        return;
      }

      try {
        if (eventType === 'delete') {
          await this.handleMarkdownDelete(fileId);
        } else {
          await this.syncMarkdownToJSON(fileId);
        }
      } catch (error) {
        console.error(`Failed to sync markdown change for ${fileId}:`, error);
      }
    }, 500);

    this.debounceTimers.set(debounceKey, timer);
  }

  /**
   * Sync JSON spec to markdown format
   */
  static async syncJSONToMarkdown(id: string): Promise<void> {
    try {
      // Set sync lock
      this.syncLocks.add(id);

      const spec = await JSONStorage.load(id);
      if (!spec) {
        console.warn(`JSON spec ${id} not found for sync`);
        return;
      }

      // Generate markdown
      const markdown = MarkdownGenerator.generateFromJSON(spec);

      // Write to markdown directory
      const markdownPath = path.join(CONFIG.markdownSpecsPath, `${id}.md`);
      await fs.writeFile(markdownPath, markdown, 'utf8');

      console.log(`Synced JSON → Markdown: ${id}`);
    } finally {
      // Always remove sync lock
      setTimeout(() => this.syncLocks.delete(id), 1000);
    }
  }

  /**
   * Sync markdown spec to JSON format
   */
  static async syncMarkdownToJSON(id: string): Promise<void> {
    try {
      // Set sync lock
      this.syncLocks.add(id);

      const markdownPath = path.join(CONFIG.markdownSpecsPath, `${id}.md`);

      if (!(await fs.pathExists(markdownPath))) {
        console.warn(`Markdown spec ${id} not found for sync`);
        return;
      }

      // Read and parse markdown
      const markdownContent = await fs.readFile(markdownPath, 'utf8');
      const spec = MarkdownGenerator.parseToJSON(markdownContent);

      // Ensure ID matches filename
      spec.id = id;

      // Save to JSON storage
      await JSONStorage.save(spec);

      console.log(`Synced Markdown → JSON: ${id}`);
    } finally {
      // Always remove sync lock
      setTimeout(() => this.syncLocks.delete(id), 1000);
    }
  }

  /**
   * Handle JSON file deletion
   */
  private static async handleJSONDelete(id: string): Promise<void> {
    try {
      const markdownPath = path.join(CONFIG.markdownSpecsPath, `${id}.md`);

      if (await fs.pathExists(markdownPath)) {
        await fs.remove(markdownPath);
        console.log(`Removed corresponding markdown file: ${id}.md`);
      }
    } catch (error) {
      console.error(`Failed to handle JSON deletion for ${id}:`, error);
    }
  }

  /**
   * Handle markdown file deletion
   */
  private static async handleMarkdownDelete(id: string): Promise<void> {
    try {
      // Check if corresponding JSON exists and delete it
      if (await JSONStorage.exists(id)) {
        await JSONStorage.delete(id);
        console.log(`Removed corresponding JSON file: ${id}.json`);
      }
    } catch (error) {
      console.error(`Failed to handle markdown deletion for ${id}:`, error);
    }
  }

  /**
   * Manual sync trigger for a specific spec
   */
  static async syncSpec(id: string, direction: 'json-to-md' | 'md-to-json' | 'auto'): Promise<boolean> {
    try {
      if (direction === 'json-to-md' || direction === 'auto') {
        if (await JSONStorage.exists(id)) {
          await this.syncJSONToMarkdown(id);
          return true;
        }
      }

      if (direction === 'md-to-json' || direction === 'auto') {
        const markdownPath = path.join(CONFIG.markdownSpecsPath, `${id}.md`);
        if (await fs.pathExists(markdownPath)) {
          await this.syncMarkdownToJSON(id);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(`Failed to manually sync spec ${id}:`, error);
      return false;
    }
  }

  /**
   * Sync all specs in both directions (for initialization)
   */
  static async syncAll(): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;

    console.log('Starting full sync of all specs...');

    try {
      // Get all JSON specs and sync to markdown
      const jsonSpecs = await JSONStorage.list();
      for (const spec of jsonSpecs) {
        try {
          await this.syncJSONToMarkdown(spec.id);
          synced++;
        } catch (error) {
          console.error(`Failed to sync JSON spec ${spec.id}:`, error);
          errors++;
        }
      }

      console.log(`Full sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('Failed to complete full sync:', error);
      return { synced, errors: errors + 1 };
    }
  }

  /**
   * Get sync status for all specs
   */
  static async getSyncStatus(): Promise<{
    jsonSpecs: number;
    markdownSpecs: number;
    synced: number;
    conflicts: string[];
  }> {
    try {
      const jsonSpecs = await JSONStorage.list();
      const markdownFiles = await fs.readdir(CONFIG.markdownSpecsPath).catch(() => []);
      const markdownSpecs = markdownFiles.filter(f => f.endsWith('.md'));

      let syncedCount = 0;
      const conflicts: string[] = [];

      // Check which specs are synced
      for (const spec of jsonSpecs) {
        const markdownPath = path.join(CONFIG.markdownSpecsPath, `${spec.id}.md`);
        if (await fs.pathExists(markdownPath)) {
          syncedCount++;
        }
      }

      // Check for naming conflicts or orphaned files
      for (const mdFile of markdownSpecs) {
        const id = path.basename(mdFile, '.md');
        if (!(await JSONStorage.exists(id))) {
          conflicts.push(`Orphaned markdown: ${mdFile}`);
        }
      }

      return {
        jsonSpecs: jsonSpecs.length,
        markdownSpecs: markdownSpecs.length,
        synced: syncedCount,
        conflicts
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return { jsonSpecs: 0, markdownSpecs: 0, synced: 0, conflicts: [] };
    }
  }

  /**
   * Resolve timestamp-based conflicts
   */
  static async resolveConflict(id: string, preferSource: 'json' | 'markdown'): Promise<boolean> {
    try {
      if (preferSource === 'json') {
        await this.syncJSONToMarkdown(id);
      } else {
        await this.syncMarkdownToJSON(id);
      }
      return true;
    } catch (error) {
      console.error(`Failed to resolve conflict for ${id}:`, error);
      return false;
    }
  }
}