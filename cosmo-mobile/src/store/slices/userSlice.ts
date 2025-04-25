import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

// Types
interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface FriendshipStatus {
  status: 'friends' | 'pending_sent' | 'pending_received' | 'none';
}

interface UserState {
  profile: {
    data: User | null;
    isLoading: boolean;
    error: string | null;
  };
  friends: {
    data: User[];
    isLoading: boolean;
    error: string | null;
  };
  friendRequests: {
    data: User[];
    isLoading: boolean;
    error: string | null;
  };
  leaderboard: {
    data: {
      userId: string;
      username: string;
      avatarUrl?: string;
      totalPoints: number;
      rank: number;
    }[];
    isLoading: boolean;
    error: string | null;
  };
}

// Async thunks
export const fetchUserProfile = createAsyncThunk<User, string>(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile. Please try again.'
      );
    }
  }
);

export const fetchFriends = createAsyncThunk<User[]>(
  'user/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/friends');
      return response.data.friends;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch friends. Please try again.'
      );
    }
  }
);

export const fetchFriendRequests = createAsyncThunk<User[]>(
  'user/fetchFriendRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/friends/requests');
      return response.data.friendRequests;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch friend requests. Please try again.'
      );
    }
  }
);

export const sendFriendRequest = createAsyncThunk<{ success: boolean }, string>(
  'user/sendFriendRequest',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/friends/request/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send friend request. Please try again.'
      );
    }
  }
);

export const respondToFriendRequest = createAsyncThunk<
  { success: boolean; userId: string },
  { userId: string; accept: boolean }
>(
  'user/respondToFriendRequest',
  async ({ userId, accept }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/friends/request/${userId}/respond`, {
        accept,
      });
      return { ...response.data, userId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to respond to friend request. Please try again.'
      );
    }
  }
);

export const removeFriend = createAsyncThunk<{ success: boolean; userId: string }, string>(
  'user/removeFriend',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/friends/${userId}`);
      return { ...response.data, userId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove friend. Please try again.'
      );
    }
  }
);

export const checkFriendshipStatus = createAsyncThunk<FriendshipStatus, string>(
  'user/checkFriendshipStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/friends/status/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check friendship status. Please try again.'
      );
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'user/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/leaderboard');
      return response.data.leaderboard;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch leaderboard. Please try again.'
      );
    }
  }
);

// Initial state
const initialState: UserState = {
  profile: {
    data: null,
    isLoading: false,
    error: null,
  },
  friends: {
    data: [],
    isLoading: false,
    error: null,
  },
  friendRequests: {
    data: [],
    isLoading: false,
    error: null,
  },
  leaderboard: {
    data: [],
    isLoading: false,
    error: null,
  },
};

// Slice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.profile.error = null;
      state.friends.error = null;
      state.friendRequests.error = null;
      state.leaderboard.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user profile cases
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.profile.isLoading = true;
      state.profile.error = null;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.profile.isLoading = false;
      state.profile.data = action.payload;
      state.profile.error = null;
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.profile.isLoading = false;
      state.profile.error = action.payload as string;
    });

    // Fetch friends cases
    builder.addCase(fetchFriends.pending, (state) => {
      state.friends.isLoading = true;
      state.friends.error = null;
    });
    builder.addCase(fetchFriends.fulfilled, (state, action) => {
      state.friends.isLoading = false;
      state.friends.data = action.payload;
      state.friends.error = null;
    });
    builder.addCase(fetchFriends.rejected, (state, action) => {
      state.friends.isLoading = false;
      state.friends.error = action.payload as string;
    });

    // Fetch friend requests cases
    builder.addCase(fetchFriendRequests.pending, (state) => {
      state.friendRequests.isLoading = true;
      state.friendRequests.error = null;
    });
    builder.addCase(fetchFriendRequests.fulfilled, (state, action) => {
      state.friendRequests.isLoading = false;
      state.friendRequests.data = action.payload;
      state.friendRequests.error = null;
    });
    builder.addCase(fetchFriendRequests.rejected, (state, action) => {
      state.friendRequests.isLoading = false;
      state.friendRequests.error = action.payload as string;
    });

    // Send friend request cases
    builder.addCase(sendFriendRequest.pending, (state) => {
      // We don't need to update any state here
    });
    builder.addCase(sendFriendRequest.fulfilled, (state) => {
      // Friend request sent successfully, but we don't need to update state
      // The friendship status will be fetched separately
    });
    builder.addCase(sendFriendRequest.rejected, (state, action) => {
      state.friends.error = action.payload as string;
    });

    // Respond to friend request cases
    builder.addCase(respondToFriendRequest.fulfilled, (state, action) => {
      if (action.payload.success && action.meta.arg.accept) {
        // If accepted, remove from friend requests
        state.friendRequests.data = state.friendRequests.data.filter(
          (request) => request.id !== action.payload.userId
        );
        // We would typically fetch the updated friends list here,
        // but for optimistic UI updates we could add the user to friends array
      } else {
        // If declined, just remove from friend requests
        state.friendRequests.data = state.friendRequests.data.filter(
          (request) => request.id !== action.payload.userId
        );
      }
    });

    // Remove friend cases
    builder.addCase(removeFriend.fulfilled, (state, action) => {
      if (action.payload.success) {
        // Remove friend from friends list
        state.friends.data = state.friends.data.filter(
          (friend) => friend.id !== action.payload.userId
        );
      }
    });

    // Fetch leaderboard cases
    builder.addCase(fetchLeaderboard.pending, (state) => {
      state.leaderboard.isLoading = true;
      state.leaderboard.error = null;
    });
    builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
      state.leaderboard.isLoading = false;
      state.leaderboard.data = action.payload;
      state.leaderboard.error = null;
    });
    builder.addCase(fetchLeaderboard.rejected, (state, action) => {
      state.leaderboard.isLoading = false;
      state.leaderboard.error = action.payload as string;
    });
  },
});

export const { clearUserError } = userSlice.actions;

export default userSlice.reducer;