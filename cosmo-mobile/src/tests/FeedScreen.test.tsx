import React from 'react';
import FeedScreen from '../screens/FeedScreen';
import {
  renderWithProviders,
  createMockNavigation,
  createMockRoute,
} from './testUtils';

// Mock dependencies
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

// Keep the fetchFeed effect from making real network requests
jest.mock('../api/photoApi', () => ({
  photoApi: {
    getFeed: jest.fn(() => Promise.resolve({ photos: [] })),
  },
}));

const screenProps = {
  navigation: createMockNavigation(),
  route: createMockRoute('Feed'),
};

describe('FeedScreen Component', () => {
  test('renders loading state correctly', async () => {
    const { toJSON } = await renderWithProviders(<FeedScreen {...screenProps} />, {
      auth: {
        user: { id: 'test-id', email: 'test@example.com', username: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' },
        isAuthenticated: true,
      },
      feed: {
        photos: [],
        isLoading: true,
        refreshing: false,
        error: null,
      },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders error state correctly', async () => {
    const { toJSON } = await renderWithProviders(<FeedScreen {...screenProps} />, {
      auth: {
        user: { id: 'test-id', email: 'test@example.com', username: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' },
        isAuthenticated: true,
      },
      feed: {
        photos: [],
        isLoading: false,
        refreshing: false,
        error: 'Failed to load feed',
      },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders empty state correctly', async () => {
    const { toJSON } = await renderWithProviders(<FeedScreen {...screenProps} />, {
      auth: {
        user: { id: 'test-id', email: 'test@example.com', username: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' },
        isAuthenticated: true,
      },
      feed: {
        photos: [],
        isLoading: false,
        refreshing: false,
        error: null,
      },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders photos correctly', async () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        s3_url: 'https://example.com/photo1.jpg',
        user: {
          id: 'user-1',
          username: 'photouser1',
          avatar_url: 'https://example.com/avatar1.jpg',
        },
        created_at: '2023-01-01T12:00:00Z',
      },
      {
        id: 'photo-2',
        s3_url: 'https://example.com/photo2.jpg',
        user: {
          id: 'user-2',
          username: 'photouser2',
          avatar_url: 'https://example.com/avatar2.jpg',
        },
        created_at: '2023-01-02T12:00:00Z',
      },
    ] as any;

    const { toJSON } = await renderWithProviders(<FeedScreen {...screenProps} />, {
      auth: {
        user: { id: 'test-id', email: 'test@example.com', username: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' },
        isAuthenticated: true,
      },
      feed: {
        photos: mockPhotos,
        isLoading: false,
        refreshing: false,
        error: null,
      },
    });

    expect(toJSON()).toMatchSnapshot();
  });
});
