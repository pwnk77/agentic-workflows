module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/**/*.test.ts',
    '!lib/**/*.spec.ts',
    '!lib/**/__tests__/**',
    '!lib/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/lib/__tests__/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true,
  testTimeout: 10000
};