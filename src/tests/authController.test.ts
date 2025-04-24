import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { register, login } from '../auth/controller';
import { User } from '../entities/User';
import { AppDataSource } from '../db/init';

// Mock TypeORM and JWT
jest.mock('../db/init', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserRepository: any;

  beforeEach(() => {
    // Mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock user repository
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
    (jwt.sign as jest.Mock).mockReturnValue('mock-token');
  });

  describe('register', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        }
      };
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = { email: 'test@example.com' };
      await register(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email, password, and username are required' });
    });

    it('should return 409 if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: '1', email: 'test@example.com' });
      await register(mockRequest as Request, mockResponse as Response);
      
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User with this email already exists' });
    });

    it('should create a new user and return a token', async () => {
      // Mock user doesn't exist
      mockUserRepository.findOne.mockResolvedValue(null);
      
      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      
      // Mock user save
      const savedUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser'
      };
      mockUserRepository.save.mockResolvedValue(savedUser);
      
      await register(mockRequest as Request, mockResponse as Response);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        token: 'mock-token',
        user: expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser'
        })
      });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = { email: 'test@example.com' };
      await login(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });

    it('should return 401 if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await login(mockRequest as Request, mockResponse as Response);
      
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 401 if password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hashed_password'
      });
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      await login(mockRequest as Request, mockResponse as Response);
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return a token if credentials are valid', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashed_password'
      };
      
      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      await login(mockRequest as Request, mockResponse as Response);
      
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'mock-token',
        user: expect.objectContaining({
          id: '123',
          email: 'test@example.com',
          username: 'testuser'
        })
      });
    });
  });
});