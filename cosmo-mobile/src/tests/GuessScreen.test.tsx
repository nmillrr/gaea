import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { NavigationContainer } from '@react-navigation/native';
import GuessScreen from '../screens/GuessScreen';

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

// Create mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('GuessScreen Component', () => {
  test('renders loading state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      guesses: {
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
      },
      photos: {
        photoDetails: {
          data: {},
          isLoading: true,
          error: null,
        },
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <GuessScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders map selection state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      guesses: {
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
      },
      photos: {
        photoDetails: {
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
        },
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <GuessScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders guess location selected state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      guesses: {
        currentGuess: {
          photoId: 'test-photo-id',
          guessLocation: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          isSubmitting: false,
          error: null,
        },
        results: {
          data: {},
          isLoading: false,
          error: null,
        },
      },
      photos: {
        photoDetails: {
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
        },
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <GuessScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders submitting guess state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      guesses: {
        currentGuess: {
          photoId: 'test-photo-id',
          guessLocation: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          isSubmitting: true,
          error: null,
        },
        results: {
          data: {},
          isLoading: true,
          error: null,
        },
      },
      photos: {
        photoDetails: {
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
        },
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <GuessScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders results state correctly', () => {
    const guessResult = {
      points: 3500,
      distance_m: 3000,
      actual_lat: 40.7128,
      actual_lng: -74.0060,
      guess_lat: 40.7500,
      guess_lng: -74.0000,
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
    
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      guesses: {
        currentGuess: {
          photoId: 'test-photo-id',
          guessLocation: {
            latitude: 40.7500,
            longitude: -74.0000,
          },
          isSubmitting: false,
          error: null,
        },
        results: {
          data: {
            'test-photo-id': guessResult,
          },
          isLoading: false,
          error: null,
        },
      },
      photos: {
        photoDetails: {
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
        },
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <GuessScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
});