import { Request, Response } from 'express';
import { sendTestNotification, registerDeviceToken } from '../services/notifications';

/**
 * Send a test notification to a device
 * POST /notifications/test
 * body: { user_token }
 */
export const sendTestPushNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_token } = req.body;
    
    if (!user_token) {
      res.status(400).json({ message: 'user_token is required' });
      return;
    }
    
    await sendTestNotification(user_token);
    
    res.status(200).json({ 
      message: 'Test notification sent successfully',
      details: 'Check the server console for the notification log'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Failed to send test notification' });
  }
};

/**
 * Register a device token for the authenticated user
 * POST /notifications/register
 * body: { device_token }
 */
export const registerUserDeviceToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const { device_token } = req.body;
    
    if (!device_token) {
      res.status(400).json({ message: 'device_token is required' });
      return;
    }
    
    await registerDeviceToken(req.user.id, device_token);
    
    res.status(200).json({ message: 'Device token registered successfully' });
  } catch (error) {
    console.error('Error registering device token:', error);
    res.status(500).json({ message: 'Failed to register device token' });
  }
};