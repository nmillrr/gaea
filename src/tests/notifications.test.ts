import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/init';
import { ensureTestDb, closeTestDb } from './testDb';
import { User } from '../entities/User';

// Mock the notifications service
jest.mock('../services/notifications', () => ({
  sendTestNotification: jest.fn().mockResolvedValue(undefined),
  registerDeviceToken: jest.fn().mockResolvedValue(undefined)
}));

// Import the mocked service
import { sendTestNotification, registerDeviceToken } from '../services/notifications';

// Connect to the test database before any suite-level setup runs
beforeAll(() => ensureTestDb());
afterAll(() => closeTestDb());

describe('Notifications API', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create a test user
    const userRepository = AppDataSource.getRepository(User);
    
    // Clean up existing test data
    await userRepository.delete({ email: 'notifytest@example.com' });
    
    // Create test user
    const user = new User();
    user.email = 'notifytest@example.com';
    user.username = 'notifytest';
    user.password_hash = 'hashed_password';
    
    const savedUser = await userRepository.save(user);
    userId = savedUser.id;
    
    // Generate a JWT token
    userToken = jwt.sign(
      { id: userId, email: 'notifytest@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ id: userId });
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /notifications/test', () => {
    it('should return 400 if user_token is not provided', async () => {
      const res = await request(app)
        .post('/notifications/test')
        .send({});
        
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'user_token is required');
      expect(sendTestNotification).not.toHaveBeenCalled();
    });

    it('should send a test notification', async () => {
      const mockDeviceToken = 'firebase-device-token-123';
      
      const res = await request(app)
        .post('/notifications/test')
        .send({ user_token: mockDeviceToken });
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Test notification sent successfully');
      expect(sendTestNotification).toHaveBeenCalledWith(mockDeviceToken);
    });
  });

  describe('POST /notifications/register', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/notifications/register')
        .send({ device_token: 'device-token-123' });
        
      expect(res.status).toBe(401);
      expect(registerDeviceToken).not.toHaveBeenCalled();
    });

    it('should return 400 if device_token is not provided', async () => {
      const res = await request(app)
        .post('/notifications/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});
        
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'device_token is required');
      expect(registerDeviceToken).not.toHaveBeenCalled();
    });

    it('should register device token for authenticated user', async () => {
      const mockDeviceToken = 'device-token-123';
      
      const res = await request(app)
        .post('/notifications/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ device_token: mockDeviceToken });
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Device token registered successfully');
      expect(registerDeviceToken).toHaveBeenCalledWith(userId, mockDeviceToken);
    });
  });
});