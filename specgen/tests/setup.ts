import { join } from 'path';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { DatabaseConnection } from '../src/database/connection';

// Test database directory
const TEST_DB_DIR = join(__dirname, 'temp');

/**
 * Setup function that runs before all tests
 */
beforeAll(() => {
  // Ensure test temp directory exists
  if (!existsSync(TEST_DB_DIR)) {
    mkdirSync(TEST_DB_DIR, { recursive: true });
  }
});

/**
 * Cleanup function that runs after all tests
 */
afterAll(() => {
  // Close all database connections
  DatabaseConnection.closeAllConnections();
  
  // Clean up test databases
  if (existsSync(TEST_DB_DIR)) {
    rmSync(TEST_DB_DIR, { recursive: true, force: true });
  }
});

/**
 * Setup function that runs before each test
 */
beforeEach(() => {
  // Clear any existing connections between tests
  DatabaseConnection.closeAllConnections();
});

/**
 * Helper to get a temporary project path for testing
 */
export function getTempProjectPath(testName: string): string {
  const projectPath = join(TEST_DB_DIR, testName);
  
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