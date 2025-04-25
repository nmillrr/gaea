import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { photoApi, Photo, UploadPhotoResponse } from '../../api/photoApi';

// Types
interface PhotosState {
  userPhotos: {
    data: Photo[];
    isLoading: boolean;
    error: string | null;
  };
  photoDetails: {
    data: Record<string, Photo>;
    isLoading: boolean;
    error: string | null;
  };
  uploadStatus: {
    isUploading: boolean;
    progress: number;
    error: string | null;
    lastUploadedPhoto: UploadPhotoResponse | null;
  };
  uploadLimit: {
    canUpload: boolean;
    nextUploadTime: string | null;
    isChecking: boolean;
    error: string | null;
  };
}

// Async thunks
export const fetchUserPhotos = createAsyncThunk(
  'photos/fetchUserPhotos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await photoApi.getUserPhotos();
      return response.photos;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load your photos. Please try again.'
      );
    }
  }
);

export const fetchPhotoDetails = createAsyncThunk(
  'photos/fetchPhotoDetails',
  async (photoId: string, { rejectWithValue }) => {
    try {
      const response = await photoApi.getPhoto(photoId);
      return response.photo;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load photo details. Please try again.'
      );
    }
  }
);

export const uploadPhoto = createAsyncThunk(
  'photos/uploadPhoto',
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

export const checkUploadAllowed = createAsyncThunk(
  'photos/checkUploadAllowed',
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

// Initial state
const initialState: PhotosState = {
  userPhotos: {
    data: [],
    isLoading: false,
    error: null,
  },
  photoDetails: {
    data: {},
    isLoading: false,
    error: null,
  },
  uploadStatus: {
    isUploading: false,
    progress: 0,
    error: null,
    lastUploadedPhoto: null,
  },
  uploadLimit: {
    canUpload: true,
    nextUploadTime: null,
    isChecking: false,
    error: null,
  },
};

// Slice
export const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    clearPhotosError: (state) => {
      state.userPhotos.error = null;
      state.photoDetails.error = null;
      state.uploadStatus.error = null;
      state.uploadLimit.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadStatus.progress = action.payload;
    },
    resetUploadStatus: (state) => {
      state.uploadStatus.isUploading = false;
      state.uploadStatus.progress = 0;
      state.uploadStatus.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user photos cases
    builder.addCase(fetchUserPhotos.pending, (state) => {
      state.userPhotos.isLoading = true;
      state.userPhotos.error = null;
    });
    builder.addCase(fetchUserPhotos.fulfilled, (state, action) => {
      state.userPhotos.isLoading = false;
      state.userPhotos.data = action.payload;
      state.userPhotos.error = null;
    });
    builder.addCase(fetchUserPhotos.rejected, (state, action) => {
      state.userPhotos.isLoading = false;
      state.userPhotos.error = action.payload as string;
    });
    
    // Fetch photo details cases
    builder.addCase(fetchPhotoDetails.pending, (state) => {
      state.photoDetails.isLoading = true;
      state.photoDetails.error = null;
    });
    builder.addCase(fetchPhotoDetails.fulfilled, (state, action) => {
      state.photoDetails.isLoading = false;
      state.photoDetails.data = {
        ...state.photoDetails.data,
        [action.payload.id]: action.payload,
      };
      state.photoDetails.error = null;
    });
    builder.addCase(fetchPhotoDetails.rejected, (state, action) => {
      state.photoDetails.isLoading = false;
      state.photoDetails.error = action.payload as string;
    });
    
    // Upload photo cases
    builder.addCase(uploadPhoto.pending, (state) => {
      state.uploadStatus.isUploading = true;
      state.uploadStatus.progress = 0;
      state.uploadStatus.error = null;
    });
    builder.addCase(uploadPhoto.fulfilled, (state, action) => {
      state.uploadStatus.isUploading = false;
      state.uploadStatus.progress = 100;
      state.uploadStatus.lastUploadedPhoto = action.payload;
      state.uploadStatus.error = null;
      state.uploadLimit.canUpload = false;
    });
    builder.addCase(uploadPhoto.rejected, (state, action) => {
      state.uploadStatus.isUploading = false;
      state.uploadStatus.error = action.payload as string;
    });
    
    // Check upload allowed cases
    builder.addCase(checkUploadAllowed.pending, (state) => {
      state.uploadLimit.isChecking = true;
      state.uploadLimit.error = null;
    });
    builder.addCase(checkUploadAllowed.fulfilled, (state, action) => {
      state.uploadLimit.isChecking = false;
      state.uploadLimit.canUpload = action.payload.canUpload;
      state.uploadLimit.nextUploadTime = action.payload.nextUploadTime || null;
      state.uploadLimit.error = null;
    });
    builder.addCase(checkUploadAllowed.rejected, (state, action) => {
      state.uploadLimit.isChecking = false;
      state.uploadLimit.error = action.payload as string;
    });
  },
});

export const { clearPhotosError, setUploadProgress, resetUploadStatus } = photosSlice.actions;

export default photosSlice.reducer;