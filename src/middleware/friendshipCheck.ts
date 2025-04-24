// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { areFriends } from '../controllers/friendController';

/**
 * Middleware to check if the requester is friends with the photo owner
 * This enforces mutual-only gameplay
 */
export const friendshipRequired = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get current user ID
    const currentUserId = req.user.id;
    
    // Get the photo owner ID
    let ownerId;
    
    // If the photo ID is in params, fetch the photo's owner
    if (req.params.photoId) {
      const { photoId } = req.params;
      
      // Here you would typically fetch the photo to get the owner ID
      // For simplicity, assume we have a getter function or service that does this
      const photoOwnerId = await getPhotoOwner(photoId);
      
      if (!photoOwnerId) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      
      ownerId = photoOwnerId;
    } else if (req.body.user_id) {
      // If we're dealing with a direct user ID reference
      ownerId = req.body.user_id;
    } else {
      return res.status(400).json({ message: 'Cannot determine target user' });
    }
    
    // If the owner is the current user, allow the request
    if (ownerId === currentUserId) {
      return next();
    }
    
    // Check if the users are friends
    const isFriend = await areFriends(currentUserId, ownerId);
    
    if (isFriend) {
      // Users are friends, allow the request
      next();
    } else {
      // Users are not friends, deny the request
      res.status(403).json({ message: 'You must be friends with this user to access their content' });
    }
  } catch (error) {
    console.error('Error checking friendship:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
};

/**
 * Helper function to get a photo's owner ID
 * In a real implementation, this would query the database
 */
const getPhotoOwner = async (photoId: string): Promise<string | null> => {
  // Here you would fetch the photo from the database and return the owner ID
  // For now, this is a placeholder
  const { AppDataSource } = require('../db/init');
  const { Photo } = require('../entities/Photo');
  
  const photoRepository = AppDataSource.getRepository(Photo);
  const photo = await photoRepository.findOne({ where: { id: photoId } });
  
  return photo ? photo.user_id : null;
};