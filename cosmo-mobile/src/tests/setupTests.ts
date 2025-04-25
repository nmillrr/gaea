import '@testing-library/jest-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock secure storage
jest.mock('../utils/secureStorage', () => ({
  saveToken: jest.fn(() => Promise.resolve()),
  getToken: jest.fn(() => Promise.resolve('mock-token')),
  removeToken: jest.fn(() => Promise.resolve()),
  saveRefreshToken: jest.fn(() => Promise.resolve()),
  getRefreshToken: jest.fn(() => Promise.resolve('mock-refresh-token')),
  isTokenExpired: jest.fn(() => Promise.resolve(false)),
}));

// Mock expo-location
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

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: 'Camera',
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

// Mock react-native-maps
jest.mock('react-native-maps', () => 'MapView');
jest.mock('react-native-maps-directions', () => 'MapViewDirections');

// Mock navigation
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

// Silence the warning https://github.com/facebook/react-native/issues/11094#issuecomment-263240420
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Use fake timers
jest.useFakeTimers();

// Global teardown
afterAll(() => {
  jest.useRealTimers();
});