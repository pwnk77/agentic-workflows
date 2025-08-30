/**
 * Specification management commands
 */

import { Command } from 'commander';
import { logger } from '../../services/logging.service.js';
import { initializeDatabase } from '../../database/data-source.js';
import { SpecService } from '../../services/spec.service.js';
import { getAppSettings } from '../../config/settings.js';

export const specCommand = new Command('spec')
  .description('Specification management commands');

specCommand
  .command('list')
  .description('List all specifications')
  .option('--db-path <path>', 'SQLite database path (overrides config)')
  .option('--status <status>', 'Filter by status (draft|todo|in-progress|done)')
  .option('--limit <number>', 'Maximum number of specs to show', parseInt, 10)
  .action(async (options) => {
    try {
      const settings = getAppSettings();
      const dbPath = options.dbPath || settings.database.path;
      
      await initializeDatabase(dbPath);
      const specService = new SpecService();
      
      const specs = await specService.listSpecs({
        limit: options.limit,
        status: options.status
      });
      
      if (specs.specs.length === 0) {
        logger.info('No specifications found');
        return;
      }
      
      logger.info(`Found ${specs.specs.length} specification(s):`);
      specs.specs.forEach(spec => {
        console.log(`[${spec.id}] ${spec.title} (${spec.status}) - ${spec.createdAt.toISOString()}`);
      });
      
    } catch (error) {
      logger.error('Failed to list specifications:', error as Error);
      process.exit(1);
    }
  });

specCommand
  .command('show <id>')
  .description('Show specification details')
  .option('--db-path <path>', 'SQLite database path (overrides config)')
  .option('--content', 'Show full content')
  .action(async (id, options) => {
    try {
      const settings = getAppSettings();
      const dbPath = options.dbPath || settings.database.path;
      const specId = parseInt(id);
      
      if (isNaN(specId)) {
        logger.error('Invalid spec ID. Must be a number.');
        process.exit(1);
      }
      
      await initializeDatabase(dbPath);
      const specService = new SpecService();
      
      const spec = await specService.getSpec(specId);
      
      if (!spec) {
        logger.error(`Specification with ID ${specId} not found`);
        process.exit(1);
      }
      
      console.log(`ID: ${spec.id}`);
      console.log(`Title: ${spec.title}`);
      console.log(`Status: ${spec.status}`);
      console.log(`Created: ${spec.createdAt.toISOString()}`);
      console.log(`Updated: ${spec.updatedAt.toISOString()}`);
      console.log(`Version: ${spec.version}`);
      
      if (options.content) {
        console.log('\n--- Content ---');
        console.log(spec.bodyMd);
      }
      
    } catch (error) {
      logger.error('Failed to show specification:', error as Error);
      process.exit(1);
    }
  });

specCommand
  .command('create <title>')
  .description('Create a new specification')
  .option('--db-path <path>', 'SQLite database path (overrides config)')
  .option('--status <status>', 'Initial status (draft|todo|in-progress|done)', 'draft')
  .option('--content <content>', 'Markdown content')
  .option('--file <file>', 'Read content from file')
  .action(async (title, options) => {
    try {
      const settings = getAppSettings();
      const dbPath = options.dbPath || settings.database.path;
      
      let bodyMd = options.content || '';
      
      if (options.file) {
        const fs = await import('fs/promises');
        bodyMd = await fs.readFile(options.file, 'utf-8');
      }
      
      if (!bodyMd.trim()) {
        logger.error('Content is required. Use --content or --file option.');
        process.exit(1);
      }
      
      await initializeDatabase(dbPath);
      const specService = new SpecService();
      
      const spec = await specService.createSpec({
        title,
        bodyMd,
        status: options.status as any
      });
      
      logger.info(`Created specification with ID: ${spec.id}`);
      
    } catch (error) {
      logger.error('Failed to create specification:', error as Error);
      process.exit(1);
    }
  });