import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { photoApi, GuessResult } from '../../api/photoApi';

// Types
interface GuessesState {
  currentGuess: {
    photoId: string | null;
    guessLocation: {
      latitude: number | null;
      longitude: number | null;
    };
    isSubmitting: boolean;
    error: string | null;
  };
  results: {
    data: Record<string, GuessResult>;
    isLoading: boolean;
    error: string | null;
  };
}

// Async thunks
export const submitGuess = createAsyncThunk<
  { result: GuessResult; photoId: string },
  { photoId: string; location: { latitude: number; longitude: number } }
>(
  'guesses/submitGuess',
  async ({ photoId, location }, { rejectWithValue }) => {
    try {
      const result = await photoApi.submitGuess(photoId, {
        guess_lat: location.latitude,
        guess_lng: location.longitude,
      });
      return { result, photoId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit guess. Please try again.'
      );
    }
  }
);

// Initial state
const initialState: GuessesState = {
  currentGuess: {
    photoId: null,
    guessLocation: {
      latitude: null,
      longitude: null,
    },
    isSubmitting: false,
    error: null,
  },
  results: {
    data: {},
    isLoading: false,
    error: null,
  },
};

// Slice
export const guessesSlice = createSlice({
  name: 'guesses',
  initialState,
  reducers: {
    setCurrentPhotoForGuess: (state, action) => {
      state.currentGuess.photoId = action.payload;
      // Reset guess location when changing photo
      state.currentGuess.guessLocation = {
        latitude: null,
        longitude: null,
      };
    },
    setGuessLocation: (state, action) => {
      state.currentGuess.guessLocation = action.payload;
    },
    resetCurrentGuess: (state) => {
      state.currentGuess = initialState.currentGuess;
    },
    clearGuessesError: (state) => {
      state.currentGuess.error = null;
      state.results.error = null;
    },
  },
  extraReducers: (builder) => {
    // Submit guess cases
    builder.addCase(submitGuess.pending, (state) => {
      state.currentGuess.isSubmitting = true;
      state.currentGuess.error = null;
      state.results.isLoading = true;
      state.results.error = null;
    });
    builder.addCase(submitGuess.fulfilled, (state, action) => {
      state.currentGuess.isSubmitting = false;
      state.results.isLoading = false;
      state.results.data[action.payload.photoId] = action.payload.result;
      state.results.error = null;
    });
    builder.addCase(submitGuess.rejected, (state, action) => {
      state.currentGuess.isSubmitting = false;
      state.results.isLoading = false;
      state.results.error = action.payload as string;
    });
  },
});

export const {
  setCurrentPhotoForGuess,
  setGuessLocation,
  resetCurrentGuess,
  clearGuessesError,
} = guessesSlice.actions;

export default guessesSlice.reducer;