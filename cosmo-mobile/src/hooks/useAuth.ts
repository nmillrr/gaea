import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getToken } from '../utils/secureStorage';
import { authApi } from '../api/authApi';
import { AppDispatch } from '../store';
import { loginSuccess, loginFailure } from '../store/slices/authSlice';

/**
 * Hook to handle authentication state restoration
 * This should be used in the root component to restore auth state
 * from secure storage when the app starts
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    // Try to restore authentication state on app startup
    const restoreAuthState = async () => {
      try {
        // Get the token from secure storage
        const token = await getToken();
        
        if (token) {
          // If we have a token, try to get the user profile
          const userResponse = await authApi.getUserProfile();
          
          // If successful, update the auth state
          dispatch(loginSuccess({
            user: userResponse,
            token
          }));
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        dispatch(loginFailure('Session expired. Please log in again.'));
      }
    };
    
    restoreAuthState();
  }, [dispatch]);
};