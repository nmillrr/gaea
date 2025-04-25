module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  // Set up global variables for tests
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  // Define test environment variables
  testEnvironmentVariables: {
    NODE_ENV: 'test'
  }
};