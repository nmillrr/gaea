import request from 'supertest';
import { AppDataSource } from '../db/init';
import app from '../server';
import { ensureTestDb, closeTestDb } from './testDb';
import { User } from '../entities/User';
import { Photo } from '../entities/Photo';
import { Guess } from '../entities/Guess';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// The S3 upload middleware is mocked globally in setupTests.ts

describe('API Integration Tests', () => {
  let testUser: User;
  let testUserToken: string;
  let testPhoto: Photo;

  beforeAll(async () => {
    // Initialize the database connection
    await ensureTestDb();

    // Create test user (clean up leftovers from any previous run first)
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ email: 'test@example.com' });
    await userRepository.delete({ email: 'newuser@example.com' });
    const passwordHash = await bcrypt.hash('password123', 10);

    testUser = new User();
    testUser.email = 'test@example.com';
    testUser.username = 'testuser';
    testUser.password_hash = passwordHash;
    
    await userRepository.save(testUser);
    
    // Generate token for the test user
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    testUserToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      jwtSecret,
      { expiresIn: '1h' }
    );
    
    // Create a test photo, backdated so it doesn't trip the 24h upload limit
    const photoRepository = AppDataSource.getRepository(Photo);
    testPhoto = new Photo();
    testPhoto.user_id = testUser.id;
    testPhoto.s3_key = 'test-photo.jpg';
    testPhoto.latitude = 40.7128;
    testPhoto.longitude = -74.0060;
    testPhoto.created_at = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    await photoRepository.save(testPhoto);
  });

  afterAll(async () => {
    // Clean up: remove test data
    const guessRepository = AppDataSource.getRepository(Guess);
    const photoRepository = AppDataSource.getRepository(Photo);
    const userRepository = AppDataSource.getRepository(User);
    
    await guessRepository.delete({ photo_id: testPhoto.id });
    await photoRepository.delete({ id: testPhoto.id });
    await userRepository.delete({ id: testUser.id });
    
    // Close database connection
    await closeTestDb();
  });

  describe('Authentication', () => {
    test('POST /auth/register should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'password123',
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.username).toBe('newuser');
      
      // Clean up: delete the newly created user
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.delete({ email: 'newuser@example.com' });
    });

    test('POST /auth/login should login an existing user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('POST /auth/login should fail with incorrect credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('Photos', () => {
    test('POST /photos should upload a new photo', async () => {
      const response = await request(app)
        .post('/photos')
        .set('Authorization', `Bearer ${testUserToken}`)
        .attach('photo', Buffer.from('test image data'), 'test.jpg')
        .field('latitude', '37.7749')
        .field('longitude', '-122.4194');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('s3_url');
      expect(response.body.latitude).toBe(37.7749);
      expect(response.body.longitude).toBe(-122.4194);
      
      // Clean up: delete the newly created photo
      const photoRepository = AppDataSource.getRepository(Photo);
      await photoRepository.delete({ id: response.body.id });
    });

    test('POST /photos should fail without authentication', async () => {
      const response = await request(app)
        .post('/photos')
        .field('latitude', '37.7749')
        .field('longitude', '-122.4194');
      
      expect(response.status).toBe(401);
    });

    test('POST /photos should fail without coordinates', async () => {
      const response = await request(app)
        .post('/photos')
        .set('Authorization', `Bearer ${testUserToken}`)
        .attach('photo', Buffer.from('test image data'), 'test.jpg');
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Coordinates');
    });
  });

  describe('Guesses', () => {
    test('POST /photos/:photoId/guess should submit a guess', async () => {
      const response = await request(app)
        .post(`/photos/${testPhoto.id}/guess`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          guess_lat: 40.7500,
          guess_lng: -74.0000,
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('distance_m');
      expect(response.body).toHaveProperty('points');
      
      // The distance should be relatively small since the coordinates are close
      expect(response.body.distance_m).toBeLessThan(5000);
      
      // Points should be proportional to the distance
      expect(response.body.points).toBeGreaterThan(0);
    });

    test('POST /photos/:photoId/guess should fail with invalid coordinates', async () => {
      const response = await request(app)
        .post(`/photos/${testPhoto.id}/guess`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          guess_lat: 91, // Invalid latitude
          guess_lng: -74.0000,
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid coordinates');
    });

    test('POST /photos/:photoId/guess should fail without authentication', async () => {
      const response = await request(app)
        .post(`/photos/${testPhoto.id}/guess`)
        .send({
          guess_lat: 40.7500,
          guess_lng: -74.0000,
        });
      
      expect(response.status).toBe(401);
    });
  });
});