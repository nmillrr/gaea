import request from 'supertest';
import app from '../server';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/init';
import { ensureTestDb, closeTestDb } from './testDb';
import { Photo } from '../entities/Photo';
import { User } from '../entities/User';

// Connect to the test database before any suite-level setup runs
beforeAll(() => ensureTestDb());
afterAll(() => closeTestDb());

// The S3 upload middleware is mocked globally in setupTests.ts

// Mock sharp for image processing
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    metadata: jest.fn().mockResolvedValue({
      width: 100,
      height: 100,
      format: 'jpeg'
    }),
    withMetadata: jest.fn().mockReturnThis(),
    toFormat: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('test image data'))
  }));
});

describe('Photo Upload API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user
    const testUser = new User();
    testUser.email = 'phototest@example.com';
    testUser.username = 'phototest';
    testUser.password_hash = 'hashed_password';
    
    const userRepository = AppDataSource.getRepository(User);
    const savedUser = await userRepository.save(testUser);
    testUserId = savedUser.id;
    
    // Generate a valid JWT token
    authToken = jwt.sign(
      { id: testUserId, email: 'phototest@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    const photoRepository = AppDataSource.getRepository(Photo);
    await photoRepository.delete({ user_id: testUserId });
    
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ id: testUserId });
  });

  describe('POST /photos', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/photos')
        .attach('photo', Buffer.from('test image data'), 'test.jpg')
        .field('latitude', '40.7128')
        .field('longitude', '-74.0060');
        
      expect(res.status).toBe(401);
    });

    it('should upload photo and return correct response', async () => {
      const res = await request(app)
        .post('/photos')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', Buffer.from('test image data'), 'test.jpg')
        .field('latitude', '40.7128')
        .field('longitude', '-74.0060');
        
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('s3_url');
      expect(res.body).toHaveProperty('latitude', 40.7128);
      expect(res.body).toHaveProperty('longitude', -74.0060);
      expect(res.body).toHaveProperty('created_at');

      // Reset the 24-hour upload window so later tests exercise validation
      // instead of tripping the photo upload rate limit
      await AppDataSource.getRepository(Photo).delete({ user_id: testUserId });
    });

    it('should return 400 if no file is uploaded', async () => {
      const res = await request(app)
        .post('/photos')
        .set('Authorization', `Bearer ${authToken}`)
        .field('latitude', '40.7128')
        .field('longitude', '-74.0060');
        
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'No file uploaded');
    });

    it('should return 400 if coordinates are missing', async () => {
      const res = await request(app)
        .post('/photos')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', Buffer.from('test image data'), 'test.jpg');
        
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Coordinates (latitude/longitude) are required');
    });

    it('should return 400 if coordinates are invalid', async () => {
      const res = await request(app)
        .post('/photos')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', Buffer.from('test image data'), 'test.jpg')
        .field('latitude', '100')  // Invalid latitude (>90)
        .field('longitude', '-74.0060');
        
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid coordinates');
    });
  });

  describe('GET /photos', () => {
    it('should return user photos', async () => {
      const res = await request(app)
        .get('/photos')
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/photos');
      expect(res.status).toBe(401);
    });
  });
});