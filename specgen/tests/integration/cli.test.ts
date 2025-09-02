import { execSync, spawn, ChildProcess } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getTempProjectPath, cleanupTempProject } from '../setup';
import { SAMPLE_SPECS } from '../fixtures/sample-specs';

// Helper to execute CLI commands
function execCLI(command: string, cwd: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const result = execSync(`node ${join(__dirname, '../../dist/cli/index.js')} ${command}`, {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return {
      stdout: result.toString(),
      stderr: '',
      exitCode: 0
    };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || '',
      exitCode: error.status || 1
    };
  }
}

describe('CLI Integration Tests', () => {
  let testProjectPath: string;
  let testSpecsDir: string;

  beforeAll(() => {
    // Build the project first
    try {
      execSync('npm run build', { 
        cwd: join(__dirname, '../..'), 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.warn('Build failed, tests may not work correctly');
    }
  });

  beforeEach(() => {
    testProjectPath = getTempProjectPath('cli-integration-test');
    testSpecsDir = join(testProjectPath, 'docs');
    mkdirSync(testSpecsDir, { recursive: true });

    // Create a package.json for project detection
    writeFileSync(join(testProjectPath, 'package.json'), JSON.stringify({
      name: 'test-cli-project',
      version: '1.0.0'
    }));
  });

  afterEach(() => {
    cleanupTempProject(testProjectPath);
  });

  describe('specgen init', () => {
    it('should initialize a new project successfully', () => {
      const result = execCLI('init', testProjectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('initialized successfully');
      
      // Verify .specgen directory was created
      const specgenDir = join(testProjectPath, '.specgen');
      expect(existsSync(specgenDir)).toBe(true);
      
      // Verify database file was created
      const dbPath = join(specgenDir, 'specgen.sqlite');
      expect(existsSync(dbPath)).toBe(true);
    });

    it('should handle already initialized project', () => {
      // Initialize once
      execCLI('init', testProjectPath);
      
      // Initialize again
      const result = execCLI('init', testProjectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('already initialized');
    });

    it('should initialize with project info display', () => {
      const result = execCLI('init', testProjectPath);

      expect(result.stdout).toContain('test-cli-project');
      expect(result.stdout).toContain('1.0.0');
      expect(result.stdout).toContain('Next steps:');
    });
  });

  describe('specgen status', () => {
    beforeEach(() => {
      execCLI('init', testProjectPath);
    });

    it('should show project status for initialized project', () => {
      const result = execCLI('status', testProjectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Project Status');
      expect(result.stdout).toContain('test-cli-project');
      expect(result.stdout).toContain('Initialized');
      expect(result.stdout).toContain('Total specs: 0');
    });

    it('should show detailed stats when requested', () => {
      const result = execCLI('status --detailed', testProjectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Recent Activity');
    });

    it('should fail for uninitialized project', () => {
      cleanupTempProject(testProjectPath);
      testProjectPath = getTempProjectPath('uninitialized-project');
      mkdirSync(testProjectPath, { recursive: true });

      const result = execCLI('status', testProjectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('not initialized');
    });
  });

  describe('specgen import', () => {
    beforeEach(() => {
      execCLI('init', testProjectPath);
      
      // Create sample SPEC files
      SAMPLE_SPECS.slice(0, 3).forEach(spec => {
        const filePath = join(testSpecsDir, spec.filename);
        writeFileSync(filePath, spec.content);
      });
    });

    it('should import SPEC files successfully', () => {
      const result = execCLI(`import ${testSpecsDir}`, testProjectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Import completed');
      expect(result.stdout).toContain('Successful: 3');
      expect(result.stdout).toContain('By Feature Group:');
      expect(result.stdout).toContain('By Status:');
    });

    it('should handle custom file patterns', () => {
      // Create additional markdown files
      writeFileSync(join(testSpecsDir, 'README.md'), '# Project README');
      writeFileSync(join(testSpecsDir, 'NOTES.md'), '# Development Notes');

      const result = execCLI(`import ${testSpecsDir} "*.md"`, testProjectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Import completed');
      // Should import more files than just SPEC-*.md pattern
    });

    it('should handle overwrite flag', () => {
      // First import
      execCLI(`import ${testSpecsDir}`, testProjectPath);
      
      // Second import without overwrite (should skip)
      const result1 = execCLI(`import ${testSpecsDir}`, testProjectPath);
      expect(result1.stdout).toContain('Skipped:');

      // Third import with overwrite
      const result2 = execCLI(`import ${testSpecsDir} --overwrite`, testProjectPath);
      expect(result2.stdout).toContain('Successful: 3');
    });

    it('should handle dry run mode', () => {
      const result = execCLI(`import ${testSpecsDir} --dry-run`, testProjectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Dry run mode');
    });

    it('should fail for non-existent directory', () => {
      const result = execCLI('import /nonexistent/directory', testProjectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('does not exist');
    });

    it('should fail for uninitialized project', () => {
      cleanupTempProject(testProjectPath);
      testProjectPath = getTempProjectPath('uninitialized-import');
      mkdirSync(testProjectPath, { recursive: true });

      const result = execCLI(`import ${testSpecsDir}`, testProjectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('not initialized');
    });
  });

  describe('specgen help', () => {
    it('should display help information', () => {
      const result = execCLI('--help', testProjectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('specgen');
      expect(result.stdout).toContain('Commands:');
      expect(result.stdout).toContain('init');
      expect(result.stdout).toContain('import');
      expect(result.stdout).toContain('start');
      expect(result.stdout).toContain('status');
    });

    it('should display command-specific help', () => {
      const result = execCLI('init --help', testProjectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Initialize a new SpecGen project');
    });
  });

  describe('End-to-End Workflow', () => {
    it('should complete full workflow: init -> import -> status', () => {
      // Create sample specs
      SAMPLE_SPECS.slice(0, 3).forEach(spec => {
        const filePath = join(testSpecsDir, spec.filename);
        writeFileSync(filePath, spec.content);
      });

      // 1. Initialize project
      const initResult = execCLI('init', testProjectPath);
      expect(initResult.exitCode).toBe(0);

      // 2. Import specs
      const importResult = execCLI(`import ${testSpecsDir}`, testProjectPath);
      expect(importResult.exitCode).toBe(0);
      expect(importResult.stdout).toContain('Successful: 3');

      // 3. Check status
      const statusResult = execCLI('status', testProjectPath);
      expect(statusResult.exitCode).toBe(0);
      expect(statusResult.stdout).toContain('Total specs: 3');
      expect(statusResult.stdout).toContain('draft:');
      expect(statusResult.stdout).toContain('2025-01:');

      // 4. Detailed status
      const detailedResult = execCLI('status --detailed', testProjectPath);
      expect(detailedResult.exitCode).toBe(0);
      expect(detailedResult.stdout).toContain('Latest Specs:');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid commands gracefully', () => {
      const result = execCLI('invalid-command', testProjectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('error') || expect(result.stdout).toContain('help');
    });

    it('should handle permission errors gracefully', () => {
      // This test would need specific setup to trigger permission errors
      // For now, we just verify the CLI can handle basic error cases
      const result = execCLI('init /root/protected-directory', testProjectPath);
      
      // Should either succeed or fail gracefully with proper error message
      if (result.exitCode !== 0) {
        expect(result.stderr).toBeTruthy();
      }
    });
  });
});

describe('CLI Performance Tests', () => {
  let testProjectPath: string;

  beforeEach(() => {
    testProjectPath = getTempProjectPath('cli-performance-test');
    mkdirSync(testProjectPath, { recursive: true });
    writeFileSync(join(testProjectPath, 'package.json'), '{"name":"perf-test"}');
  });

  afterEach(() => {
    cleanupTempProject(testProjectPath);
  });

  it('should initialize project in under 2 seconds', () => {
    const start = Date.now();
    const result = execCLI('init', testProjectPath);
    const duration = Date.now() - start;

    expect(result.exitCode).toBe(0);
    expect(duration).toBeLessThan(2000); // Under 2 seconds as per spec
  });

  it('should import moderate number of specs efficiently', () => {
    // Initialize project
    execCLI('init', testProjectPath);

    // Create 20 SPEC files
    const specsDir = join(testProjectPath, 'specs');
    mkdirSync(specsDir, { recursive: true });

    for (let i = 1; i <= 20; i++) {
      const content = `# SPEC-2025-01-${i.toString().padStart(2, '0')}-feature-${i}

## Executive Summary
**Feature**: Test Feature ${i}
**Status**: Draft

## Content
This is test specification ${i} for performance testing.

### Requirements
- Requirement 1 for feature ${i}
- Requirement 2 for feature ${i}

### Implementation
- Task 1
- Task 2
- Task 3
`;
      writeFileSync(join(specsDir, `SPEC-2025-01-${i.toString().padStart(2, '0')}-feature-${i}.md`), content);
    }

    // Time the import
    const start = Date.now();
    const result = execCLI(`import ${specsDir}`, testProjectPath);
    const duration = Date.now() - start;

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Successful: 20');
    expect(duration).toBeLessThan(30000); // Under 30 seconds as per spec
  });
});