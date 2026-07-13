// Setup file for Jest

// Set environment to test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Suites make many requests per minute with one user; keep the generic
// per-user/IP limiters out of the way (domain limits are tested explicitly)
process.env.GUESS_RATE_LIMIT_MAX = process.env.GUESS_RATE_LIMIT_MAX || '10000';
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || '10000';

// Default DB settings point at the docker-compose Postgres (npm run docker:up)
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5433';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'cosmo';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'cosmopassword';
process.env.DB_NAME = process.env.DB_NAME || 'cosmodb';

// Mock external services. uploadToS3 is a multer instance, so the mock must
// expose .single() returning middleware. Use real multer with in-memory storage
// so multipart bodies are still parsed, then fake the S3 upload result.
jest.mock('../utils/s3', () => {
  const multer = require('multer');
  const memoryUpload = multer({ storage: multer.memoryStorage() });
  return {
    uploadToS3: {
      single: (field: string) => (req: any, res: any, next: any) => {
        memoryUpload.single(field)(req, res, (err: any) => {
          if (err) return next(err);
          if (req.file) {
            req.file.key = 'mock-s3-key';
            req.file.location = 'https://mock-s3.example.com/mock-s3-key';
          }
          next();
        });
      }
    },
    getSignedUrl: jest.fn((key: string) => `https://mock-s3.example.com/${key}?signed=true`),
    getPublicUrl: jest.fn((key: string) => `https://mock-s3.example.com/${key}`),
  };
});

// Global teardown
afterAll(async () => {
  // Clean up any mock timers
  jest.useRealTimers();
});
