import { SpecParser } from '../../../src/parsers/spec-parser';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getTempProjectPath, cleanupTempProject } from '../../setup';
import { SAMPLE_SPECS } from '../../fixtures/sample-specs';

describe('SpecParser', () => {
  let testProjectPath: string;
  let testSpecsDir: string;

  beforeEach(() => {
    testProjectPath = getTempProjectPath('spec-parser-test');
    testSpecsDir = join(testProjectPath, 'specs');
    mkdirSync(testSpecsDir, { recursive: true });
  });

  afterEach(() => {
    cleanupTempProject(testProjectPath);
  });

  describe('parseSpecFile', () => {
    it('should parse a draft specification correctly', () => {
      const spec = SAMPLE_SPECS[0]; // Draft spec
      const filePath = join(testSpecsDir, spec.filename);
      writeFileSync(filePath, spec.content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.title).toBe(spec.expected.title);
      expect(result.status).toBe(spec.expected.status);
      expect(result.feature_group).toBe(spec.expected.feature_group);
      expect(result.body_md).toBe(spec.content);
      expect(result.source_file).toBe(filePath);
    });

    it('should detect TODO status from task lists', () => {
      const spec = SAMPLE_SPECS[1]; // TODO spec
      const filePath = join(testSpecsDir, spec.filename);
      writeFileSync(filePath, spec.content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.status).toBe('todo');
      expect(result.feature_group).toBe('2025-01');
    });

    it('should detect in-progress status from content markers', () => {
      const spec = SAMPLE_SPECS[2]; // In-progress spec
      const filePath = join(testSpecsDir, spec.filename);
      writeFileSync(filePath, spec.content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.status).toBe('in-progress');
    });

    it('should detect done status from completion markers', () => {
      const spec = SAMPLE_SPECS[3]; // Done spec
      const filePath = join(testSpecsDir, spec.filename);
      writeFileSync(filePath, spec.content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.status).toBe('done');
    });

    it('should detect specgen feature group', () => {
      const spec = SAMPLE_SPECS[4]; // SpecGen spec
      const filePath = join(testSpecsDir, spec.filename);
      writeFileSync(filePath, spec.content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.feature_group).toBe('specgen');
    });

    it('should detect learning feature group', () => {
      const spec = SAMPLE_SPECS[5]; // Learning spec
      const filePath = join(testSpecsDir, spec.filename);
      writeFileSync(filePath, spec.content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.feature_group).toBe('learning');
    });

    it('should detect repository feature group', () => {
      const spec = SAMPLE_SPECS[6]; // Repository spec
      const filePath = join(testSpecsDir, spec.filename);
      writeFileSync(filePath, spec.content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.feature_group).toBe('repository');
    });

    it('should extract title from H1 heading when present', () => {
      const content = '# Custom Title\n\nContent here';
      const filePath = join(testSpecsDir, 'test-spec.md');
      writeFileSync(filePath, content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.title).toBe('Custom Title');
    });

    it('should fall back to filename for title when no H1 present', () => {
      const content = 'Content without title';
      const filePath = join(testSpecsDir, 'SPEC-2025-test-feature.md');
      writeFileSync(filePath, content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.title).toBe('Test Feature'); // From filename
    });

    it('should handle edge case with minimal content', () => {
      const content = '# Minimal\n\nMinimal content.';
      const filePath = join(testSpecsDir, 'minimal.md');
      writeFileSync(filePath, content);

      const result = SpecParser.parseSpecFile(filePath);

      expect(result.title).toBe('Minimal');
      expect(result.status).toBe('draft');
      expect(result.feature_group).toBe('general');
      expect(result.body_md).toBe(content);
    });
  });

  describe('parseMultipleSpecs', () => {
    it('should parse multiple spec files correctly', () => {
      const filePaths: string[] = [];
      
      // Write first 3 sample specs
      SAMPLE_SPECS.slice(0, 3).forEach(spec => {
        const filePath = join(testSpecsDir, spec.filename);
        writeFileSync(filePath, spec.content);
        filePaths.push(filePath);
      });

      const results = SpecParser.parseMultipleSpecs(filePaths);

      expect(results).toHaveLength(3);
      
      results.forEach((result, index) => {
        const expected = SAMPLE_SPECS[index].expected;
        expect(result.title).toBe(expected.title);
        expect(result.status).toBe(expected.status);
        expect(result.feature_group).toBe(expected.feature_group);
      });
    });

    it('should handle parse errors gracefully', () => {
      const validFilePath = join(testSpecsDir, 'valid.md');
      writeFileSync(validFilePath, '# Valid\n\nValid content');
      
      const invalidFilePath = join(testSpecsDir, 'nonexistent.md');
      
      const results = SpecParser.parseMultipleSpecs([validFilePath, invalidFilePath]);

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Valid');
    });

    it('should return empty array for no files', () => {
      const results = SpecParser.parseMultipleSpecs([]);
      expect(results).toEqual([]);
    });
  });
});