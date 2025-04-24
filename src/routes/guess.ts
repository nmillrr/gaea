// @ts-nocheck
import express from 'express';
import { authenticateJWT } from '../auth/middleware';
import { guessLimitPerPhoto, guessRateLimiter } from '../middleware/rateLimit';
import { submitGuess, getPhotoGuesses, getUserGuess } from '../controllers/guessController';

const router = express.Router();

// POST /photos/:photoId/guess - Submit a guess for a photo
// Apply rate limiting and check for existing guesses
router.post('/:photoId/guess', authenticateJWT, guessRateLimiter, guessLimitPerPhoto, submitGuess);

// GET /photos/:photoId/guesses - Get all guesses for a photo
router.get('/:photoId/guesses', authenticateJWT, getPhotoGuesses);

// GET /photos/:photoId/guess - Get the user's guess for a photo
router.get('/:photoId/guess', authenticateJWT, getUserGuess);

export default router;