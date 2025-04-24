// @ts-nocheck
import express from 'express';
import { authenticateJWT } from '../auth/middleware';
import {
  sendTestPushNotification,
  registerUserDeviceToken
} from '../controllers/notificationController';

const router = express.Router();

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