module.exports = {
  // jest-expo supplies the babel transform and transformIgnorePatterns
  // needed for Expo SDK / React Native packages; react-redux ships ESM so it
  // must be transformed too
  preset: 'jest-expo',
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|react-redux))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.expo/',
  ],
  testMatch: ['<rootDir>/src/tests/**/*.test.{js,jsx,ts,tsx}'],
};