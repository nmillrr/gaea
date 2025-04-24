import { Request, Response } from 'express';
import { AppDataSource } from '../db/init';
import { Photo } from '../entities/Photo';
import { getPublicUrl } from '../utils/s3';
import fs from 'fs';
import util from 'util';
import path from 'path';

const unlinkAsync = util.promisify(fs.unlink);
const photoRepository = AppDataSource.getRepository(Photo);

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Extract file info from middleware
    const s3File = req.file as Express.MulterS3.File;
    const s3Key = s3File.key;
    
    // Extract or get coordinates
    let latitude: number;
    let longitude: number;
    
    // Check if coordinates are provided in the request body
    if (req.body.latitude && req.body.longitude) {
      latitude = parseFloat(req.body.latitude);
      longitude = parseFloat(req.body.longitude);
      
      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) ||
          latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        res.status(400).json({ message: 'Invalid coordinates' });
        return;
      }
    } else {
      // No coordinates provided
      res.status(400).json({ message: 'Coordinates (latitude/longitude) are required' });
      return;
    }

    // Create new photo record
    const photo = new Photo();
    photo.user_id = req.user.id;
    photo.s3_key = s3Key;
    photo.latitude = latitude;
    photo.longitude = longitude;

    // Save to database
    const savedPhoto = await photoRepository.save(photo);

    // Generate public URL for the photo
    const s3_url = getPublicUrl(s3Key);

    // Return response
    res.status(201).json({
      id: savedPhoto.id,
      s3_url,
      latitude: savedPhoto.latitude,
      longitude: savedPhoto.longitude,
      created_at: savedPhoto.created_at
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
};

export const getUserPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const photos = await photoRepository.find({
      where: { user_id: req.user.id },
      order: { created_at: 'DESC' }
    });

    // Add S3 URLs to the photo objects
    const photosWithUrls = photos.map(photo => ({
      id: photo.id,
      s3_url: getPublicUrl(photo.s3_key),
      latitude: photo.latitude,
      longitude: photo.longitude,
      created_at: photo.created_at
    }));

    res.json(photosWithUrls);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Failed to fetch photos' });
  }
};

export const getPhotoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const photoId = req.params.id;
    const photo = await photoRepository.findOne({
      where: { id: photoId }
    });

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }

    res.json({
      id: photo.id,
      s3_url: getPublicUrl(photo.s3_key),
      latitude: photo.latitude,
      longitude: photo.longitude,
      created_at: photo.created_at,
      user_id: photo.user_id
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ message: 'Failed to fetch photo' });
  }
};