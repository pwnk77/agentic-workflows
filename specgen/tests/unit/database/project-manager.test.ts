import { ProjectManager } from '../../../src/database/project-manager';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getTempProjectPath, cleanupTempProject } from '../../setup';

describe('ProjectManager', () => {
  let testProjectPath: string;

  beforeEach(() => {
    testProjectPath = getTempProjectPath('project-manager-test');
  });

  afterEach(() => {
    cleanupTempProject(testProjectPath);
  });

  describe('detectProject', () => {
    it('should detect git repository root', () => {
      // Create .git directory
      const gitDir = join(testProjectPath, '.git');
      mkdirSync(gitDir, { recursive: true });
      
      // Create subdirectory
      const subDir = join(testProjectPath, 'src', 'components');
      mkdirSync(subDir, { recursive: true });

      const detected = ProjectManager.detectProject(subDir);
      expect(detected).toBe(testProjectPath);
    });

    it('should detect package.json parent directory', () => {
      // Create package.json
      const packageJson = join(testProjectPath, 'package.json');
      writeFileSync(packageJson, JSON.stringify({ name: 'test-project' }));
      
      // Create subdirectory
      const subDir = join(testProjectPath, 'src');
      mkdirSync(subDir, { recursive: true });

      const detected = ProjectManager.detectProject(subDir);
      expect(detected).toBe(testProjectPath);
    });

    it('should prioritize git over package.json', () => {
      // Create both .git and package.json
      const gitDir = join(testProjectPath, '.git');
      mkdirSync(gitDir, { recursive: true });
      
      const packageJson = join(testProjectPath, 'package.json');
      writeFileSync(packageJson, JSON.stringify({ name: 'test-project' }));

      const detected = ProjectManager.detectProject(testProjectPath);
      expect(detected).toBe(testProjectPath);
    });

    it('should fall back to current directory when no markers found', () => {
      const detected = ProjectManager.detectProject(testProjectPath);
      expect(detected).toBe(testProjectPath);
    });

    it('should handle nested projects correctly', () => {
      // Create outer git repo
      const outerGitDir = join(testProjectPath, '.git');
      mkdirSync(outerGitDir, { recursive: true });
      
      // Create nested directory with package.json
      const nestedDir = join(testProjectPath, 'packages', 'app');
      mkdirSync(nestedDir, { recursive: true });
      
      const nestedPackageJson = join(nestedDir, 'package.json');
      writeFileSync(nestedPackageJson, JSON.stringify({ name: 'nested-app' }));

      // When searching from nested directory, should find git root
      const detected = ProjectManager.detectProject(nestedDir);
      expect(detected).toBe(testProjectPath);
    });
  });

  describe('getSpecgenDir', () => {
    it('should return correct .specgen directory path', () => {
      const specgenDir = ProjectManager.getSpecgenDir(testProjectPath);
      expect(specgenDir).toBe(join(testProjectPath, '.specgen'));
    });
  });

  describe('getDatabasePath', () => {
    it('should return correct database file path', () => {
      const dbPath = ProjectManager.getDatabasePath(testProjectPath);
      expect(dbPath).toBe(join(testProjectPath, '.specgen', 'specgen.sqlite'));
    });
  });

  describe('ensureSpecgenDir', () => {
    it('should create .specgen directory if it does not exist', () => {
      const specgenDir = ProjectManager.ensureSpecgenDir(testProjectPath);
      
      expect(existsSync(specgenDir)).toBe(true);
      expect(specgenDir).toBe(join(testProjectPath, '.specgen'));
    });

    it('should return existing .specgen directory if it already exists', () => {
      const specgenDir = join(testProjectPath, '.specgen');
      mkdirSync(specgenDir, { recursive: true });
      
      const returnedDir = ProjectManager.ensureSpecgenDir(testProjectPath);
      
      expect(returnedDir).toBe(specgenDir);
      expect(existsSync(specgenDir)).toBe(true);
    });
  });

  describe('isProjectInitialized', () => {
    it('should return false for uninitialized project', () => {
      const initialized = ProjectManager.isProjectInitialized(testProjectPath);
      expect(initialized).toBe(false);
    });

    it('should return true when database file exists', () => {
      // Create .specgen directory and database file
      const specgenDir = join(testProjectPath, '.specgen');
      mkdirSync(specgenDir, { recursive: true });
      
      const dbPath = join(specgenDir, 'specgen.sqlite');
      writeFileSync(dbPath, 'dummy database content');

      const initialized = ProjectManager.isProjectInitialized(testProjectPath);
      expect(initialized).toBe(true);
    });
  });

  describe('getProjectInfo', () => {
    it('should return project info with package.json data', () => {
      const packageJson = join(testProjectPath, 'package.json');
      writeFileSync(packageJson, JSON.stringify({
        name: 'test-project',
        version: '1.0.0'
      }));

      const info = ProjectManager.getProjectInfo(testProjectPath);

      expect(info.name).toBe('test-project');
      expect(info.version).toBe('1.0.0');
      expect(info.root).toBe(testProjectPath);
      expect(info.isInitialized).toBe(false);
    });

    it('should return default values when package.json is missing', () => {
      const info = ProjectManager.getProjectInfo(testProjectPath);

      expect(info.name).toBe('unknown');
      expect(info.version).toBe('0.0.0');
      expect(info.root).toBe(testProjectPath);
    });

    it('should handle malformed package.json gracefully', () => {
      const packageJson = join(testProjectPath, 'package.json');
      writeFileSync(packageJson, '{ invalid json }');

      const info = ProjectManager.getProjectInfo(testProjectPath);

      expect(info.name).toBe('unknown');
      expect(info.version).toBe('0.0.0');
    });

    it('should detect initialized project correctly', () => {
      // Create initialized project
      const specgenDir = join(testProjectPath, '.specgen');
      mkdirSync(specgenDir, { recursive: true });
      
      const dbPath = join(specgenDir, 'specgen.sqlite');
      writeFileSync(dbPath, 'database');

      const info = ProjectManager.getProjectInfo(testProjectPath);

      expect(info.isInitialized).toBe(true);
      expect(info.databasePath).toBe(dbPath);
      expect(info.specgenDir).toBe(specgenDir);
    });
  });
});