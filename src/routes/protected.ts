import express from 'express';
import { authenticateJWT } from '../auth/middleware';
import { AppDataSource } from '../db/init';
import { User } from '../entities/User';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
// Resolve the repository lazily so the DataSource can be initialized (or mocked) first
const userRepository = () => AppDataSource.getRepository(User);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Get current user's profile
router.get('/users/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userRepository().findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.put('/users/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, avatarUrl } = req.body;

    const user = await userRepository().findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update fields if provided
    if (username) user.username = username;
    if (avatarUrl) user.avatar_url = avatarUrl;

    await userRepository().save(user);
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

// Upload avatar
router.post('/users/me/avatar', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const userId = req.user.id;
    const user = await userRepository().findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Create public URL for avatar (adjust path based on your server setup)
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;
    const avatarRelativePath = `/uploads/avatars/${req.file.filename}`;
    const avatarUrl = `${serverUrl}${avatarRelativePath}`;

    // Update user with new avatar URL
    user.avatar_url = avatarUrl;
    await userRepository().save(user);

    res.json({ avatarUrl });
  } catch (error) {
    console.error('[Avatar Upload] Error:', error);
    res.status(500).json({ message: 'Error uploading avatar', error: String(error) });
  }
});

// For verification purposes
router.get('/auth/verify', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userRepository().findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Error verifying token' });
  }
});

export default router;