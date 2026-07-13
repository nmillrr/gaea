import axiosInstance, { createFormData } from './axios';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
  };
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

export interface UpdateProfileData {
  username?: string;
  avatarUrl?: string;
}

export interface ProfileResponse {
  user: {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface UploadAvatarResponse {
  avatarUrl: string;
}

// Auth API
export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register user
   */
  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  /**
   * Refresh token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  /**
   * Get user profile
   */
  getUserProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosInstance.get('/api/users/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<ProfileResponse> => {
    const response = await axiosInstance.put('/api/users/me', data);
    return response.data;
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (formData: FormData): Promise<UploadAvatarResponse> => {
    const response = await axiosInstance.post('/api/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Verify token is valid
   */
  verifyToken: async (): Promise<{ valid: boolean; user?: ProfileResponse['user'] }> => {
    try {
      const response = await axiosInstance.get('/api/auth/verify');
      return { valid: true, user: response.data.user };
    } catch (error) {
      return { valid: false };
    }
  },
};