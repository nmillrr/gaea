import React from 'react';
import CaptureScreen from '../screens/CaptureScreen';
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
      goBack: jest.fn(),
    }),
  };
});

// Mock expo-camera and expo-location
jest.mock('expo-camera', () => ({
  Camera: 'Camera',
  CameraView: 'CameraView',
  CameraType: {
    back: 'back',
    front: 'front',
  },
  FlashMode: {
    off: 'off',
    on: 'on',
  },
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    })
  ),
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

const screenProps = {
  navigation: createMockNavigation(),
  route: createMockRoute('Capture'),
};

const authState = {
  user: { id: 'test-id', email: 'test@example.com', username: 'testuser' },
  isAuthenticated: true,
};

describe('CaptureScreen Component', () => {
  test('renders loading state correctly', async () => {
    const { toJSON } = await renderWithProviders(<CaptureScreen {...screenProps} />, {
      auth: authState,
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
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders camera view correctly', async () => {
    const { toJSON } = await renderWithProviders(<CaptureScreen {...screenProps} />, {
      auth: authState,
      capture: {
        photoUri: null,
        location: { coords: { latitude: 37.7749, longitude: -122.4194 } } as any,
        caption: '',
        canUpload: true,
        nextUploadTime: null,
        isUploading: false,
        isCheckingUpload: false,
        uploadSuccess: false,
        error: null,
      },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders preview state correctly', async () => {
    const { toJSON } = await renderWithProviders(<CaptureScreen {...screenProps} />, {
      auth: authState,
      capture: {
        photoUri: 'file:///mock/photo.jpg',
        location: { coords: { latitude: 37.7749, longitude: -122.4194 } } as any,
        caption: '',
        canUpload: true,
        nextUploadTime: null,
        isUploading: false,
        isCheckingUpload: false,
        uploadSuccess: false,
        error: null,
      },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders uploading state correctly', async () => {
    const { toJSON } = await renderWithProviders(<CaptureScreen {...screenProps} />, {
      auth: authState,
      capture: {
        photoUri: 'file:///mock/photo.jpg',
        location: { coords: { latitude: 37.7749, longitude: -122.4194 } } as any,
        caption: 'Test caption',
        canUpload: true,
        nextUploadTime: null,
        isUploading: true,
        isCheckingUpload: false,
        uploadSuccess: false,
        error: null,
      },
    });

    expect(toJSON()).toMatchSnapshot();
  });

  test('renders error state correctly', async () => {
    const { toJSON } = await renderWithProviders(<CaptureScreen {...screenProps} />, {
      auth: authState,
      capture: {
        photoUri: 'file:///mock/photo.jpg',
        location: { coords: { latitude: 37.7749, longitude: -122.4194 } } as any,
        caption: 'Test caption',
        canUpload: true,
        nextUploadTime: null,
        isUploading: false,
        isCheckingUpload: false,
        uploadSuccess: false,
        error: 'Failed to upload photo',
      },
    });

    expect(toJSON()).toMatchSnapshot();
  });
});
