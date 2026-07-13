import { configureStore } from '@reduxjs/toolkit';

type AuthPreload = Partial<ReturnType<typeof authReducer>>;
import authReducer, { 
  login, 
  logout, 
  register, 
  clearError 
} from '../store/slices/authSlice';

// Mock the API functions and secure storage utilities
jest.mock('../api/authApi', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    getUserProfile: jest.fn()
  }
}));

jest.mock('../utils/secureStorage', () => ({
  saveToken: jest.fn(),
  getToken: jest.fn(),
  removeToken: jest.fn()
}));

import { authApi } from '../api/authApi';
import { saveToken, removeToken } from '../utils/secureStorage';

const makeStore = (auth?: AuthPreload) =>
  configureStore({
    reducer: {
      auth: authReducer
    },
    ...(auth
      ? {
          preloadedState: {
            auth: {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              onboardingComplete: false,
              token: null,
              ...auth
            }
          }
        }
      : {})
  });

describe('Auth Slice', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a fresh store for each test
    store = makeStore();
  });
  
  describe('Login Flow', () => {
    const mockCredentials = { email: 'test@example.com', password: 'password123' };
    const mockResponse = { 
      user: { id: '123', email: 'test@example.com', username: 'testuser' },
      token: 'mock-jwt-token'
    };
    
    it('should handle login success', async () => {
      // Mock API response
      (authApi.login as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Dispatch the login action
      await store.dispatch(login(mockCredentials));
      
      // Check that the token was saved
      expect(saveToken).toHaveBeenCalledWith(mockResponse.token);
      
      // Check that the state was updated
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockResponse.user);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    it('should handle login failure', async () => {
      // Mock API error
      const errorMessage = 'Invalid credentials';
      (authApi.login as jest.Mock).mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });
      
      // Dispatch the login action
      await store.dispatch(login(mockCredentials));
      
      // Check that the token was not saved
      expect(saveToken).not.toHaveBeenCalled();
      
      // Check that the state reflects the error
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });
  
  describe('Register Flow', () => {
    const mockCredentials = { 
      email: 'new@example.com', 
      username: 'newuser', 
      password: 'password123' 
    };
    const mockResponse = { 
      user: { id: '456', email: 'new@example.com', username: 'newuser' },
      token: 'mock-jwt-token'
    };
    
    it('should handle register success', async () => {
      // Mock API response
      (authApi.register as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Dispatch the register action
      await store.dispatch(register(mockCredentials));
      
      // Check that the token was saved
      expect(saveToken).toHaveBeenCalledWith(mockResponse.token);
      
      // Check that the state was updated
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockResponse.user);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    it('should handle register failure', async () => {
      // Mock API error
      const errorMessage = 'Email already in use';
      (authApi.register as jest.Mock).mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });
      
      // Dispatch the register action
      await store.dispatch(register(mockCredentials));
      
      // Check that the token was not saved
      expect(saveToken).not.toHaveBeenCalled();
      
      // Check that the state reflects the error
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });
  
  describe('Logout', () => {
    it('should clear auth state on logout', async () => {
      // Set an authenticated state first
      store = makeStore({
        user: { id: '123', email: 'test@example.com', username: 'testuser' },
        isAuthenticated: true
      });
      
      // Dispatch logout action
      await store.dispatch(logout());
      
      // Check that the token was removed
      expect(removeToken).toHaveBeenCalled();
      
      // Check that auth state was reset
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
  
  describe('Error Handling', () => {
    it('should clear error when clearError action is dispatched', () => {
      // Set an error state first
      store = makeStore({
        error: 'Some error message'
      });
      
      // Dispatch clearError action
      store.dispatch(clearError());
      
      // Check that the error was cleared
      const state = store.getState().auth;
      expect(state.error).toBeNull();
    });
  });
});