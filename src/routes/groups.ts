// @ts-nocheck
import express from 'express';
import { authenticateJWT } from '../auth/middleware';
import {
  createGroup,
  listMyGroups,
  getGroup,
  addMember,
  removeMember,
} from '../controllers/groupController';

const router = express.Router();

// POST   /groups              — Create a new group
router.post('/', authenticateJWT, createGroup);

// GET    /groups              — List groups the user belongs to
router.get('/', authenticateJWT, listMyGroups);

// GET    /groups/:groupId     — Get group detail + members
router.get('/:groupId', authenticateJWT, getGroup);

// POST   /groups/:groupId/members         — Add a member to a group
router.post('/:groupId/members', authenticateJWT, addMember);

// DELETE /groups/:groupId/members/:userId — Remove / leave a group
router.delete('/:groupId/members/:userId', authenticateJWT, removeMember);

export default router;
