import axiosInstance from './axios';

export interface ActivityItem {
  id: string;
  type: 'guess' | 'comment';
  actor: { username: string; avatar_url?: string | null };
  others_count: number;
  photo_thumb_url: string;
  created_at: string;
}

export interface ActivityResponse {
  today: ActivityItem[];
  earlier: ActivityItem[];
}

export const notificationApi = {
  getActivity: async (): Promise<ActivityResponse> => {
    const response = await axiosInstance.get('/notifications/activity');
    return response.data;
  },
};
