// @ts-nocheck
import express from 'express';
import { authenticateJWT } from '../auth/middleware';

const router = express.Router();

// Example of a protected route
router.get('/me', authenticateJWT, (req, res) => {
  res.json({ 
    message: 'You are authenticated!',
    user: req.user 
  });
});

export default router;