import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from './config.js';
import { SpecDocument } from '../types/index.js';

/**
 * JSONStorage - Canonical JSON storage for SpecGen v3.1
 * Handles safe storage of spec documents outside worktree paths
 */
export class JSONStorage {

  /**
   * Initialize storage directories if they don't exist
   */
  static async ensureDirectories(): Promise<void> {
    await fs.ensureDir(CONFIG.specgenPath);
    await fs.ensureDir(CONFIG.jsonSpecsPath);
    await fs.ensureDir(CONFIG.markdownSpecsPath);
    await fs.ensureDir(CONFIG.backupsPath);
  }

  /**
   * Save a spec document to JSON storage
   */
  static async save(spec: SpecDocument): Promise<void> {
    await this.ensureDirectories();

    // Create backup if spec already exists
    const filePath = path.join(CONFIG.jsonSpecsPath, `${spec.id}.json`);
    if (await fs.pathExists(filePath)) {
      await this.createBackup(spec.id);
    }

    // Update timestamp
    spec.metadata.updated_at = new Date().toISOString();

    // Write to JSON storage
    await fs.writeJson(filePath, spec, { spaces: 2 });
  }

  /**
   * Load a spec document from JSON storage
   */
  static async load(id: string): Promise<SpecDocument | null> {
    const filePath = path.join(CONFIG.jsonSpecsPath, `${id}.json`);

    if (!(await fs.pathExists(filePath))) {
      return null;
    }

    try {
      return await fs.readJson(filePath);
    } catch (error) {
      console.error(`Failed to load spec ${id}:`, error);
      return null;
    }
  }

  /**
   * List all spec documents in JSON storage
   */
  static async list(): Promise<SpecDocument[]> {
    await this.ensureDirectories();

    try {
      const files = await fs.readdir(CONFIG.jsonSpecsPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      const specs: SpecDocument[] = [];
      for (const file of jsonFiles) {
        const id = path.basename(file, '.json');
        const spec = await this.load(id);
        if (spec) {
          specs.push(spec);
        }
      }

      // Sort by updated_at descending
      return specs.sort((a, b) =>
        new Date(b.metadata.updated_at).getTime() - new Date(a.metadata.updated_at).getTime()
      );
    } catch (error) {
      console.error('Failed to list JSON specs:', error);
      return [];
    }
  }

  /**
   * Delete a spec document from JSON storage
   */
  static async delete(id: string): Promise<boolean> {
    const filePath = path.join(CONFIG.jsonSpecsPath, `${id}.json`);

    if (!(await fs.pathExists(filePath))) {
      return false;
    }

    try {
      // Create backup before deletion
      await this.createBackup(id);
      await fs.remove(filePath);
      return true;
    } catch (error) {
      console.error(`Failed to delete spec ${id}:`, error);
      return false;
    }
  }

  /**
   * Check if a spec exists in JSON storage
   */
  static async exists(id: string): Promise<boolean> {
    const filePath = path.join(CONFIG.jsonSpecsPath, `${id}.json`);
    return await fs.pathExists(filePath);
  }

  /**
   * Generate a new unique spec ID
   */
  static generateId(): string {
    return uuidv4();
  }

  /**
   * Create a backup of an existing spec
   */
  private static async createBackup(id: string): Promise<void> {
    const sourcePath = path.join(CONFIG.jsonSpecsPath, `${id}.json`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(CONFIG.backupsPath, `${id}-${timestamp}.json`);

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, backupPath);
    }
  }

  /**
   * Update a specific section of a spec document
   * This addresses the token limit problem by allowing partial updates
   */
  static async updateSection(
    id: string,
    sectionKey: keyof SpecDocument['sections'],
    content: string
  ): Promise<boolean> {
    const spec = await this.load(id);
    if (!spec) {
      return false;
    }

    spec.sections[sectionKey] = content;
    await this.save(spec);
    return true;
  }

  /**
   * Update metadata fields of a spec document
   */
  static async updateMetadata(
    id: string,
    updates: Partial<SpecDocument['metadata']>
  ): Promise<boolean> {
    const spec = await this.load(id);
    if (!spec) {
      return false;
    }

    Object.assign(spec.metadata, updates);
    await this.save(spec);
    return true;
  }

  /**
   * Get storage statistics
   */
  static async getStats(): Promise<{
    totalSpecs: number;
    totalBackups: number;
    storageSize: string;
  }> {
    await this.ensureDirectories();

    const specs = await this.list();
    const backupFiles = await fs.readdir(CONFIG.backupsPath).catch(() => []);

    return {
      totalSpecs: specs.length,
      totalBackups: backupFiles.length,
      storageSize: 'unknown' // Could implement if needed
    };
  }
}