import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/init';
import { ensureTestDb, closeTestDb } from './testDb';
import { User } from '../entities/User';
import { Photo } from '../entities/Photo';
import { Guess } from '../entities/Guess';

// Connect to the test database before any suite-level setup runs
beforeAll(() => ensureTestDb());
afterAll(() => closeTestDb());

describe('Rate Limiting', () => {
  let userToken: string;
  let userId: string;
  let photoId: string;

  beforeAll(async () => {
    // Create a test user
    const userRepository = AppDataSource.getRepository(User);
    const photoRepository = AppDataSource.getRepository(Photo);
    
    // Clean up existing test data
    await userRepository.delete({ email: 'ratelimit@example.com' });
    
    // Create test user
    const user = new User();
    user.email = 'ratelimit@example.com';
    user.username = 'ratelimit';
    user.password_hash = 'hashed_password';
    
    const savedUser = await userRepository.save(user);
    userId = savedUser.id;

    // Make sure the user has no photos yet so the first upload is allowed
    await photoRepository.delete({ user_id: userId });

    // Generate a JWT token
    userToken = jwt.sign(
      { id: userId, email: 'ratelimit@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    const photoRepository = AppDataSource.getRepository(Photo);
    const guessRepository = AppDataSource.getRepository(Guess);
    
    await guessRepository.delete({ photo_id: photoId });
    await photoRepository.delete({ id: photoId });
    
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ id: userId });
  });

  describe('Photo Upload Rate Limiting', () => {
    it('should allow first photo upload', async () => {
      // S3 uploads are mocked globally in setupTests.ts
      const res = await request(app)
        .post('/photos')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('photo', Buffer.from('test image data'), 'test.jpg')
        .field('latitude', '40.7128')
        .field('longitude', '-74.0060');

      expect(res.status).toBe(201);

      // The guess rate-limit tests below reuse this photo
      photoId = res.body.id;
    });

    it('should reject second photo upload within 24 hours', async () => {
      const res = await request(app)
        .post('/photos')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('photo', Buffer.from('test image data'), 'test.jpg')
        .field('latitude', '40.7128')
        .field('longitude', '-74.0060');
        
      expect(res.status).toBe(429);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('You can only upload 1 photo every 24 hours');
      expect(res.body).toHaveProperty('next_allowed_upload');
    });
  });

  describe('Guess Rate Limiting', () => {
    it('should allow first guess for a photo', async () => {
      const res = await request(app)
        .post(`/photos/${photoId}/guess`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          guess_lat: 40.7128,
          guess_lng: -74.0060
        });
        
      expect(res.status).toBe(201);
    });

    it('should reject second guess for the same photo', async () => {
      const res = await request(app)
        .post(`/photos/${photoId}/guess`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          guess_lat: 40.7200,
          guess_lng: -74.0000
        });
        
      expect(res.status).toBe(429);
      expect(res.body).toHaveProperty('message', 'You have already submitted a guess for this photo');
      expect(res.body).toHaveProperty('guess');
    });
  });

  describe('Authentication Rate Limiting', () => {
    it('should allow normal authentication requests', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'ratelimit@example.com',
          password: 'password123'
        });
        
      // We don't care about the actual login result, just that it wasn't rate limited
      expect(res.status).not.toBe(429);
    });

    // Skip automated testing of the actual rate limit to avoid hitting limits in tests
    // In a real implementation, you would use a mock rate limiter for testing
    it('should have rate limit headers', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'ratelimit@example.com',
          password: 'password123'
        });
        
      // Check for (draft standard) rate limit headers; legacy X- headers are disabled
      expect(res.headers).toHaveProperty('ratelimit-limit');
      expect(res.headers).toHaveProperty('ratelimit-remaining');
    });
  });
});