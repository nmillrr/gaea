import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  login as loginAction,
  logout as logoutAction,
  register as registerAction,
  setToken,
  setOnboardingComplete,
  clearError,
  restoreSession,
} from '../store/slices/authSlice';
import { LoginCredentials, RegisterCredentials, authApi } from '../api/authApi';
import {
  getToken,
  getRefreshToken,
  saveToken,
  saveRefreshToken,
  isTokenExpired,
  removeToken
} from '../utils/secureStorage';

/**
 * Hook to handle authentication state and operations
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = useState(true);

  // Initialize auth state when the app loads
  useEffect(() => {
    // Try to restore authentication state on app startup
    const restoreAuthState = async () => {
      try {
        // Check if we have a token
        const token = await getToken();
        
        if (token) {
          // Set token in Redux state
          dispatch(setToken(token));
          
          // Check if token is expired
          const expired = await isTokenExpired();
          
          if (expired) {
            // Try to refresh the token
            const refreshToken = await getRefreshToken();
            
            if (refreshToken) {
              try {
                // Call refresh token API
                const refreshResponse = await authApi.refreshToken(refreshToken);
                
                // Save the new tokens
                await saveToken(refreshResponse.token);
                if (refreshResponse.refreshToken) {
                  await saveRefreshToken(refreshResponse.refreshToken);
                }
                
                // Update Redux state
                dispatch(setToken(refreshResponse.token));

                // Get user profile with new token and rehydrate the session
                const userResponse = await authApi.getUserProfile();
                dispatch(restoreSession(userResponse.user));

              } catch (error) {
                // Refresh token failed
                console.error('Token refresh failed:', error);
                await removeToken();
                dispatch(logoutAction());
              }
            } else {
              // No refresh token, logout
              console.warn('No refresh token found for expired token');
              await removeToken();
              dispatch(logoutAction());
            }
          } else {
            // Token is valid, get user profile and rehydrate the session
            try {
              const userResponse = await authApi.getUserProfile();
              dispatch(restoreSession(userResponse.user));

            } catch (error) {
              console.error('Failed to get user profile:', error);
              await removeToken();
              dispatch(logoutAction());
            }
          }
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        await removeToken();
        dispatch(logoutAction());
      } finally {
        setInitializing(false);
      }
    };
    
    restoreAuthState();
  }, [dispatch]);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch(clearError());
      const resultAction = await dispatch(loginAction(credentials));
      
      if (loginAction.fulfilled.match(resultAction)) {
        // If the login response includes a refresh token, save it
        const refreshToken = resultAction.payload.refreshToken;
        if (refreshToken) {
          await saveRefreshToken(refreshToken);
        }
        return { success: true };
      } else {
        return { 
          success: false, 
          error: resultAction.payload as string 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch(clearError());
      const resultAction = await dispatch(registerAction(credentials));
      
      if (registerAction.fulfilled.match(resultAction)) {
        // If the register response includes a refresh token, save it
        const refreshToken = resultAction.payload.refreshToken;
        if (refreshToken) {
          await saveRefreshToken(refreshToken);
        }
        return { success: true };
      } else {
        return { 
          success: false, 
          error: resultAction.payload as string 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutAction());
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Logout failed. Please try again.' 
      };
    }
  };

  const completeOnboarding = () => {
    dispatch(setOnboardingComplete(true));
  };

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    onboardingComplete: auth.onboardingComplete,
    initializing,
    login,
    register,
    logout,
    completeOnboarding,
  };
};