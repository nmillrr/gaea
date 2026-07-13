import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/init';
import { ensureTestDb, closeTestDb } from './testDb';
import { Photo } from '../entities/Photo';
import { Guess } from '../entities/Guess';
import { User } from '../entities/User';

// Connect to the test database before any suite-level setup runs
beforeAll(() => ensureTestDb());
afterAll(() => closeTestDb());

describe('Guess API', () => {
  let authToken: string;
  let testUserId: string;
  let testPhotoId: string;

  beforeAll(async () => {
    // Create a test user
    const testUser = new User();
    testUser.email = 'guesstest@example.com';
    testUser.username = 'guesstest';
    testUser.password_hash = 'hashed_password';
    
    const userRepository = AppDataSource.getRepository(User);
    const savedUser = await userRepository.save(testUser);
    testUserId = savedUser.id;
    
    // Create a test photo
    const testPhoto = new Photo();
    testPhoto.user_id = testUserId;
    testPhoto.s3_key = 'test-photo-key';
    testPhoto.latitude = 40.7128; // NYC
    testPhoto.longitude = -74.0060;
    
    const photoRepository = AppDataSource.getRepository(Photo);
    const savedPhoto = await photoRepository.save(testPhoto);
    testPhotoId = savedPhoto.id;
    
    // Generate a valid JWT token
    authToken = jwt.sign(
      { id: testUserId, email: 'guesstest@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    const guessRepository = AppDataSource.getRepository(Guess);
    await guessRepository.delete({ photo_id: testPhotoId });
    
    const photoRepository = AppDataSource.getRepository(Photo);
    await photoRepository.delete({ id: testPhotoId });
    
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ id: testUserId });
  });

  describe('POST /photos/:photoId/guess', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post(`/photos/${testPhotoId}/guess`)
        .send({
          guess_lat: 40.7484,
          guess_lng: -73.9857
        });
        
      expect(res.status).toBe(401);
    });

    it('should submit a valid guess and return correct response', async () => {
      const res = await request(app)
        .post(`/photos/${testPhotoId}/guess`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          guess_lat: 40.7484,
          guess_lng: -73.9857
        });
        
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('distance_m');
      expect(res.body).toHaveProperty('points');
      expect(res.body).toHaveProperty('created_at');
      
      // The guess is close to NYC but not exactly the same
      expect(res.body.distance_m).toBeGreaterThan(0);
      expect(res.body.distance_m).toBeLessThan(20000);
      expect(res.body.points).toBeGreaterThan(0);
    });

    it('should return 429 if user tries to guess again', async () => {
      const res = await request(app)
        .post(`/photos/${testPhotoId}/guess`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          guess_lat: 40.7484,
          guess_lng: -73.9857
        });
        
      expect(res.status).toBe(429);
      expect(res.body).toHaveProperty('message', 'You have already submitted a guess for this photo');
      expect(res.body).toHaveProperty('guess');
      expect(res.body.guess).toHaveProperty('id');
      expect(res.body.guess).toHaveProperty('distance_m');
      expect(res.body.guess).toHaveProperty('points');
    });

    it('should return 400 if coordinates are missing', async () => {
      const res = await request(app)
        .post(`/photos/${testPhotoId}/guess`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
        
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'guess_lat and guess_lng are required');
    });

    it('should return 400 if coordinates are invalid', async () => {
      const res = await request(app)
        .post(`/photos/${testPhotoId}/guess`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          guess_lat: 100, // Invalid latitude (>90)
          guess_lng: -73.9857
        });
        
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid coordinates');
    });

    it('should return 404 if photo does not exist', async () => {
      const res = await request(app)
        .post('/photos/nonexistent-id/guess')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          guess_lat: 40.7484,
          guess_lng: -73.9857
        });
        
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Photo not found');
    });
  });

  describe('GET /photos/:photoId/guess', () => {
    it('should return user\'s guess for a photo', async () => {
      const res = await request(app)
        .get(`/photos/${testPhotoId}/guess`)
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('distance_m');
      expect(res.body).toHaveProperty('points');
      expect(res.body).toHaveProperty('created_at');
    });

    it('should return 404 if user has not guessed the photo', async () => {
      // Create another photo that the user hasn't guessed yet
      const testPhoto2 = new Photo();
      testPhoto2.user_id = testUserId;
      testPhoto2.s3_key = 'test-photo-key-2';
      testPhoto2.latitude = 34.0522; // LA
      testPhoto2.longitude = -118.2437;
      
      const photoRepository = AppDataSource.getRepository(Photo);
      const savedPhoto2 = await photoRepository.save(testPhoto2);
      
      const res = await request(app)
        .get(`/photos/${savedPhoto2.id}/guess`)
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Guess not found');
      
      // Clean up
      await photoRepository.delete({ id: savedPhoto2.id });
    });
  });

  describe('GET /photos/:photoId/guesses', () => {
    it('should return all guesses for a photo', async () => {
      const res = await request(app)
        .get(`/photos/${testPhotoId}/guesses`)
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('user_id');
      expect(res.body[0]).toHaveProperty('distance_m');
      expect(res.body[0]).toHaveProperty('points');
    });

    it('should return 404 if photo does not exist', async () => {
      const res = await request(app)
        .get('/photos/nonexistent-id/guesses')
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Photo not found');
    });
  });
});