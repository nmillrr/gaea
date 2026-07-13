import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/init';
import { ensureTestDb, closeTestDb } from './testDb';
import { User } from '../entities/User';
import { Friendship, FriendshipStatus } from '../entities/Friendship';

// Connect to the test database before any suite-level setup runs
beforeAll(() => ensureTestDb());
afterAll(() => closeTestDb());

describe('Friends API', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    // Create test users
    const userRepository = AppDataSource.getRepository(User);
    const friendshipRepository = AppDataSource.getRepository(Friendship);
    
    // Clean up any existing test users
    await friendshipRepository.delete({});
    await userRepository.delete({ email: 'friendtest1@example.com' });
    await userRepository.delete({ email: 'friendtest2@example.com' });
    
    // Create user 1
    const user1 = new User();
    user1.email = 'friendtest1@example.com';
    user1.username = 'friendtest1';
    user1.password_hash = 'hashed_password';
    
    const savedUser1 = await userRepository.save(user1);
    user1Id = savedUser1.id;
    
    // Create user 2
    const user2 = new User();
    user2.email = 'friendtest2@example.com';
    user2.username = 'friendtest2';
    user2.password_hash = 'hashed_password';
    
    const savedUser2 = await userRepository.save(user2);
    user2Id = savedUser2.id;
    
    // Generate tokens
    user1Token = jwt.sign(
      { id: user1Id, email: 'friendtest1@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
    
    user2Token = jwt.sign(
      { id: user2Id, email: 'friendtest2@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    const friendshipRepository = AppDataSource.getRepository(Friendship);
    await friendshipRepository.delete({});
    
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ id: user1Id });
    await userRepository.delete({ id: user2Id });
  });

  describe('POST /friends/request', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/friends/request')
        .send({ friend_email: 'friendtest2@example.com' });
        
      expect(res.status).toBe(401);
    });

    it('should send a friend request successfully', async () => {
      const res = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friend_email: 'friendtest2@example.com' });
        
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Friend request sent');
      expect(res.body).toHaveProperty('friendship');
      expect(res.body.friendship).toHaveProperty('status', 'pending');
    });

    it('should return 404 if target user not found', async () => {
      const res = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friend_email: 'nonexistent@example.com' });
        
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 400 if trying to friend yourself', async () => {
      const res = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friend_email: 'friendtest1@example.com' });
        
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Cannot send friend request to yourself');
    });

    it('should return 409 if request already sent', async () => {
      const res = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friend_email: 'friendtest2@example.com' });
        
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('message', 'Friend request already sent');
    });
  });

  describe('POST /friends/accept', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/friends/accept')
        .send({ user_id: user1Id });
        
      expect(res.status).toBe(401);
    });

    it('should accept a friend request successfully', async () => {
      const res = await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ user_id: user1Id });
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Friend request accepted');
      expect(res.body).toHaveProperty('friendship');
      expect(res.body.friendship).toHaveProperty('status', 'accepted');
    });

    it('should return 404 if no pending request found', async () => {
      const res = await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ user_id: user2Id });
        
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'No pending friend request found from this user');
    });
  });

  describe('GET /friends', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/friends');
      expect(res.status).toBe(401);
    });

    it('should list friends for user1', async () => {
      const res = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user1Token}`);
        
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('id', user2Id);
      expect(res.body[0]).toHaveProperty('email', 'friendtest2@example.com');
    });

    it('should list friends for user2', async () => {
      const res = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user2Token}`);
        
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('id', user1Id);
      expect(res.body[0]).toHaveProperty('email', 'friendtest1@example.com');
    });
  });

  // Integration test: Full friendship cycle
  describe('Integration: Request → Accept → Listing', () => {
    let user3Id: string;
    let user3Token: string;
    
    beforeAll(async () => {
      // Create a third test user (clean up leftovers from any previous run)
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.delete({ email: 'friendtest3@example.com' });

      const user3 = new User();
      user3.email = 'friendtest3@example.com';
      user3.username = 'friendtest3';
      user3.password_hash = 'hashed_password';
      
      const savedUser3 = await userRepository.save(user3);
      user3Id = savedUser3.id;
      
      // Generate token
      user3Token = jwt.sign(
        { id: user3Id, email: 'friendtest3@example.com' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );
    });
    
    afterAll(async () => {
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.delete({ id: user3Id });
    });
    
    it('should complete the full friendship cycle', async () => {
      // Step 1: User1 sends request to User3
      const requestRes = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friend_email: 'friendtest3@example.com' });
        
      expect(requestRes.status).toBe(201);
      expect(requestRes.body).toHaveProperty('message', 'Friend request sent');
      
      // Step 2: User3 accepts request from User1
      const acceptRes = await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${user3Token}`)
        .send({ user_id: user1Id });
        
      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body).toHaveProperty('message', 'Friend request accepted');
      
      // Step 3: User1 lists friends and sees User3
      const user1ListRes = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user1Token}`);
        
      expect(user1ListRes.status).toBe(200);
      expect(Array.isArray(user1ListRes.body)).toBe(true);
      expect(user1ListRes.body.some(friend => friend.id === user3Id)).toBe(true);
      
      // Step 4: User3 lists friends and sees User1
      const user3ListRes = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user3Token}`);
        
      expect(user3ListRes.status).toBe(200);
      expect(Array.isArray(user3ListRes.body)).toBe(true);
      expect(user3ListRes.body.some(friend => friend.id === user1Id)).toBe(true);
    });
  });
});