import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './db/init';
import { securityMiddleware } from './middleware/security';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import photoRoutes from './routes/photos';
import guessRoutes from './routes/guess';
import friendRoutes from './routes/friends';
import notificationRoutes from './routes/notifications';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(securityMiddleware);

// Basic middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global rate limiter
app.use(apiRateLimiter);

// Routes with rate limiting
app.use('/auth', authRateLimiter, authRoutes);
app.use('/api', protectedRoutes);
app.use('/photos', photoRoutes);
app.use('/photos', guessRoutes);
app.use('/friends', friendRoutes);
app.use('/notifications', notificationRoutes);

// Health check endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize the database
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;