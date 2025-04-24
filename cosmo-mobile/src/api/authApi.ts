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
    const response = await axiosInstance.get('/api/me');
    return response.data;
  },
};