import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { NavigationContainer } from '@react-navigation/native';
import FeedScreen from '../screens/FeedScreen';

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

// Create mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('FeedScreen Component', () => {
  test('renders loading state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' },
        isAuthenticated: true,
      },
      feed: {
        photos: [],
        isLoading: true,
        refreshing: false,
        error: null,
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <FeedScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders error state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' },
        isAuthenticated: true,
      },
      feed: {
        photos: [],
        isLoading: false,
        refreshing: false,
        error: 'Failed to load feed',
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <FeedScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders empty state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' },
        isAuthenticated: true,
      },
      feed: {
        photos: [],
        isLoading: false,
        refreshing: false,
        error: null,
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <FeedScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders photos correctly', () => {
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
    ];
    
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' },
        isAuthenticated: true,
      },
      feed: {
        photos: mockPhotos,
        isLoading: false,
        refreshing: false,
        error: null,
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <FeedScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
});