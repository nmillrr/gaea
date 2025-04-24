// @ts-nocheck
import express from 'express';
import { authenticateJWT } from '../auth/middleware';
import { uploadToS3 } from '../utils/s3';
import { uploadPhoto, getUserPhotos, getPhotoById } from '../controllers/photoController';

const router = express.Router();

// Photo upload endpoint
router.post('/', authenticateJWT, uploadToS3.single('photo'), uploadPhoto);

// Get user's photos
router.get('/', authenticateJWT, getUserPhotos);

// Get single photo
router.get('/:id', authenticateJWT, getPhotoById);

export default router;