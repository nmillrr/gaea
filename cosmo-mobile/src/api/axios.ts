import axios from 'axios';
import { getToken } from '../utils/secureStorage';
import { Platform } from 'react-native';

// Create an Axios instance with custom configuration
// For iOS physical device, you need to use your computer's local network IP
// Get this IP by running 'ipconfig getifaddr en0' on Mac terminal
// or check your network settings
const API_URL = Platform.select({
  ios: 'http://192.168.1.8:4000',  // Your computer's IP address
  android: 'http://10.0.2.2:4000',  // Android emulator special IP
  default: 'http://localhost:4000'  // Fallback for web
});

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get the auth token from secure storage
    const token = await getToken();
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (__DEV__) {
      console.log(
        `API Request: ${config.method?.toUpperCase()} ${config.url}`,
        config.params || config.data || {}
      );
    }
    
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (__DEV__) {
      console.log(
        `API Response: ${response.status} ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (__DEV__) {
      console.error(
        `API Error: ${error.response?.status || 'Network Error'} ${error.config?.url || ''}`,
        error.response?.data || error.message
      );
    }
    
    // Handle specific error status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access (e.g., token expired)
          // We'll just log it for now to avoid circular dependencies
          console.warn('Authentication token expired or invalid');
          break;
        case 403:
          // Handle forbidden access
          break;
        case 500:
          // Handle server errors
          break;
        default:
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to create FormData for file uploads
export const createFormData = (file: string, body: Record<string, any> = {}) => {
  const formData = new FormData();
  
  // Append the file
  const filename = file.split('/').pop() || 'file';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  formData.append('file', {
    uri: Platform.OS === 'ios' ? file.replace('file://', '') : file,
    name: filename,
    type,
  } as any);
  
  // Append other fields
  Object.keys(body).forEach(key => {
    formData.append(key, body[key]);
  });
  
  return formData;
};

export default axiosInstance;