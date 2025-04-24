import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from './src/store';
import { useAuth } from './src/hooks/useAuth';

// Component that uses the auth hook to restore auth state
const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  useAuth();
  return <>{children}</>;
};
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
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
  Capture: undefined;
  Guess: { photoId: string };
  Profile: { userId?: string };
  PhotoDetail: { photoId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator 
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Capture" component={CaptureScreen} />
              <Stack.Screen name="Guess" component={GuessScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="PhotoDetail" component={PhotoDetailScreen} />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </Provider>
  );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
