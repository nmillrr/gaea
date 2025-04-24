import axiosInstance from './axios';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

interface UpdateProfileData {
  username?: string;
  avatarUrl?: string;
}

export const authApi = {
  login: async (data: LoginData) => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterData) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },
  
  getUserProfile: async () => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await axiosInstance.post('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (formData: FormData) => {
    const response = await axiosInstance.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};