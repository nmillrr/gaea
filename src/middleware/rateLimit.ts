import { Request, Response, NextFunction } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../db/init';
import { Photo } from '../entities/Photo';
import { Guess } from '../entities/Guess';
import { isUuid } from '../utils/validation';

// Repository for database checks
const photoRepository = () => AppDataSource.getRepository(Photo);
const guessRepository = () => AppDataSource.getRepository(Guess);

/**
 * Rate limit for photo uploads - 1 photo per user per 24 hours
 */
export const photoUploadRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userId = req.user.id;

    // Check if the user has uploaded a photo in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentPhoto = await photoRepository().findOne({
      where: {
        user_id: userId,
        created_at: MoreThanOrEqual(oneDayAgo)
      },
      order: { created_at: 'DESC' }
    });

    if (recentPhoto) {
      // Calculate the time remaining until they can upload again
      const timeSinceUpload = Date.now() - recentPhoto.created_at.getTime();
      const timeRemaining = 24 * 60 * 60 * 1000 - timeSinceUpload; // 24 hours in milliseconds
      const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));

      res.status(429).json({
        message: `You can only upload 1 photo every 24 hours. Please try again in ${hoursRemaining} hours.`,
        next_allowed_upload: new Date(recentPhoto.created_at.getTime() + 24 * 60 * 60 * 1000)
      });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Error in photo upload rate limit middleware:', error);
    next(error);
  }
};

/**
 * General rate limiter for auth endpoints
 * 10 requests per IP per minute
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10'), // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later' }
});

/**
 * General rate limiter for API endpoints
 * 100 requests per IP per minute
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
  keyGenerator: (req) => {
    // Use user ID if available, otherwise fall back to (IPv6-safe) IP
    return req.user?.id || ipKeyGenerator(req.ip ?? '');
  }
});

/**
 * Rate limiter for guess submissions
 * 5 guesses per user per minute
 */
export const guessRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.GUESS_RATE_LIMIT_MAX || '5'), // 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'You are guessing too frequently, please slow down' },
  keyGenerator: (req) => {
    // Use user ID as the key if available, otherwise (IPv6-safe) IP
    return req.user?.id || ipKeyGenerator(req.ip ?? '');
  },
  skip: (req) => {
    // Skip if it's not a POST request
    return req.method !== 'POST';
  }
});