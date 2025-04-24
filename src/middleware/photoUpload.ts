// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import util from 'util';

const unlinkAsync = util.promisify(fs.unlink);

// Configure multer for temporary disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Validate file type
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB in bytes
  },
  fileFilter: fileFilter
});

// Middleware to strip EXIF data and extract GPS coordinates
export async function processImageMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return next();
    }

    const filePath = req.file.path;
    
    // Extract EXIF data including GPS if available
    const metadata = await sharp(filePath).metadata();
    
    // Process the image to strip metadata
    const outputBuffer = await sharp(filePath)
      .withMetadata(false) // Strip all metadata
      .toBuffer();
    
    // Replace the original file with the processed version
    await fs.promises.writeFile(filePath, outputBuffer);
    
    // Add EXIF data to the request for later use
    // Note: In a real implementation, you would use a proper EXIF parser library
    // like exifr to extract GPS coordinates
    
    // For now, we just rely on req.body.latitude and req.body.longitude
    
    next();
  } catch (error) {
    // Clean up the temporary file if there's an error
    if (req.file && req.file.path) {
      await unlinkAsync(req.file.path).catch(err => console.error('Error deleting file:', err));
    }
    
    res.status(500).json({ message: 'Error processing image' });
  }
}