// Jest setup file for MCP command tests

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock setTimeout/setInterval for faster tests
jest.mock('timers');

// Global test timeout
jest.setTimeout(10000);

// Mock Date for consistent timestamps in tests
const MOCK_DATE = new Date('2025-08-31T19:30:00Z');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(MOCK_DATE);
});

afterAll(() => {
  jest.useRealTimers();
});

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Utility functions for tests
export const mockSpec = (overrides = {}) => ({
  id: 123,
  title: 'Test Specification',
  body_md: '# Test Specification\n\nTest content',
  status: 'draft',
  feature_group: 'general',
  theme_category: 'general',
  priority: 'medium',
  created_at: MOCK_DATE.toISOString(),
  updated_at: MOCK_DATE.toISOString(),
  ...overrides
});

export const mockSpecWithImplementationPlan = (overrides = {}) => ({
  ...mockSpec(),
  body_md: `# Test Specification

## Implementation Plan

#### Database Layer (DB-XXX)
- [ ] **DB-001**: Create schema migration [Estimate: 2hr]
- [ ] **DB-002**: Add indexes [Estimate: 1hr]

#### Backend Layer (API-XXX)
- [ ] **API-001**: Implement service [Estimate: 3hr]
- [ ] **API-002**: Add validation [Estimate: 2hr]
`,
  ...overrides
});

export const mockMCPTools = {
  create_spec_with_grouping: jest.fn(),
  search_related_specs: jest.fn(),
  get_spec: jest.fn(),
  update_spec: jest.fn(),
  update_spec_relationships: jest.fn(),
  list_specs: jest.fn()
};

// Export for use in individual test files
export { MOCK_DATE };