import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/init';
import { ensureTestDb, closeTestDb } from './testDb';
import { Photo } from '../entities/Photo';
import { User } from '../entities/User';
import { Friendship, FriendshipStatus } from '../entities/Friendship';
import { Guess } from '../entities/Guess';

// Connect to the test database before any suite-level setup runs
beforeAll(() => ensureTestDb());
afterAll(() => closeTestDb());

describe('Photo Feed and Leaderboard API', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;
  let photoId: string;

  beforeAll(async () => {
    // Create test users
    const userRepository = AppDataSource.getRepository(User);
    const photoRepository = AppDataSource.getRepository(Photo);
    const friendshipRepository = AppDataSource.getRepository(Friendship);
    const guessRepository = AppDataSource.getRepository(Guess);
    
    // Clean up any existing test data
    await guessRepository.delete({});
    await photoRepository.delete({});
    await friendshipRepository.delete({});
    await userRepository.delete({ email: 'feedtest1@example.com' });
    await userRepository.delete({ email: 'feedtest2@example.com' });
    
    // Create user 1
    const user1 = new User();
    user1.email = 'feedtest1@example.com';
    user1.username = 'feedtest1';
    user1.password_hash = 'hashed_password';
    user1.avatar_url = 'https://example.com/avatar1.jpg';
    
    const savedUser1 = await userRepository.save(user1);
    user1Id = savedUser1.id;
    
    // Create user 2
    const user2 = new User();
    user2.email = 'feedtest2@example.com';
    user2.username = 'feedtest2';
    user2.password_hash = 'hashed_password';
    user2.avatar_url = 'https://example.com/avatar2.jpg';
    
    const savedUser2 = await userRepository.save(user2);
    user2Id = savedUser2.id;
    
    // Create friendship between user1 and user2
    const friendship = new Friendship();
    friendship.user_id = user1Id;
    friendship.friend_id = user2Id;
    friendship.status = FriendshipStatus.ACCEPTED;
    
    await friendshipRepository.save(friendship);
    
    // Create a photo for user2
    const photo = new Photo();
    photo.user_id = user2Id;
    photo.s3_key = 'feed-test-photo-key';
    photo.latitude = 40.7128;
    photo.longitude = -74.0060;
    
    const savedPhoto = await photoRepository.save(photo);
    photoId = savedPhoto.id;
    
    // Create some guesses for the photo
    const user1Guess = new Guess();
    user1Guess.photo_id = photoId;
    user1Guess.user_id = user1Id;
    user1Guess.guess_lat = 40.7200;
    user1Guess.guess_lng = -74.0100;
    user1Guess.distance_meters = 1000;
    user1Guess.points = 4750;
    
    await guessRepository.save(user1Guess);
    
    // Generate tokens
    user1Token = jwt.sign(
      { id: user1Id, email: 'feedtest1@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
    
    user2Token = jwt.sign(
      { id: user2Id, email: 'feedtest2@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    const guessRepository = AppDataSource.getRepository(Guess);
    await guessRepository.delete({});
    
    const photoRepository = AppDataSource.getRepository(Photo);
    await photoRepository.delete({});
    
    const friendshipRepository = AppDataSource.getRepository(Friendship);
    await friendshipRepository.delete({});
    
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ id: user1Id });
    await userRepository.delete({ id: user2Id });
  });

  describe('GET /photos/feed', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/photos/feed');
      expect(res.status).toBe(401);
    });

    it('should return photos from friends', async () => {
      const res = await request(app)
        .get('/photos/feed')
        .set('Authorization', `Bearer ${user1Token}`);
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('photos');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
      expect(res.body).toHaveProperty('totalPages');
      
      expect(Array.isArray(res.body.photos)).toBe(true);
      expect(res.body.photos.length).toBeGreaterThan(0);
      
      // Check structure of a photo in the feed
      const photo = res.body.photos[0];
      expect(photo).toHaveProperty('id');
      expect(photo).toHaveProperty('s3_url');
      expect(photo).toHaveProperty('user');
      expect(photo).toHaveProperty('created_at');
      
      // Check user info included with the photo
      expect(photo.user).toHaveProperty('id', user2Id);
      expect(photo.user).toHaveProperty('username', 'feedtest2');
      expect(photo.user).toHaveProperty('avatar_url');
    });

    it('should support pagination parameters', async () => {
      const res = await request(app)
        .get('/photos/feed?page=1&pageSize=10')
        .set('Authorization', `Bearer ${user1Token}`);
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('pageSize', 10);
    });
  });

  describe('GET /photos/:photoId/leaderboard', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get(`/photos/${photoId}/leaderboard`);
      expect(res.status).toBe(401);
    });

    it('should return the leaderboard for a photo', async () => {
      const res = await request(app)
        .get(`/photos/${photoId}/leaderboard`)
        .set('Authorization', `Bearer ${user1Token}`);
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
      expect(res.body).toHaveProperty('totalPages');
      
      expect(Array.isArray(res.body.leaderboard)).toBe(true);
      expect(res.body.leaderboard.length).toBeGreaterThan(0);
      
      // Check structure of an entry in the leaderboard
      const entry = res.body.leaderboard[0];
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('user_id', user1Id);
      expect(entry).toHaveProperty('username', 'feedtest1');
      expect(entry).toHaveProperty('avatar_url');
      expect(entry).toHaveProperty('distance_m');
      expect(entry).toHaveProperty('points');
    });

    it('should support pagination parameters', async () => {
      const res = await request(app)
        .get(`/photos/${photoId}/leaderboard?page=1&pageSize=10`)
        .set('Authorization', `Bearer ${user1Token}`);
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('pageSize', 10);
    });

    it('should return 404 if photo does not exist', async () => {
      const res = await request(app)
        .get('/photos/nonexistent-id/leaderboard')
        .set('Authorization', `Bearer ${user1Token}`);
        
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Photo not found');
    });
  });
});