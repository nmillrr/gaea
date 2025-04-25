module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: ['babel-preset-expo'],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|react-native|@react-native-community|@react-navigation|expo-.*|@expo(nent)?/.*|react-navigation-.*|@unimodules/.*|unimodules|native-base|react-native-svg)',
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
  snapshotSerializers: ['@emotion/jest/serializer'],
};