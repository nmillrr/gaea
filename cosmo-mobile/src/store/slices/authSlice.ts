import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import { saveToken, removeToken } from '../../utils/secureStorage';

// Types
interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingComplete: boolean;
  token: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

interface UpdateProfileData {
  username?: string;
  avatarUrl?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Async thunks
export const login = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      
      // Store the token in secure storage
      await saveToken(response.token);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  }
);

export const register = createAsyncThunk<AuthResponse, RegisterCredentials>(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.register(credentials);
      
      // Store the token in secure storage
      await saveToken(response.token);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // Remove the token from secure storage
    await removeToken();
    return true;
  }
);

export const updateUserProfile = createAsyncThunk<User, UpdateProfileData>(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(profileData);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Profile update failed. Please try again.'
      );
    }
  }
);

export const uploadAvatar = createAsyncThunk<{ avatarUrl: string }, FormData>(
  'auth/uploadAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authApi.uploadAvatar(formData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Avatar upload failed. Please try again.'
      );
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  onboardingComplete: false,
  token: null,
};

// Slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.onboardingComplete = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
    // Rehydrate a previously authenticated session (app startup with a valid token)
    restoreSession: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Register cases
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.onboardingComplete = false; // Require onboarding after registration
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Logout case
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.onboardingComplete = false;
    });

    // Update profile cases
    builder.addCase(updateUserProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Upload avatar cases
    builder.addCase(uploadAvatar.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(uploadAvatar.fulfilled, (state, action) => {
      state.isLoading = false;
      if (state.user) {
        state.user.avatarUrl = action.payload.avatarUrl;
      }
      state.error = null;
    });
    builder.addCase(uploadAvatar.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, updateProfile, setOnboardingComplete, setToken, clearToken, restoreSession } = authSlice.actions;

export default authSlice.reducer;