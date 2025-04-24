import { Request, Response } from 'express';
import { AppDataSource } from '../db/init';
import { Photo } from '../entities/Photo';
import { User } from '../entities/User';
import { Guess } from '../entities/Guess';
import { Friendship, FriendshipStatus } from '../entities/Friendship';
import { getPublicUrl } from '../utils/s3';
import { areFriends } from './friendController';
import fs from 'fs';
import util from 'util';
import path from 'path';

const unlinkAsync = util.promisify(fs.unlink);
const photoRepository = AppDataSource.getRepository(Photo);
const userRepository = AppDataSource.getRepository(User);
const guessRepository = AppDataSource.getRepository(Guess);
const friendshipRepository = AppDataSource.getRepository(Friendship);

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

    // If a specific user's photos are requested
    const requestedUserId = req.query.user_id as string;
    
    if (requestedUserId && requestedUserId !== req.user.id) {
      // Check if the users are friends
      const isFriend = await areFriends(req.user.id, requestedUserId);
      
      if (!isFriend) {
        res.status(403).json({ message: 'You must be friends with this user to view their photos' });
        return;
      }
      
      // Get the friend's photos
      const photos = await photoRepository.find({
        where: { user_id: requestedUserId },
        order: { created_at: 'DESC' }
      });
      
      // Add S3 URLs to the photo objects
      const photosWithUrls = photos.map(photo => ({
        id: photo.id,
        user_id: photo.user_id,
        s3_url: getPublicUrl(photo.s3_key),
        latitude: photo.latitude,
        longitude: photo.longitude,
        created_at: photo.created_at
      }));
      
      res.json(photosWithUrls);
      return;
    }

    // Get the current user's photos
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
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const photoId = req.params.id;
    const photo = await photoRepository.findOne({
      where: { id: photoId }
    });

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }
    
    // Check if the current user is the owner of the photo
    const isOwner = photo.user_id === req.user.id;
    
    // If not the owner, check if they are friends
    if (!isOwner) {
      const isFriend = await areFriends(req.user.id, photo.user_id);
      
      if (!isFriend) {
        res.status(403).json({ message: 'You must be friends with the photo owner to view this photo' });
        return;
      }
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

/**
 * Get a feed of photos from friends
 * GET /photos/feed
 */
export const getPhotoFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const userId = req.user.id;
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    
    // Find all accepted friendships for the current user
    const friendships = await friendshipRepository.find({
      where: [
        { user_id: userId, status: FriendshipStatus.ACCEPTED },
        { friend_id: userId, status: FriendshipStatus.ACCEPTED }
      ]
    });
    
    // Extract friend IDs
    const friendIds = friendships.map(friendship => 
      friendship.user_id === userId ? friendship.friend_id : friendship.user_id
    );
    
    // If user has no friends, return empty array
    if (friendIds.length === 0) {
      res.json({
        photos: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      });
      return;
    }
    
    // Get the total count of photos from friends
    const totalCount = await photoRepository.count({
      where: { user_id: { $in: friendIds } as any }
    });
    
    // Query for photos from friends
    const photos = await AppDataSource
      .createQueryBuilder(Photo, 'photo')
      .innerJoin(User, 'user', 'photo.user_id = user.id')
      .select([
        'photo.id as id',
        'photo.s3_key as s3_key',
        'photo.created_at as created_at',
        'user.id as user_id',
        'user.username as username',
        'user.avatar_url as avatar_url'
      ])
      .where('photo.user_id IN (:...friendIds)', { friendIds })
      .orderBy('photo.created_at', 'DESC')
      .limit(pageSize)
      .offset(skip)
      .getRawMany();
    
    // Format the photos with S3 URLs
    const feedPhotos = photos.map(photo => ({
      id: photo.id,
      s3_url: getPublicUrl(photo.s3_key),
      user: {
        id: photo.user_id,
        username: photo.username,
        avatar_url: photo.avatar_url
      },
      created_at: photo.created_at
    }));
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Return response with pagination info
    res.json({
      photos: feedPhotos,
      total: totalCount,
      page,
      pageSize,
      totalPages
    });
    
  } catch (error) {
    console.error('Error getting photo feed:', error);
    res.status(500).json({ message: 'Failed to get photo feed' });
  }
};

/**
 * Get leaderboard for a photo
 * GET /photos/:photoId/leaderboard
 */
export const getPhotoLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const userId = req.user.id;
    const { photoId } = req.params;
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    
    // Get the photo to check if it exists and to get the owner
    const photo = await photoRepository.findOne({
      where: { id: photoId }
    });
    
    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }
    
    // Check if the current user is the owner or a friend of the owner
    const isOwner = photo.user_id === userId;
    if (!isOwner) {
      const isFriend = await areFriends(userId, photo.user_id);
      
      if (!isFriend) {
        res.status(403).json({ message: 'You must be friends with the photo owner to view the leaderboard' });
        return;
      }
    }
    
    // Get the total count of guesses for this photo
    const totalCount = await guessRepository.count({
      where: { photo_id: photoId }
    });
    
    // Get the guesses with user information
    const leaderboard = await AppDataSource
      .createQueryBuilder(Guess, 'guess')
      .innerJoin(User, 'user', 'guess.user_id = user.id')
      .select([
        'guess.id as id',
        'guess.distance_meters as distance_m',
        'guess.points as points',
        'guess.created_at as created_at',
        'user.id as user_id',
        'user.username as username',
        'user.avatar_url as avatar_url'
      ])
      .where('guess.photo_id = :photoId', { photoId })
      .orderBy('guess.points', 'DESC')
      .limit(pageSize)
      .offset(skip)
      .getRawMany();
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Return response with pagination info
    res.json({
      leaderboard,
      total: totalCount,
      page,
      pageSize,
      totalPages
    });
    
  } catch (error) {
    console.error('Error getting photo leaderboard:', error);
    res.status(500).json({ message: 'Failed to get photo leaderboard' });
  }
};