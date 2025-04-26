import React from 'react';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from './src/store';
import { useAuth } from './src/hooks/useAuth';
import { RootState } from './src/store';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import FeedScreen from './src/screens/FeedScreen';
import CaptureScreen from './src/screens/CaptureScreen';
import GuessScreen from './src/screens/GuessScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PhotoDetailScreen from './src/screens/PhotoDetailScreen';

// Define the type for the stack navigator parameters
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Home: undefined;
  Feed: undefined;
  Capture: undefined;
  Guess: { photoId: string };
  Profile: { userId?: string };
  PhotoDetail: { photoId: string };
};

// Create stack navigators for authenticated and unauthenticated flows
const AuthStack = createNativeStackNavigator<RootStackParamList>();
const MainStack = createNativeStackNavigator<RootStackParamList>();

// Loading screen shown during initialization
const LoadingScreen = () => (
  <View style={styles.centeredContainer}>
    <ActivityIndicator size="large" color="#5E60CE" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Main navigation component that handles conditional rendering based on auth state
const AppNavigator = () => {
  const { initializing, isAuthenticated, onboardingComplete } = useAuth();
  
  // Show loading screen during initialization
  if (initializing) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        // Auth Stack - shown when user is not authenticated
        <AuthStack.Navigator
          screenOptions={{
            headerShown: false,
            animationTypeForReplace: isAuthenticated ? 'push' : 'pop',
          }}
        >
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      ) : !onboardingComplete ? (
        // Onboarding - shown after authentication but before onboarding is complete
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
          <MainStack.Screen name="Onboarding" component={OnboardingScreen} />
        </MainStack.Navigator>
      ) : (
        // Main App - shown after authentication and onboarding
        <MainStack.Navigator
          initialRouteName="Feed" // Changed from Home to Feed
          screenOptions={{
            headerShown: false,
          }}
        >
          <MainStack.Screen name="Feed" component={FeedScreen} />
          <MainStack.Screen name="Capture" component={CaptureScreen} />
          <MainStack.Screen name="Guess" component={GuessScreen} />
          <MainStack.Screen name="Profile" component={ProfileScreen} />
          <MainStack.Screen name="PhotoDetail" component={PhotoDetailScreen} />
        </MainStack.Navigator>
      )}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

// Component that wraps the whole app
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#5E60CE',
  },
});
