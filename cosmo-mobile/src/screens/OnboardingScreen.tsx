import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  Image, 
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootState } from '../store';
import { RootStackParamList } from '../../App';
import { updateUserProfile, uploadAvatar } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  const { completeOnboarding } = useAuth();
  
  const [username, setUsername] = useState<string>(user?.username || '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatarUrl || null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [usernameError, setUsernameError] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera roll permissions to upload an avatar!'
          );
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        console.log('Selected image:', result.assets[0]);
        
        // Get file extension from URI
        const uri = result.assets[0].uri;
        const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        
        setAvatar(uri);
        setImageFile({
          uri: uri,
          type: mimeType,
          name: `avatar.${fileExtension}`,
        });
        
        console.log('Image file prepared:', {
          uri: uri,
          type: mimeType,
          name: `avatar.${fileExtension}`,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate username
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      isValid = false;
    } else {
      setUsernameError('');
    }

    return isValid;
  };

  const handleSubmit = async () => {
    setFormSubmitted(true);
    
    if (!validateForm()) {
      return;
    }

    try {
      try {
        // First upload avatar if exists
        if (imageFile) {
          const formData = new FormData();
          // Make sure we're using the correct field name expected by the backend
          formData.append('avatar', imageFile);
          
          console.log('About to upload avatar');
          const uploadResult = await dispatch(uploadAvatar(formData)).unwrap();
          console.log('Avatar upload successful:', uploadResult);
          
          // Update profile with username and avatar URL
          await dispatch(updateUserProfile({ 
            username,
            avatarUrl: uploadResult.avatarUrl
          })).unwrap();
        } else {
          // Just update the username if no avatar selected
          await dispatch(updateUserProfile({ username })).unwrap();
        }
      } catch (error) {
        console.error('Profile update error:', error);
        throw error; // Re-throw to trigger the outer catch block
      }
      
      console.log('Profile updated successfully, completing onboarding');
      
      // Update the Redux state to mark onboarding as complete
      completeOnboarding();
      
      console.log('Onboarding marked as complete, navigating to Feed screen');
      
      // Navigate to Feed screen instead of Home
      navigation.replace('Feed');
    } catch (err) {
      console.error('Final submission error:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Complete Your Profile</Text>
            <Text style={styles.headerSubtitle}>Set up your profile to get started</Text>
          </View>
          
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarButton}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.avatarHelperText}>Tap to choose an avatar</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[
                styles.input,
                formSubmitted && usernameError ? styles.inputError : null
              ]}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            {formSubmitted && usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loadingText}>Updating profile...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Complete Profile</Text>
            </TouchableOpacity>
          )}
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#e1e4e8',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#666',
    fontSize: 14,
  },
  avatarHelperText: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f4f4f4',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3498db',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default OnboardingScreen;