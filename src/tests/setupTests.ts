// Setup file for Jest

// Set environment to test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Mock external services
jest.mock('../utils/s3', () => ({
  getPublicUrl: jest.fn((key: string) => `https://mock-s3.example.com/${key}`),
  uploadToS3: jest.fn(() => Promise.resolve({ key: 'mock-s3-key' })),
}));

// Global teardown
afterAll(async () => {
  // Clean up any mock timers
  jest.useRealTimers();
});