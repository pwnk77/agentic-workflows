// Simple ESLint 9.x configuration for specgen-mcp project
export default [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // Basic rules to prevent errors
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-undef': 'off', // TypeScript handles this
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      'test-*.js',
      'jest.config.js',
    ],
  },
];