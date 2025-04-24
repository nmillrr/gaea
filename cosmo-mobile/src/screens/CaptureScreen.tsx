import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import axiosInstance from '../api/axios';

type Props = NativeStackScreenProps<RootStackParamList, 'Capture'>;

const CaptureScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<Camera | null>(null);

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
  }, []);

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocation(currentLocation);
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
        setCapturedImage(photo.uri);
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
      setCapturedImage(result.assets[0].uri);
    }
  };

  const uploadPhoto = async () => {
    if (!capturedImage || !location) {
      Alert.alert('Error', 'Image or location data is missing');
      return;
    }

    // Create form data for upload
    const formData = new FormData();
    
    // Append the image file
    const filename = capturedImage.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image';
    
    formData.append('photo', {
      uri: Platform.OS === 'ios' ? capturedImage.replace('file://', '') : capturedImage,
      name: filename,
      type,
    } as any);
    
    // Append location data
    formData.append('latitude', String(location.coords.latitude));
    formData.append('longitude', String(location.coords.longitude));

    try {
      setUploading(true);
      
      // Use axios to upload
      const response = await axiosInstance.post('/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      Alert.alert('Success', 'Photo uploaded successfully!');
      
      // Navigate back to home
      navigation.navigate('Home');
    } catch (error: any) {
      console.error('Upload error:', error.response?.data || error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message || 'Failed to upload photo. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.text}>Requesting permissions...</Text>
      </View>
    );
  }

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

  return (
    <SafeAreaView style={styles.container}>
      {capturedImage ? (
        // Preview screen
        <View style={styles.preview}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
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
              onPress={uploadPhoto}
              disabled={uploading || !location}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Upload</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Camera screen
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
      )}
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
});

export default CaptureScreen;