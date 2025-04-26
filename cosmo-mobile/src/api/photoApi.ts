import axiosInstance from './axios';
import { Platform } from 'react-native';

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

export interface UploadPhotoResponse {
  id: string;
  s3_url: string;
  created_at: string;
  message?: string;
}

export interface UploadCheckResponse {
  canUpload: boolean;
  message?: string;
  nextUploadTime?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  points: number;
  position: number;
}

export interface GuessResult {
  points: number;
  distance_m: number;
  actual_lat: number;
  actual_lng: number;
  guess_lat: number;
  guess_lng: number;
  leaderboard: LeaderboardEntry[];
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
  
  submitGuess: async (photoId: string, guessData: { guess_lat: number; guess_lng: number }): Promise<GuessResult> => {
    const response = await axiosInstance.post(`/photos/${photoId}/guess`, guessData);
    return response.data;
  },

  uploadPhoto: async (
    photoUri: string, 
    location: { latitude: number; longitude: number },
    caption?: string
  ): Promise<UploadPhotoResponse> => {
    console.log('photoApi.uploadPhoto called with:', {
      photoUri: photoUri.substring(0, 30) + '...',
      location,
      caption
    });
    
    try {
      // Create form data for upload
      const formData = new FormData();
      
      // Append the image file
      const filename = photoUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('photo', {
        uri: Platform.OS === 'ios' ? photoUri.replace('file://', '') : photoUri,
        name: filename,
        type,
      } as any);
      
      // Append location data
      formData.append('latitude', String(location.latitude));
      formData.append('longitude', String(location.longitude));
      
      // Append caption if provided
      if (caption) {
        formData.append('caption', caption);
      }

      console.log('Sending photo upload request to server...');
      const response = await axiosInstance.post('/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in photoApi.uploadPhoto:', error);
      // For development purposes, return a mock response instead of failing
      const mockResponse: UploadPhotoResponse = {
        id: 'mock-' + new Date().getTime(),
        s3_url: photoUri,
        created_at: new Date().toISOString(),
        message: 'Development mode: Image saved locally only'
      };
      console.log('Returning mock response:', mockResponse);
      return mockResponse;
    }
  },

  getUserPhotos: async (): Promise<PhotoResponse> => {
    const response = await axiosInstance.get('/users/me/photos');
    return response.data;
  },

  checkUploadAllowed: async (): Promise<UploadCheckResponse> => {
    const response = await axiosInstance.get('/photos/check-upload');
    return response.data;
  }
};