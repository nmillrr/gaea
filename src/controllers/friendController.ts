import { Request, Response } from 'express';
import { AppDataSource } from '../db/init';
import { User } from '../entities/User';
import { Friendship, FriendshipStatus } from '../entities/Friendship';

const userRepository = AppDataSource.getRepository(User);
const friendshipRepository = AppDataSource.getRepository(Friendship);

/**
 * Send a friendship request
 * POST /friends/request
 * body: { friend_email }
 */
export const sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { friend_email } = req.body;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    if (!friend_email) {
      res.status(400).json({ message: 'friend_email is required' });
      return;
    }
    
    const userId = req.user.id;
    
    // Find the target user by email
    const friend = await userRepository.findOne({ where: { email: friend_email } });
    
    if (!friend) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Prevent sending a request to self
    if (friend.id === userId) {
      res.status(400).json({ message: 'Cannot send friend request to yourself' });
      return;
    }
    
    // Check if a friendship already exists (in either direction)
    const existingFriendship = await friendshipRepository.findOne({
      where: [
        { user_id: userId, friend_id: friend.id },
        { user_id: friend.id, friend_id: userId }
      ]
    });
    
    if (existingFriendship) {
      // If the friendship already exists with current user as the requester
      if (existingFriendship.user_id === userId) {
        if (existingFriendship.status === FriendshipStatus.PENDING) {
          res.status(409).json({ message: 'Friend request already sent' });
        } else {
          res.status(409).json({ message: 'Already friends with this user' });
        }
        return;
      }
      
      // If the friendship exists with the current user as the recipient
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        // The other user has already sent a request, current user can accept it
        res.status(409).json({ 
          message: 'This user has already sent you a friend request',
          friendshipId: existingFriendship.user_id
        });
        return;
      } else {
        res.status(409).json({ message: 'Already friends with this user' });
        return;
      }
    }
    
    // Create a new friendship request
    const friendship = new Friendship();
    friendship.user_id = userId;
    friendship.friend_id = friend.id;
    friendship.status = FriendshipStatus.PENDING;
    
    await friendshipRepository.save(friendship);
    
    res.status(201).json({
      message: 'Friend request sent',
      friendship: {
        user_id: userId,
        friend_id: friend.id,
        status: FriendshipStatus.PENDING,
        created_at: friendship.created_at
      }
    });
    
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Failed to send friend request' });
  }
};

/**
 * Accept a friendship request
 * POST /friends/accept
 * body: { user_id } - ID of the user who sent the request
 */
export const acceptFriendRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.body;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    if (!user_id) {
      res.status(400).json({ message: 'user_id is required' });
      return;
    }
    
    const currentUserId = req.user.id;
    
    // Find the pending friendship request
    const friendship = await friendshipRepository.findOne({
      where: {
        user_id: user_id,
        friend_id: currentUserId,
        status: FriendshipStatus.PENDING
      }
    });
    
    if (!friendship) {
      res.status(404).json({ message: 'No pending friend request found from this user' });
      return;
    }
    
    // Update friendship status to accepted
    friendship.status = FriendshipStatus.ACCEPTED;
    await friendshipRepository.save(friendship);
    
    res.status(200).json({
      message: 'Friend request accepted',
      friendship: {
        user_id: friendship.user_id,
        friend_id: friendship.friend_id,
        status: FriendshipStatus.ACCEPTED,
        created_at: friendship.created_at
      }
    });
    
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Failed to accept friend request' });
  }
};

/**
 * List all accepted friends
 * GET /friends
 */
export const listFriends = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const userId = req.user.id;
    
    // Find all accepted friendships where the user is either the requester or the recipient
    const friendships = await friendshipRepository.find({
      where: [
        { user_id: userId, status: FriendshipStatus.ACCEPTED },
        { friend_id: userId, status: FriendshipStatus.ACCEPTED }
      ],
      relations: ['user', 'friend']
    });
    
    // Transform the friendships into a list of friends
    const friends = friendships.map(friendship => {
      // If current user is the requester, return the friend
      // If current user is the recipient, return the user
      const friend = friendship.user_id === userId ? friendship.friend : friendship.user;
      
      return {
        id: friend.id,
        email: friend.email,
        username: friend.username,
        avatar_url: friend.avatar_url,
        created_at: friendship.created_at
      };
    });
    
    res.status(200).json(friends);
    
  } catch (error) {
    console.error('Error listing friends:', error);
    res.status(500).json({ message: 'Failed to list friends' });
  }
};

/**
 * Helper function to check if two users are friends
 * This can be used by other controllers to enforce mutual-only gameplay
 */
export const areFriends = async (userId1: string, userId2: string): Promise<boolean> => {
  try {
    // Check if there's an accepted friendship between the users (in either direction)
    const friendship = await friendshipRepository.findOne({
      where: [
        { user_id: userId1, friend_id: userId2, status: FriendshipStatus.ACCEPTED },
        { user_id: userId2, friend_id: userId1, status: FriendshipStatus.ACCEPTED }
      ]
    });
    
    return !!friendship;
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
};