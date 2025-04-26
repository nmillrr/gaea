import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  console.log(`[Auth] Request to ${req.method} ${req.path}`);
  console.log(`[Auth] Headers:`, JSON.stringify(req.headers));

  if (!authHeader) {
    console.log('[Auth] Authorization header missing');
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Check if it's a Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('[Auth] Invalid authorization format:', authHeader);
    return res.status(401).json({ message: 'Invalid authorization format. Expected "Bearer <token>"' });
  }

  const token = parts[1];
  console.log(`[Auth] Token received: ${token.substring(0, 15)}...`);

  try {
    // Verify the token
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const decoded = jwt.verify(token, jwtSecret) as UserPayload;
    
    // Attach user info to the request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    console.log(`[Auth] Authenticated user: ${decoded.email} (${decoded.id})`);
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Optional authentication middleware - doesn't return 401 if no token is provided
export const optionalAuthenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const decoded = jwt.verify(token, jwtSecret) as UserPayload;
    
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
  } catch (err) {
    // Ignore token errors in optional auth
  }
  
  next();
};