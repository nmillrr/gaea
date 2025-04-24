// @ts-nocheck
import express from 'express';
import { authenticateJWT } from '../auth/middleware';
import { uploadToS3 } from '../utils/s3';
import { photoUploadRateLimit } from '../middleware/rateLimit';
import { 
  uploadPhoto, 
  getUserPhotos, 
  getPhotoById,
  getPhotoFeed,
  getPhotoLeaderboard
} from '../controllers/photoController';

const router = express.Router();

// Photo upload endpoint - limited to 1 upload per 24 hours per user
router.post('/', authenticateJWT, photoUploadRateLimit, uploadToS3.single('photo'), uploadPhoto);

// Get user's photos
router.get('/', authenticateJWT, getUserPhotos);

// Get photo feed - photos from friends
router.get('/feed', authenticateJWT, getPhotoFeed);

// Get single photo
router.get('/:id', authenticateJWT, getPhotoById);

// Get photo leaderboard
router.get('/:photoId/leaderboard', authenticateJWT, getPhotoLeaderboard);

export default router;