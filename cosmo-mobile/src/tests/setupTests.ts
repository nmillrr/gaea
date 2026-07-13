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

// Mock icon fonts — the real components drag huge glyph maps into snapshots
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => 'MapView');
jest.mock('react-native-maps-directions', () => 'MapViewDirections');

// Provide safe-area insets without needing a real SafeAreaProvider
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

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

