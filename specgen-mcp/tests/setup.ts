import { join } from 'path';
import { existsSync, rmSync, mkdirSync } from 'fs';

// Test file system directory
const TEST_FS_DIR = join(__dirname, 'temp');

/**
 * Setup function that runs before all tests
 */
beforeAll(() => {
  // Ensure test temp directory exists
  if (!existsSync(TEST_FS_DIR)) {
    mkdirSync(TEST_FS_DIR, { recursive: true });
  }
});

/**
 * Cleanup function that runs after all tests
 */
afterAll(() => {
  // Clean up test file systems
  if (existsSync(TEST_FS_DIR)) {
    rmSync(TEST_FS_DIR, { recursive: true, force: true });
  }
});

/**
 * Setup function that runs before each test
 */
beforeEach(() => {
  // Clear any cached data between tests
  jest.clearAllMocks();
});

/**
 * Helper to get a temporary project path for testing
 */
export function getTempProjectPath(testName: string): string {
  const projectPath = join(TEST_FS_DIR, testName);
  
  // Create project directory if it doesn't exist
  if (!existsSync(projectPath)) {
    mkdirSync(projectPath, { recursive: true });
  }
  
  return projectPath;
}

/**
 * Helper to clean up a specific test project
 */
export function cleanupTempProject(projectPath: string): void {
  if (existsSync(projectPath)) {
    rmSync(projectPath, { recursive: true, force: true });
  }
}