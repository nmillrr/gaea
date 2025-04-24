import axiosInstance from './axios';

export interface Photo {
  id: string;
  s3_url: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  latitude?: number;
  longitude?: number;
}

export interface PhotoResponse {
  photos: Photo[];
}

export interface PhotoDetailResponse {
  photo: Photo;
}

export const photoApi = {
  getFeed: async (): Promise<PhotoResponse> => {
    const response = await axiosInstance.get('/photos/feed');
    return response.data;
  },
  
  getPhoto: async (photoId: string): Promise<PhotoDetailResponse> => {
    const response = await axiosInstance.get(`/photos/${photoId}`);
    return response.data;
  },
  
  submitGuess: async (photoId: string, guessData: { guess_lat: number; guess_lng: number }) => {
    const response = await axiosInstance.post(`/photos/${photoId}/guess`, guessData);
    return response.data;
  }
};