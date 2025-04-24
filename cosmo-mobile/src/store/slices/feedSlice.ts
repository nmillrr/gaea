import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { photoApi, Photo } from '../../api/photoApi';

// Types
interface FeedState {
  photos: Photo[];
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
}

// Async thunks
export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await photoApi.getFeed();
      return response.photos;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load feed. Please try again.'
      );
    }
  }
);

export const refreshFeed = createAsyncThunk(
  'feed/refreshFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await photoApi.getFeed();
      return response.photos;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to refresh feed. Please try again.'
      );
    }
  }
);

// Initial state
const initialState: FeedState = {
  photos: [],
  isLoading: false,
  error: null,
  refreshing: false,
};

// Slice
export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearFeedError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch feed cases
    builder.addCase(fetchFeed.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchFeed.fulfilled, (state, action) => {
      state.isLoading = false;
      state.photos = action.payload;
      state.error = null;
    });
    builder.addCase(fetchFeed.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Refresh feed cases
    builder.addCase(refreshFeed.pending, (state) => {
      state.refreshing = true;
      state.error = null;
    });
    builder.addCase(refreshFeed.fulfilled, (state, action) => {
      state.refreshing = false;
      state.photos = action.payload;
      state.error = null;
    });
    builder.addCase(refreshFeed.rejected, (state, action) => {
      state.refreshing = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearFeedError } = feedSlice.actions;

export default feedSlice.reducer;