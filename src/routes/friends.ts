// @ts-nocheck
import express from 'express';
import { authenticateJWT } from '../auth/middleware';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  listFriends
} from '../controllers/friendController';

const router = express.Router();

// Send a friendship request
router.post('/request', authenticateJWT, sendFriendRequest);

// Accept a pending friendship request
router.post('/accept', authenticateJWT, acceptFriendRequest);

// List all accepted friends
router.get('/', authenticateJWT, listFriends);

export default router;