/**
 * Test setup and global configuration
 */

import { jest } from '@jest/globals';

// Set test timeout
jest.setTimeout(10000);

// Mock console.log in tests to reduce noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Mock console methods to reduce noise in tests
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockSpec: () => ({
    id: 1,
    title: 'Test Specification',
    body_md: '# Test Spec\n\nThis is a test specification.',
    status: 'draft' as const,
    version: 1,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  }),
  
  createMockSearchResult: () => ({
    id: 1,
    title: 'Test Specification',
    status: 'draft',
    score: 0.95,
    snippet: 'This is a test specification with <mark>highlighted</mark> terms.',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  })
};

// Declare global types for TypeScript
declare global {
  var testUtils: {
    createMockSpec: () => any;
    createMockSearchResult: () => any;
  };
}