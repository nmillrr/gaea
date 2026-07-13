import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import feedReducer from './slices/feedSlice';
import captureReducer from './slices/captureSlice';
import photosReducer from './slices/photosSlice';
import guessesReducer from './slices/guessesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    capture: captureReducer,
    photos: photosReducer,
    guesses: guessesReducer,
    user: userReducer,
  },
  // Add middleware for serializable check
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in file uploads
        ignoredActions: ['photos/uploadPhoto'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
