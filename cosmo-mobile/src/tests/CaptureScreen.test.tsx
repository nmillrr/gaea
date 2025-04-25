import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { NavigationContainer } from '@react-navigation/native';
import CaptureScreen from '../screens/CaptureScreen';

// Mock dependencies
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

// Mock expo-camera and expo-location
jest.mock('expo-camera', () => ({
  Camera: () => 'Camera',
  CameraType: {
    back: 'back',
    front: 'front',
  },
  FlashMode: {
    off: 'off',
    on: 'on',
  },
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(() => 
    Promise.resolve({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      }
    })
  ),
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

// Create mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('CaptureScreen Component', () => {
  test('renders loading state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      capture: {
        photoUri: null,
        location: null,
        caption: '',
        canUpload: true,
        nextUploadTime: null,
        isUploading: false,
        isCheckingUpload: true,
        uploadSuccess: false,
        error: null,
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <CaptureScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders camera view correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      capture: {
        photoUri: null,
        location: { coords: { latitude: 37.7749, longitude: -122.4194 } },
        caption: '',
        canUpload: true,
        nextUploadTime: null,
        isUploading: false,
        isCheckingUpload: false,
        uploadSuccess: false,
        error: null,
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <CaptureScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders preview state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      capture: {
        photoUri: 'file:///mock/photo.jpg',
        location: { coords: { latitude: 37.7749, longitude: -122.4194 } },
        caption: '',
        canUpload: true,
        nextUploadTime: null,
        isUploading: false,
        isCheckingUpload: false,
        uploadSuccess: false,
        error: null,
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <CaptureScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders uploading state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      capture: {
        photoUri: 'file:///mock/photo.jpg',
        location: { coords: { latitude: 37.7749, longitude: -122.4194 } },
        caption: 'Test caption',
        canUpload: true,
        nextUploadTime: null,
        isUploading: true,
        isCheckingUpload: false,
        uploadSuccess: false,
        progress: 50,
        error: null,
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <CaptureScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
  
  test('renders error state correctly', () => {
    const initialState = {
      auth: {
        user: { id: 'test-id', username: 'testuser' },
        isAuthenticated: true,
      },
      capture: {
        photoUri: 'file:///mock/photo.jpg',
        location: { coords: { latitude: 37.7749, longitude: -122.4194 } },
        caption: 'Test caption',
        canUpload: true,
        nextUploadTime: null,
        isUploading: false,
        isCheckingUpload: false,
        uploadSuccess: false,
        error: 'Failed to upload photo',
      },
    };
    
    const store = mockStore(initialState);
    
    const { toJSON } = render(
      <Provider store={store}>
        <NavigationContainer>
          <CaptureScreen />
        </NavigationContainer>
      </Provider>
    );
    
    // Snapshot testing
    expect(toJSON()).toMatchSnapshot();
  });
});