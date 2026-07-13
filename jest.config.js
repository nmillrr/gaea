module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true }],
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  // DB-backed suites share one Postgres database; run serially to avoid clobbering
  maxWorkers: 1,
};
