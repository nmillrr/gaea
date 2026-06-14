import { Request, Response } from 'express';
import { sendTestNotification, registerDeviceToken } from '../services/notifications';
import { AppDataSource } from '../db/init';
import { Guess } from '../entities/Guess';
import { Comment } from '../entities/Comment';
import { Photo } from '../entities/Photo';
import { User } from '../entities/User';
import { getPublicUrl } from '../utils/s3';

interface ActivityItem {
  id: string;
  type: 'guess' | 'comment';
  actor: { username: string; avatar_url: string | null };
  others_count: number;
  photo_thumb_url: string;
  created_at: Date;
}

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

/**
 * Activity feed for the authenticated user.
 * GET /notifications/activity
 *
 * Surfaces what others have done on *your* posts — guesses and comments —
 * grouped into "today" and "earlier" (per the Activity / notifications mockup).
 * Guesses are aggregated per post ("username and N others guessed on your post");
 * comments are listed individually.
 */
export const getActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const me = req.user.id;

    // Guesses by others on my photos, newest first.
    const guessRows = await AppDataSource.createQueryBuilder(Guess, 'guess')
      .innerJoin(User, 'u', 'guess.user_id = u.id')
      .innerJoin(Photo, 'p', 'guess.photo_id = p.id')
      .select([
        'guess.photo_id as photo_id',
        'guess.user_id as user_id',
        'guess.created_at as created_at',
        'u.username as username',
        'u.avatar_url as avatar_url',
        'p.s3_key as s3_key',
      ])
      .where('p.user_id = :me', { me })
      .andWhere('guess.user_id != :me', { me })
      .orderBy('guess.created_at', 'DESC')
      .getRawMany();

    // Comments by others on my photos, newest first.
    const commentRows = await AppDataSource.createQueryBuilder(Comment, 'c')
      .innerJoin(User, 'u', 'c.user_id = u.id')
      .innerJoin(Photo, 'p', 'c.photo_id = p.id')
      .select([
        'c.id as id',
        'c.created_at as created_at',
        'u.username as username',
        'u.avatar_url as avatar_url',
        'p.s3_key as s3_key',
      ])
      .where('p.user_id = :me', { me })
      .andWhere('c.user_id != :me', { me })
      .orderBy('c.created_at', 'DESC')
      .getRawMany();

    // Aggregate guesses by post: most recent guesser is the actor, the rest are
    // counted as "and N others".
    const byPhoto = new Map<string, { actor: any; others: Set<string> }>();
    for (const row of guessRows) {
      const group = byPhoto.get(row.photo_id);
      if (!group) {
        byPhoto.set(row.photo_id, { actor: row, others: new Set() });
      } else if (row.user_id !== group.actor.user_id) {
        group.others.add(row.user_id);
      }
    }

    const items: ActivityItem[] = [];
    for (const [photoId, g] of byPhoto) {
      items.push({
        id: `guess-${photoId}`,
        type: 'guess',
        actor: { username: g.actor.username, avatar_url: g.actor.avatar_url ?? null },
        others_count: g.others.size,
        photo_thumb_url: getPublicUrl(g.actor.s3_key),
        created_at: g.actor.created_at,
      });
    }
    for (const row of commentRows) {
      items.push({
        id: `comment-${row.id}`,
        type: 'comment',
        actor: { username: row.username, avatar_url: row.avatar_url ?? null },
        others_count: 0,
        photo_thumb_url: getPublicUrl(row.s3_key),
        created_at: row.created_at,
      });
    }

    // Newest first, then split into Today vs Earlier by calendar day.
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const todayStr = new Date().toDateString();
    const today = items.filter((i) => new Date(i.created_at).toDateString() === todayStr);
    const earlier = items.filter((i) => new Date(i.created_at).toDateString() !== todayStr);

    res.json({ today, earlier });
  } catch (error) {
    console.error('Error getting activity:', error);
    res.status(500).json({ message: 'Failed to get activity' });
  }
};