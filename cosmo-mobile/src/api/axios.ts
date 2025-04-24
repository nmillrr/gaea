import axios from 'axios';
import { store } from '../store';

// Create an Axios instance with custom configuration
const API_URL = 'http://localhost:4000';  // Replace with your actual API URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the auth token from store
    const token = store.getState().auth.token;
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access (e.g., token expired)
          // You can dispatch a logout action here if needed
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

export default axiosInstance;