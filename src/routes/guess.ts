// @ts-nocheck
import express, { Request, Response } from 'express';
import { authenticateJWT } from '../auth/middleware';
import { AppDataSource } from '../db/init';
import { Photo } from '../entities/Photo';
import { Guess } from '../entities/Guess';
import { scoreGuess } from '../game/scoring';

const router = express.Router();
const photoRepository = AppDataSource.getRepository(Photo);
const guessRepository = AppDataSource.getRepository(Guess);

// POST /photos/:photoId/guess - Submit a guess for a photo
router.post('/:photoId/guess', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const { guess_lat, guess_lng } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    // Validate input
    if (guess_lat === undefined || guess_lng === undefined) {
      return res.status(400).json({ message: 'guess_lat and guess_lng are required' });
    }
    
    // Parse coordinates as numbers
    const guessLat = parseFloat(guess_lat);
    const guessLng = parseFloat(guess_lng);
    
    // Validate coordinates
    if (isNaN(guessLat) || isNaN(guessLng) ||
        guessLat < -90 || guessLat > 90 || guessLng < -180 || guessLng > 180) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }
    
    // Fetch the photo from the database
    const photo = await photoRepository.findOne({ where: { id: photoId } });
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    // Check if the user has already guessed for this photo
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
    return res.status(201).json({
      id: savedGuess.id,
      distance_m: savedGuess.distance_meters,
      points: savedGuess.points,
      created_at: savedGuess.created_at
    });
    
  } catch (error) {
    console.error('Error processing guess:', error);
    return res.status(500).json({ message: 'Failed to process guess' });
  }
});

// GET /photos/:photoId/guesses - Get all guesses for a photo
router.get('/:photoId/guesses', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Fetch the photo to check if it exists
    const photo = await photoRepository.findOne({ where: { id: photoId } });
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
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
    
    return res.json(formattedGuesses);
    
  } catch (error) {
    console.error('Error fetching guesses:', error);
    return res.status(500).json({ message: 'Failed to fetch guesses' });
  }
});

// GET /photos/:photoId/guess - Get the user's guess for a photo
router.get('/:photoId/guess', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    // Fetch the user's guess for this photo
    const guess = await guessRepository.findOne({
      where: { photo_id: photoId, user_id: userId }
    });
    
    if (!guess) {
      return res.status(404).json({ message: 'Guess not found' });
    }
    
    // Return result
    return res.json({
      id: guess.id,
      distance_m: guess.distance_meters,
      points: guess.points,
      created_at: guess.created_at
    });
    
  } catch (error) {
    console.error('Error fetching guess:', error);
    return res.status(500).json({ message: 'Failed to fetch guess' });
  }
});

export default router;