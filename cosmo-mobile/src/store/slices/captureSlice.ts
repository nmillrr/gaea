import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { photoApi } from '../../api/photoApi';

// Types
interface CaptureState {
  photoUri: string | null;
  location: Location.LocationObject | null;
  caption: string;
  canUpload: boolean;
  nextUploadTime: string | null;
  isUploading: boolean;
  isCheckingUpload: boolean;
  uploadSuccess: boolean;
  error: string | null;
}

// Async thunks
export const checkUploadAllowed = createAsyncThunk(
  'capture/checkUploadAllowed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await photoApi.checkUploadAllowed();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check upload status. Please try again.'
      );
    }
  }
);

export const uploadPhoto = createAsyncThunk(
  'capture/uploadPhoto',
  async (
    {
      photoUri,
      location,
      caption
    }: {
      photoUri: string;
      location: { latitude: number; longitude: number };
      caption?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await photoApi.uploadPhoto(photoUri, location, caption);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to upload photo. Please try again.'
      );
    }
  }
);

// Initial state
const initialState: CaptureState = {
  photoUri: null,
  location: null,
  caption: '',
  canUpload: true,
  nextUploadTime: null,
  isUploading: false,
  isCheckingUpload: false,
  uploadSuccess: false,
  error: null,
};

// Slice
export const captureSlice = createSlice({
  name: 'capture',
  initialState,
  reducers: {
    setPhotoUri: (state, action) => {
      state.photoUri = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setCaption: (state, action) => {
      state.caption = action.payload;
    },
    clearCapture: (state) => {
      state.photoUri = null;
      state.location = null;
      state.caption = '';
      state.uploadSuccess = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check upload allowed cases
    builder.addCase(checkUploadAllowed.pending, (state) => {
      state.isCheckingUpload = true;
      state.error = null;
    });
    builder.addCase(checkUploadAllowed.fulfilled, (state, action) => {
      state.isCheckingUpload = false;
      state.canUpload = action.payload.canUpload;
      state.nextUploadTime = action.payload.nextUploadTime || null;
      state.error = null;
    });
    builder.addCase(checkUploadAllowed.rejected, (state, action) => {
      state.isCheckingUpload = false;
      state.error = action.payload as string;
    });
    
    // Upload photo cases
    builder.addCase(uploadPhoto.pending, (state) => {
      state.isUploading = true;
      state.error = null;
    });
    builder.addCase(uploadPhoto.fulfilled, (state) => {
      state.isUploading = false;
      state.uploadSuccess = true;
      state.canUpload = false;
      state.error = null;
    });
    builder.addCase(uploadPhoto.rejected, (state, action) => {
      state.isUploading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setPhotoUri, setLocation, setCaption, clearCapture, clearError } = captureSlice.actions;

export default captureSlice.reducer;