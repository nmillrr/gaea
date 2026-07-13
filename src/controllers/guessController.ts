import { Request, Response } from 'express';
import { AppDataSource } from '../db/init';
import { Photo } from '../entities/Photo';
import { Guess } from '../entities/Guess';
import { scoreGuess } from '../game/scoring';
import { areFriends } from './friendController';
import { isUuid } from '../utils/validation';

const photoRepository = AppDataSource.getRepository(Photo);
const guessRepository = AppDataSource.getRepository(Guess);

// Submit a guess for a photo
export const submitGuess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    // Express 5 leaves req.body undefined when no parser handled the request
    const { guess_lat, guess_lng } = req.body ?? {};
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const userId = req.user.id;
    
    // Validate input
    if (guess_lat === undefined || guess_lng === undefined) {
      res.status(400).json({ message: 'guess_lat and guess_lng are required' });
      return;
    }
    
    // Parse coordinates as numbers
    const guessLat = parseFloat(guess_lat);
    const guessLng = parseFloat(guess_lng);
    
    // Validate coordinates
    if (isNaN(guessLat) || isNaN(guessLng) ||
        guessLat < -90 || guessLat > 90 || guessLng < -180 || guessLng > 180) {
      res.status(400).json({ message: 'Invalid coordinates' });
      return;
    }
    
    // Fetch the photo from the database
    const photo = isUuid(photoId)
      ? await photoRepository.findOne({ where: { id: photoId } })
      : null;

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }

    // Check if the user is the owner of the photo or friends with the owner
    const isOwner = photo.user_id === userId;
    if (!isOwner) {
      const isFriend = await areFriends(userId, photo.user_id);

      if (!isFriend) {
        res.status(403).json({ message: 'You must be friends with the photo owner to submit a guess' });
        return;
      }
    }
    
    // One guess per photo per user (checked after validation so bad input
    // still returns 400; the DB unique constraint is the final backstop)
    const existingGuess = await guessRepository.findOne({
      where: { photo_id: photoId, user_id: userId }
    });

    if (existingGuess) {
      res.status(429).json({
        message: 'You have already submitted a guess for this photo',
        guess: {
          id: existingGuess.id,
          distance_m: existingGuess.distance_meters,
          points: existingGuess.points,
          created_at: existingGuess.created_at
        }
      });
      return;
    }

    // Calculate score
    const { distance_m, points } = scoreGuess(
      photo.latitude, photo.longitude,
      guessLat, guessLng
    );
    
    // Create new guess record
    const guess = new Guess();
    guess.photo_id = photoId;
    guess.user_id = userId;
    guess.guess_lat = guessLat;
    guess.guess_lng = guessLng;
    guess.distance_meters = distance_m;
    guess.points = points;
    
    // Save to database
    const savedGuess = await guessRepository.save(guess);
    
    // Return result
    res.status(201).json({
      id: savedGuess.id,
      distance_m: savedGuess.distance_meters,
      points: savedGuess.points,
      created_at: savedGuess.created_at
    });
    
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ message: 'Failed to process guess' });
  }
};

// Get all guesses for a photo
export const getPhotoGuesses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const userId = req.user.id;
    
    // Fetch the photo to check if it exists
    const photo = isUuid(photoId)
      ? await photoRepository.findOne({ where: { id: photoId } })
      : null;

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }
    
    // Check if the user is the owner of the photo or friends with the owner
    const isOwner = photo.user_id === userId;
    if (!isOwner) {
      const isFriend = await areFriends(userId, photo.user_id);
      
      if (!isFriend) {
        res.status(403).json({ message: 'You must be friends with the photo owner to view guesses' });
        return;
      }
    }
    
    // Fetch guesses for this photo
    const guesses = await guessRepository.find({
      where: { photo_id: photoId },
      order: { points: 'DESC' }
    });
    
    // Format response
    const formattedGuesses = guesses.map(guess => ({
      id: guess.id,
      user_id: guess.user_id,
      distance_m: guess.distance_meters,
      points: guess.points,
      created_at: guess.created_at
    }));
    
    res.json(formattedGuesses);
    
  } catch (error) {
    console.error('Error fetching guesses:', error);
    res.status(500).json({ message: 'Failed to fetch guesses' });
  }
};

// Get the user's guess for a photo
export const getUserGuess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const userId = req.user.id;
    
    // Get target user ID (if specified)
    const targetUserId = req.query.user_id as string || userId;
    
    // If checking another user's guess, ensure they are friends
    if (targetUserId !== userId) {
      const isFriend = await areFriends(userId, targetUserId);
      
      if (!isFriend) {
        res.status(403).json({ message: 'You must be friends with this user to view their guess' });
        return;
      }
    }
    
    // Fetch the photo to check if it exists and that the user can access it
    const photo = isUuid(photoId)
      ? await photoRepository.findOne({ where: { id: photoId } })
      : null;

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }
    
    // Check if the current user is allowed to access this photo
    if (photo.user_id !== userId) {
      const isFriendWithOwner = await areFriends(userId, photo.user_id);
      
      if (!isFriendWithOwner) {
        res.status(403).json({ message: 'You must be friends with the photo owner to view guesses' });
        return;
      }
    }
    
    // Fetch the user's guess for this photo
    const guess = await guessRepository.findOne({
      where: { photo_id: photoId, user_id: targetUserId }
    });
    
    if (!guess) {
      res.status(404).json({ message: 'Guess not found' });
      return;
    }
    
    // Return result
    res.json({
      id: guess.id,
      user_id: guess.user_id,
      distance_m: guess.distance_meters,
      points: guess.points,
      created_at: guess.created_at
    });
    
  } catch (error) {
    console.error('Error fetching guess:', error);
    res.status(500).json({ message: 'Failed to fetch guess' });
  }
};