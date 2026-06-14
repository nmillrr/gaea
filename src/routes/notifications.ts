// @ts-nocheck
import express from 'express';
import { authenticateJWT } from '../auth/middleware';
import {
  sendTestPushNotification,
  registerUserDeviceToken,
  getActivity
} from '../controllers/notificationController';

const router = express.Router();

/**
 * Activity feed endpoint
 * GET /notifications/activity
 * Returns guesses/comments others made on the authenticated user's posts
 */
router.get('/activity', authenticateJWT, getActivity);

/**
 * Test notification endpoint
 * POST /notifications/test
 * Sends a test notification to the provided user token
 */
router.post('/test', sendTestPushNotification);

/**
 * Register device token endpoint
 * POST /notifications/register
 * Registers a device token for the authenticated user
 */
router.post('/register', authenticateJWT, registerUserDeviceToken);

export default router;