import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { CONFIG } from './config.js';
import {
  extractTitle,
  detectCategory,
  detectStatus,
  detectPriority,
  hasFrontmatter,
  addFrontmatterToFile
} from '../utils/helpers.js';

// Shared JSON metadata interface (matches Dashboard format)
export interface SpecMetadata {
  metadata_version: string;
  last_full_scan: string;
  specs: {
    [filename: string]: {
      filename: string;
      title: string;
      category: string;
      status: string;
      priority: string;
      modified: string;
      created: string;
      manualStatus?: boolean;
      manualPriority?: boolean;
    };
  };
}

export class JSONMetadataService {
  static async loadMetadata(): Promise<SpecMetadata> {
    try {
      const content = await fs.readFile(CONFIG.metadataFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Create empty metadata if file doesn't exist
      return {
        metadata_version: "1.0.0",
        last_full_scan: new Date().toISOString(),
        specs: {}
      };
    }
  }

  static async saveMetadata(metadata: SpecMetadata): Promise<void> {
    // Ensure docs directory exists
    await fs.mkdir(path.dirname(CONFIG.metadataFile), { recursive: true });
    await fs.writeFile(CONFIG.metadataFile, JSON.stringify(metadata, null, 2));
  }

  static async scanSpecs(): Promise<SpecMetadata> {
    try {
      // Use glob for recursive scanning of subdirectories
      const pattern = path.join(CONFIG.docsPath, '**/SPEC-*.md');
      const filePaths = await glob(pattern);
      const specs: any = {};

      for (const filePath of filePaths) {
        const file = path.basename(filePath);
        let content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        const relativePath = path.relative(CONFIG.docsPath, path.dirname(filePath));
        const title = extractTitle(content);
        const category = detectCategory(content, relativePath);
        const status = detectStatus(content);
        const priority = detectPriority(content);

        // Add frontmatter to files that don't have it
        if (!hasFrontmatter(content)) {
          await addFrontmatterToFile(filePath, content, title, category, status, priority);
          // Re-read the file to get updated content
          content = await fs.readFile(filePath, 'utf-8');
        }

        specs[file] = {
          filename: file,
          title,
          category,
          status,
          priority,
          modified: stats.mtime.toISOString(),
          created: stats.birthtime.toISOString()
        };
      }

      const metadata: SpecMetadata = {
        metadata_version: "1.0.0",
        last_full_scan: new Date().toISOString(),
        specs: specs
      };

      await this.saveMetadata(metadata);
      return metadata;
    } catch (error) {
      throw new Error(`Failed to scan specs: ${error}`);
    }
  }
}