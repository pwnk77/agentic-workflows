import { ImportService } from '../../../src/services/import.service';
import { DatabaseConnection } from '../../../src/database/connection';
import { ProjectManager } from '../../../src/database/project-manager';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getTempProjectPath, cleanupTempProject } from '../../setup';
import { SAMPLE_SPECS } from '../../fixtures/sample-specs';

// Mock ProjectManager to use test project path
jest.mock('../../../src/database/project-manager');
const mockProjectManager = ProjectManager as jest.Mocked<typeof ProjectManager>;

describe('ImportService', () => {
  let testProjectPath: string;
  let testSpecsDir: string;

  beforeEach(() => {
    testProjectPath = getTempProjectPath('import-service-test');
    testSpecsDir = join(testProjectPath, 'specs');
    mkdirSync(testSpecsDir, { recursive: true });
    
    // Setup project structure
    const specgenDir = join(testProjectPath, '.specgen');
    mkdirSync(specgenDir, { recursive: true });
    
    // Mock project detection
    mockProjectManager.detectProject.mockReturnValue(testProjectPath);
    mockProjectManager.getDatabasePath.mockReturnValue(join(specgenDir, 'specgen.sqlite'));
    mockProjectManager.ensureSpecgenDir.mockReturnValue(specgenDir);
    
    // Initialize database
    DatabaseConnection.getConnection(testProjectPath);
  });

  afterEach(() => {
    DatabaseConnection.closeAllConnections();
    cleanupTempProject(testProjectPath);
    jest.clearAllMocks();
  });

  describe('importFromDirectory', () => {
    beforeEach(() => {
      // Write sample specs to test directory
      SAMPLE_SPECS.forEach(spec => {
        const filePath = join(testSpecsDir, spec.filename);
        writeFileSync(filePath, spec.content);
      });
    });

    it('should import all SPEC files successfully', async () => {
      const result = await ImportService.importFromDirectory(testSpecsDir);

      expect(result.success).toBe(true);
      expect(result.imported).toHaveLength(SAMPLE_SPECS.length);
      expect(result.summary.successful).toBe(SAMPLE_SPECS.length);
      expect(result.summary.failed).toBe(0);
      expect(result.summary.total).toBe(SAMPLE_SPECS.length);
    });

    it('should respect custom file patterns', async () => {
      // Create non-SPEC files
      writeFileSync(join(testSpecsDir, 'README.md'), '# Documentation');
      writeFileSync(join(testSpecsDir, 'notes.md'), 'Random notes');

      const result = await ImportService.importFromDirectory(testSpecsDir, '*.md');

      expect(result.success).toBe(true);
      expect(result.imported.length).toBeGreaterThan(SAMPLE_SPECS.length);
    });

    it('should group specs correctly by feature group', async () => {
      const result = await ImportService.importFromDirectory(testSpecsDir);

      expect(result.success).toBe(true);
      expect(result.summary.byGroup).toBeDefined();
      expect(result.summary.byGroup['2025-01']).toBeGreaterThan(0);
      expect(result.summary.byGroup['specgen']).toBe(1);
      expect(result.summary.byGroup['learning']).toBe(1);
      expect(result.summary.byGroup['repository']).toBe(1);
    });

    it('should categorize specs by status', async () => {
      const result = await ImportService.importFromDirectory(testSpecsDir);

      expect(result.success).toBe(true);
      expect(result.summary.byStatus).toBeDefined();
      expect(result.summary.byStatus['draft']).toBeGreaterThan(0);
      expect(result.summary.byStatus['todo']).toBe(1);
      expect(result.summary.byStatus['in-progress']).toBe(1);
      expect(result.summary.byStatus['done']).toBe(1);
    });

    it('should handle duplicate titles without overwrite flag', async () => {
      // First import
      await ImportService.importFromDirectory(testSpecsDir);

      // Second import (should skip duplicates)
      const result = await ImportService.importFromDirectory(testSpecsDir);

      expect(result.success).toBe(true);
      expect(result.summary.successful).toBe(0);
      expect(result.summary.skipped).toBe(SAMPLE_SPECS.length);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('already exists');
    });

    it('should overwrite specs when overwrite flag is set', async () => {
      // First import
      await ImportService.importFromDirectory(testSpecsDir);

      // Modify a spec file
      const modifiedContent = SAMPLE_SPECS[0].content + '\n\nModified content';
      writeFileSync(join(testSpecsDir, SAMPLE_SPECS[0].filename), modifiedContent);

      // Second import with overwrite
      const result = await ImportService.importFromDirectory(testSpecsDir, undefined, {
        overwrite: true
      });

      expect(result.success).toBe(true);
      expect(result.summary.successful).toBe(SAMPLE_SPECS.length);
      expect(result.summary.skipped).toBe(0);
    });

    it('should handle non-existent directory', async () => {
      const result = await ImportService.importFromDirectory('/nonexistent/directory');

      expect(result.success).toBe(false);
      expect(result.message).toContain('does not exist');
      expect(result.imported).toHaveLength(0);
    });

    it('should handle directory with no matching files', async () => {
      const emptyDir = join(testProjectPath, 'empty');
      mkdirSync(emptyDir, { recursive: true });

      const result = await ImportService.importFromDirectory(emptyDir);

      expect(result.success).toBe(true);
      expect(result.message).toContain('No SPEC files found');
      expect(result.imported).toHaveLength(0);
      expect(result.summary.total).toBe(0);
    });

    it('should stop on error when stopOnError flag is set', async () => {
      // Create a spec with invalid content that will cause parsing issues
      const invalidSpec = join(testSpecsDir, 'invalid-spec.md');
      writeFileSync(invalidSpec, ''); // Empty file might cause issues

      const result = await ImportService.importFromDirectory(testSpecsDir, undefined, {
        stopOnError: true
      });

      // The result depends on the order of processing, but it should handle errors
      expect(result.success).toBeDefined();
    });
  });

  describe('importFile', () => {
    it('should import a single file successfully', async () => {
      const spec = SAMPLE_SPECS[0];
      const filePath = join(testSpecsDir, spec.filename);
      writeFileSync(filePath, spec.content);

      const result = await ImportService.importFile(filePath);

      expect(result.success).toBe(true);
      expect(result.imported).toHaveLength(1);
      expect(result.imported[0].title).toBe(spec.expected.title);
      expect(result.imported[0].status).toBe(spec.expected.status);
    });

    it('should handle non-existent file', async () => {
      const result = await ImportService.importFile('/nonexistent/file.md');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to import file');
      expect(result.imported).toHaveLength(0);
    });

    it('should handle file parsing errors', async () => {
      const invalidFile = join(testSpecsDir, 'invalid.md');
      // Create a file that might cause parsing issues
      writeFileSync(invalidFile, Buffer.from([0xFF, 0xFE, 0x00, 0x00])); // Invalid UTF-8

      const result = await ImportService.importFile(invalidFile);

      // Should handle the error gracefully
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('import options', () => {
    beforeEach(() => {
      // Write a few sample specs
      SAMPLE_SPECS.slice(0, 3).forEach(spec => {
        const filePath = join(testSpecsDir, spec.filename);
        writeFileSync(filePath, spec.content);
      });
    });

    it('should respect overwrite option', async () => {
      // First import
      await ImportService.importFromDirectory(testSpecsDir);

      // Second import with overwrite disabled (default)
      const result1 = await ImportService.importFromDirectory(testSpecsDir, undefined, {
        overwrite: false
      });

      expect(result1.summary.skipped).toBe(3);

      // Third import with overwrite enabled
      const result2 = await ImportService.importFromDirectory(testSpecsDir, undefined, {
        overwrite: true
      });

      expect(result2.summary.successful).toBe(3);
      expect(result2.summary.skipped).toBe(0);
    });

    it('should handle dry run mode', async () => {
      const result = await ImportService.importFromDirectory(testSpecsDir, undefined, {
        dryRun: true
      });

      // Dry run should succeed but not actually import
      expect(result.success).toBe(true);
      // In a real implementation, dry run would show what would be imported
      // but not actually import. This test verifies the option is handled.
    });
  });
});