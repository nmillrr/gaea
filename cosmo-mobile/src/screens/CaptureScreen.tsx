import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';

import { RootStackParamList } from '../../App';
import { RootState, AppDispatch } from '../store';
import { 
  setPhotoUri, 
  setLocation, 
  setCaption, 
  clearCapture, 
  uploadPhoto, 
  checkUploadAllowed
} from '../store/slices/captureSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Capture'>;

const CaptureScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    photoUri, 
    location, 
    caption, 
    canUpload, 
    nextUploadTime, 
    isUploading, 
    isCheckingUpload, 
    uploadSuccess, 
    error 
  } = useSelector((state: RootState) => state.capture);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [stage, setStage] = useState<'camera' | 'preview' | 'caption'>('camera');
  const cameraRef = useRef<Camera | null>(null);

  // Check if user can upload when component mounts
  useEffect(() => {
    dispatch(checkUploadAllowed());
  }, [dispatch]);

  // Request permissions and set up camera
  useEffect(() => {
    (async () => {
      // Request camera permissions
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      
      // Request media library permissions
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      // Request location permissions
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      
      setHasPermission(
        cameraStatus.status === 'granted' && 
        galleryStatus.status === 'granted' &&
        locationStatus.status === 'granted'
      );
      
      // Get location
      if (locationStatus.status === 'granted') {
        getCurrentLocation();
      }
    })();

    // Clean up on unmount
    return () => {
      dispatch(clearCapture());
    };
  }, [dispatch]);

  // Navigate to Feed if upload is successful
  useEffect(() => {
    if (uploadSuccess) {
      navigation.navigate('Feed');
    }
  }, [uploadSuccess, navigation]);

  // Display error message if upload fails
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      dispatch(setLocation(currentLocation));
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please ensure location services are enabled.'
      );
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        dispatch(setPhotoUri(photo.uri));
        setStage('preview');
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      dispatch(setPhotoUri(result.assets[0].uri));
      setStage('preview');
    }
  };

  const handleCaptionChange = (text: string) => {
    dispatch(setCaption(text));
  };

  const handleContinueToCaption = () => {
    if (!photoUri || !location) {
      Alert.alert('Error', 'Image or location data is missing');
      return;
    }
    setStage('caption');
  };

  const handleSubmit = () => {
    if (!photoUri || !location) {
      Alert.alert('Error', 'Image or location data is missing');
      return;
    }

    dispatch(uploadPhoto({
      photoUri,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      },
      caption: caption.trim() || undefined
    }));
  };

  const retake = () => {
    dispatch(setPhotoUri(null));
    setStage('camera');
  };

  // Render loading state while checking if user can upload
  if (isCheckingUpload) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.text}>Checking upload status...</Text>
      </View>
    );
  }

  // Render message if user cannot upload
  if (!canUpload && nextUploadTime) {
    const nextUploadDate = new Date(nextUploadTime);
    const formattedTime = format(nextUploadDate, 'MMM dd, yyyy h:mm a');
    
    return (
      <View style={[styles.container, { backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={styles.limitTitle}>Daily Upload Limit Reached</Text>
        <Text style={styles.limitText}>
          You can only upload one photo per day. You can upload again at:
        </Text>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <TouchableOpacity
          style={[styles.button, { marginTop: 30 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render permission loading state
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.text}>Requesting permissions...</Text>
      </View>
    );
  }

  // Render permission denied state
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Camera, gallery, or location permissions are required to use this feature.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render caption input screen
  if (stage === 'caption') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.captionContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setStage('preview')}>
                <Text style={styles.backButton}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>New Post</Text>
              <View style={{ width: 40 }} />
            </View>
            
            <View style={styles.imageRow}>
              {photoUri && (
                <Image source={{ uri: photoUri }} style={styles.thumbnailImage} />
              )}
              <TextInput
                style={styles.captionInput}
                placeholder="Write a caption..."
                value={caption}
                onChangeText={handleCaptionChange}
                multiline
                maxLength={200}
              />
            </View>
            
            <View style={styles.locationDisplay}>
              {location && (
                <Text style={styles.locationDisplayText}>
                  Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                </Text>
              )}
            </View>
            
            <View style={styles.captionActions}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton, isUploading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Share</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Render preview screen
  if (stage === 'preview' && photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.preview}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          
          <View style={styles.locationInfo}>
            {location ? (
              <Text style={styles.locationText}>
                Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
              </Text>
            ) : (
              <>
                <Text style={styles.locationText}>Location not available</Text>
                <TouchableOpacity onPress={getCurrentLocation}>
                  <Text style={styles.refreshLocationText}>Refresh Location</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.button} onPress={retake}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.uploadButton]} 
              onPress={handleContinueToCaption}
              disabled={!location}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render camera screen (default)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera 
          style={styles.camera} 
          type={type}
          ref={cameraRef}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => {
                setType(
                  type === CameraType.back
                    ? CameraType.front
                    : CameraType.back
                );
              }}
            >
              <Text style={styles.flipText}>Flip</Text>
            </TouchableOpacity>
          </View>
        </Camera>
        
        <View style={styles.controls}>
          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    margin: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  flipText: {
    color: 'white',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'black',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  galleryButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  preview: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'space-between',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
  },
  uploadButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.8)',
  },
  locationInfo: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  locationText: {
    color: 'white',
    textAlign: 'center',
  },
  refreshLocationText: {
    color: '#3498db',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  // Caption screen styles
  captionContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    color: '#3498db',
    fontSize: 16,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginRight: 12,
  },
  captionInput: {
    flex: 1,
    height: 100,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    textAlignVertical: 'top',
  },
  locationDisplay: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    marginBottom: 24,
  },
  locationDisplayText: {
    color: '#666',
    fontSize: 14,
  },
  captionActions: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
  submitButton: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    backgroundColor: '#3498db',
    borderRadius: 4,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  // Upload limit screen styles
  limitTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  limitText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
  },
});

export default CaptureScreen;