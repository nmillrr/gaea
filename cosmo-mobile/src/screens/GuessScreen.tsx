import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import axiosInstance from '../api/axios';

type Props = NativeStackScreenProps<RootStackParamList, 'Guess'>;

interface Photo {
  id: string;
  s3_url: string;
  user_id: string;
  created_at: string;
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 60;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GuessScreen: React.FC<Props> = ({ route, navigation }) => {
  const { photoId } = route.params;
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView | null>(null);
  
  useEffect(() => {
    fetchPhotoDetails();
  }, []);
  
  const fetchPhotoDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/photos/${photoId}`);
      setPhoto(response.data);
    } catch (error) {
      console.error('Error fetching photo details:', error);
      Alert.alert('Error', 'Failed to load photo details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  const handleMapPress = (event: MapPressEvent) => {
    setMarkerCoordinate(event.nativeEvent.coordinate);
  };
  
  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      setMarkerCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5 * ASPECT_RATIO
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };
  
  const submitGuess = async () => {
    if (!markerCoordinate) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await axiosInstance.post(`/photos/${photoId}/guess`, {
        guess_lat: markerCoordinate.latitude,
        guess_lng: markerCoordinate.longitude
      });
      
      // Navigate to results screen (in this case, we'll use photo detail screen)
      navigation.replace('PhotoDetail', { photoId });
      
      // Show result
      Alert.alert(
        'Guess Submitted!',
        `You scored ${response.data.points} points.\nYour guess was ${response.data.distance_m.toLocaleString()} meters away.`
      );
    } catch (error: any) {
      console.error('Error submitting guess:', error.response?.data || error);
      
      if (error.response?.status === 429) {
        // Already guessed
        Alert.alert(
          'Already Guessed',
          'You have already submitted a guess for this photo',
          [{ text: 'View Results', onPress: () => navigation.replace('PhotoDetail', { photoId }) }]
        );
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to submit guess');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading photo...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.photoContainer}>
        {photo && (
          <Image
            source={{ uri: photo.s3_url }}
            style={styles.photo}
            resizeMode="contain"
          />
        )}
      </View>
      
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Look at the photo and guess its location by tapping on the map
        </Text>
      </View>
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 20, // Center on world
            longitude: 0,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          onPress={handleMapPress}
        >
          {markerCoordinate && (
            <Marker
              coordinate={markerCoordinate}
              pinColor="#e74c3c"
            />
          )}
        </MapView>
        
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleUseCurrentLocation}
        >
          <Text style={styles.locationButtonText}>📍 My Location</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!markerCoordinate || submitting) && styles.disabledButton
          ]}
          onPress={submitGuess}
          disabled={!markerCoordinate || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Guess</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  photoContainer: {
    height: '30%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  instructionContainer: {
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  instructionText: {
    textAlign: 'center',
    color: '#555',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationButtonText: {
    fontSize: 12,
    color: '#333',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GuessScreen;