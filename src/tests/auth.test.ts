import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authenticateJWT } from '../auth/middleware';
import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types';

// Mock JWT and environment variable
jest.mock('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret';

describe('Authentication Middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 401 if authorization header is missing', () => {
    authenticateJWT(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header missing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization format is invalid', () => {
    req.headers = { authorization: 'InvalidFormat' };
    authenticateJWT(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid authorization format. Expected "Bearer <token>"' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token verification fails', () => {
    req.headers = { authorization: 'Bearer invalidtoken' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticateJWT(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set req.user and call next() if token is valid', () => {
    req.headers = { authorization: 'Bearer validtoken' };
    const mockUser = { id: 'user-id', email: 'user@example.com' };
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    authenticateJWT(req as AuthRequest, res as Response, next);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe('JWT Token Generation', () => {
  it('should validate JWT token format', () => {
    // Mock a user
    const mockUser = {
      id: '123456',
      email: 'test@example.com'
    };

    // Generate a token
    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Verify the token can be decoded
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    expect(decoded.id).toBe(mockUser.id);
    expect(decoded.email).toBe(mockUser.email);
  });
});

describe('Password Hashing', () => {
  it('should correctly hash and verify passwords', async () => {
    const password = 'securePassword123';
    
    // Hash the password
    const hash = await bcrypt.hash(password, 12);
    
    // Verify the hash
    const match = await bcrypt.compare(password, hash);
    expect(match).toBe(true);
    
    // Verify incorrect password doesn't match
    const noMatch = await bcrypt.compare('wrongPassword', hash);
    expect(noMatch).toBe(false);
  });
});