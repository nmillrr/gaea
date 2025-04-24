// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from '../db/init';
import { Photo } from '../entities/Photo';
import { Guess } from '../entities/Guess';

// Repository for database checks
const photoRepository = AppDataSource.getRepository(Photo);
const guessRepository = AppDataSource.getRepository(Guess);

/**
 * Rate limit for photo uploads - 1 photo per user per 24 hours
 */
export const photoUploadRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    // Check if the user has uploaded a photo in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const recentPhoto = await photoRepository.findOne({
      where: {
        user_id: userId,
        created_at: { $gte: oneDayAgo } as any
      },
      order: { created_at: 'DESC' }
    });
    
    if (recentPhoto) {
      // Calculate the time remaining until they can upload again
      const timeSinceUpload = Date.now() - recentPhoto.created_at.getTime();
      const timeRemaining = 24 * 60 * 60 * 1000 - timeSinceUpload; // 24 hours in milliseconds
      const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));
      
      return res.status(429).json({
        message: `You can only upload 1 photo every 24 hours. Please try again in ${hoursRemaining} hours.`,
        next_allowed_upload: new Date(recentPhoto.created_at.getTime() + 24 * 60 * 60 * 1000)
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in photo upload rate limit middleware:', error);
    next(error);
  }
};

/**
 * Middleware to check if user has already guessed for a photo
 * This is a belt-and-suspenders approach in addition to the database constraint
 */
export const guessLimitPerPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    const { photoId } = req.params;
    
    // Check if the user has already submitted a guess for this photo
    const existingGuess = await guessRepository.findOne({
      where: { photo_id: photoId, user_id: userId }
    });
    
    if (existingGuess) {
      return res.status(429).json({
        message: 'You have already submitted a guess for this photo',
        guess: {
          id: existingGuess.id,
          distance_m: existingGuess.distance_meters,
          points: existingGuess.points,
          created_at: existingGuess.created_at
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in guess limit middleware:', error);
    next(error);
  }
};

/**
 * General rate limiter for auth endpoints
 * 10 requests per IP per minute
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later' },
  keyGenerator: (req) => {
    // Use IP address as the key
    return req.ip;
  }
});

/**
 * General rate limiter for API endpoints
 * 100 requests per IP per minute
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
  keyGenerator: (req) => {
    // Use IP address or user ID if available
    return req.user?.id || req.ip;
  }
});

/**
 * Rate limiter for guess submissions
 * 5 guesses per user per minute
 */
export const guessRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'You are guessing too frequently, please slow down' },
  keyGenerator: (req) => {
    // Use user ID as the key if available, otherwise IP
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    // Skip if it's not a POST request
    return req.method !== 'POST';
  }
});