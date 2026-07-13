import React from 'react';
import GuessScreen from '../screens/GuessScreen';
import {
  renderWithProviders,
  createMockNavigation,
  createMockRoute,
  PreloadedSlices,
} from './testUtils';

// Mock dependencies
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: { photoId: 'test-photo-id' },
    }),
  };
});

// Mock react-native-maps
jest.mock('react-native-maps', () => 'MapView');
jest.mock('react-native-maps-directions', () => 'MapViewDirections');
jest.mock('react-native-snap-carousel', () => 'Carousel');

const screenProps = {
  navigation: createMockNavigation(),
  route: createMockRoute('Guess', { photoId: 'test-photo-id' }),
};

const authState = {
  user: { id: 'test-id', email: 'test@example.com', username: 'testuser' },
  isAuthenticated: true,
};

const photoDetails = {
  data: {
    'test-photo-id': {
      id: 'test-photo-id',
      s3_url: 'https://example.com/photo.jpg',
      user: {
        id: 'user-1',
        username: 'photouser',
        avatar_url: 'https://example.com/avatar.jpg',
      },
      created_at: '2023-01-01T12:00:00Z',
    },
  },
  isLoading: false,
  error: null,
} as any;

const guessesState = (overrides: object = {}): PreloadedSlices['guesses'] =>
  ({
    currentGuess: {
      photoId: 'test-photo-id',
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
    ...overrides,
  } as any);

describe('GuessScreen Component', () => {
  test('renders loading state correctly', async () => {
    const { toJSON } = await renderWithProviders(<GuessScreen {...screenProps} />, {
      auth: authState,
      guesses: guessesState(),
      photos: {
        photoDetails: { data: {}, isLoading: true, error: null },
      },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders map selection state correctly', async () => {
    const { toJSON } = await renderWithProviders(<GuessScreen {...screenProps} />, {
      auth: authState,
      guesses: guessesState(),
      photos: { photoDetails },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders guess location selected state correctly', async () => {
    const { toJSON } = await renderWithProviders(<GuessScreen {...screenProps} />, {
      auth: authState,
      guesses: guessesState({
        currentGuess: {
          photoId: 'test-photo-id',
          guessLocation: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          isSubmitting: false,
          error: null,
        },
      }),
      photos: { photoDetails },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders submitting guess state correctly', async () => {
    const { toJSON } = await renderWithProviders(<GuessScreen {...screenProps} />, {
      auth: authState,
      guesses: guessesState({
        currentGuess: {
          photoId: 'test-photo-id',
          guessLocation: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          isSubmitting: true,
          error: null,
        },
        results: { data: {}, isLoading: true, error: null },
      }),
      photos: { photoDetails },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders results state correctly', async () => {
    const guessResult = {
      points: 3500,
      distance_m: 3000,
      actual_lat: 40.7128,
      actual_lng: -74.006,
      guess_lat: 40.75,
      guess_lng: -74.0,
      leaderboard: [
        {
          user_id: 'test-id',
          username: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg',
          points: 3500,
          position: 1,
        },
      ],
    };

    const { toJSON } = await renderWithProviders(<GuessScreen {...screenProps} />, {
      auth: authState,
      guesses: guessesState({
        currentGuess: {
          photoId: 'test-photo-id',
          guessLocation: {
            latitude: 40.75,
            longitude: -74.0,
          },
          isSubmitting: false,
          error: null,
        },
        results: {
          data: { 'test-photo-id': guessResult },
          isLoading: false,
          error: null,
        },
      }),
      photos: { photoDetails },
    });

    expect(toJSON()).toMatchSnapshot();
  });
});
