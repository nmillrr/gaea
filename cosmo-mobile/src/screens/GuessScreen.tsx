import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  Dimensions,
  FlatList,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Temporarily removing MapView to fix the build
// import MapView, { 
//   Marker, 
//   MapPressEvent, 
//   PROVIDER_GOOGLE, 
//   Polyline, 
//   Circle 
// } from 'react-native-maps';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Carousel from 'react-native-snap-carousel';

import { RootStackParamList } from '../../App';
import { photoApi, GuessResult, Photo as PhotoType, LeaderboardEntry } from '../api/photoApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Guess'>;

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 60;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GuessScreen: React.FC<Props> = ({ route, navigation }) => {
  const { photoId } = route.params;
  const [photo, setPhoto] = useState<PhotoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeResultPage, setActiveResultPage] = useState(0);
  const [mapToggle, setMapToggle] = useState(false);
  
  const mapRef = useRef<MapView | null>(null);
  const carouselRef = useRef<Carousel<any> | null>(null);
  
  useEffect(() => {
    fetchPhotoDetails();
  }, []);
  
  const fetchPhotoDetails = async () => {
    try {
      setLoading(true);
      const response = await photoApi.getPhoto(photoId);
      setPhoto(response.photo);
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
      
      const result = await photoApi.submitGuess(photoId, {
        guess_lat: markerCoordinate.latitude,
        guess_lng: markerCoordinate.longitude
      });
      
      setGuessResult(result);
      setShowResults(true);
      
      // Zoom out to show both markers
      if (mapRef.current) {
        // Calculate bounding box for both points
        const latitudes = [result.actual_lat, result.guess_lat];
        const longitudes = [result.actual_lng, result.guess_lng];
        
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        // Add padding
        const PADDING = 0.5;
        
        mapRef.current.fitToCoordinates(
          [
            { latitude: minLat - PADDING, longitude: minLng - PADDING },
            { latitude: maxLat + PADDING, longitude: maxLng + PADDING }
          ],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true
          }
        );
      }
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
  
  const toggleMap = () => {
    setMapToggle(!mapToggle);
  };
  
  const closeResults = () => {
    setShowResults(false);
    setActiveResultPage(0);
  };
  
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    } else if (meters < 10000) {
      return `${(meters / 1000).toFixed(2)} km`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };
  
  const renderResultPage = ({ item, index }: { item: string, index: number }) => {
    if (!guessResult) return null;
    
    // First page - Map with results
    if (index === 0) {
      return (
        <View style={styles.resultPage}>
          <Text style={styles.resultTitle}>Your Guess Results</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDistance(guessResult.distance_m)}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{guessResult.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
          
          <View style={styles.resultMapContainer}>
            <MapView
              style={styles.resultMap}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: (guessResult.actual_lat + guessResult.guess_lat) / 2,
                longitude: (guessResult.actual_lng + guessResult.guess_lng) / 2,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5 * ASPECT_RATIO,
              }}
              toolbarEnabled={false}
              zoomEnabled={true}
              scrollEnabled={true}
              rotateEnabled={false}
            >
              {/* Actual location marker */}
              <Marker
                coordinate={{
                  latitude: guessResult.actual_lat,
                  longitude: guessResult.actual_lng
                }}
                pinColor="#2ecc71"
                title="Actual Location"
              />
              
              {/* Circle around actual location */}
              <Circle
                center={{
                  latitude: guessResult.actual_lat,
                  longitude: guessResult.actual_lng
                }}
                radius={100}
                fillColor="rgba(46, 204, 113, 0.2)"
                strokeColor="rgba(46, 204, 113, 0.5)"
                strokeWidth={1}
              />
              
              {/* Guessed location marker */}
              <Marker
                coordinate={{
                  latitude: guessResult.guess_lat,
                  longitude: guessResult.guess_lng
                }}
                pinColor="#e74c3c"
                title="Your Guess"
              />
              
              {/* Line between points */}
              <Polyline
                coordinates={[
                  {
                    latitude: guessResult.actual_lat,
                    longitude: guessResult.actual_lng
                  },
                  {
                    latitude: guessResult.guess_lat,
                    longitude: guessResult.guess_lng
                  }
                ]}
                strokeColor="#3498db"
                strokeWidth={2}
                lineDashPattern={[5, 5]}
              />
            </MapView>
            
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#2ecc71' }]} />
                <Text style={styles.legendText}>Actual Location</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
                <Text style={styles.legendText}>Your Guess</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.swipePrompt}>Swipe to see leaderboard →</Text>
        </View>
      );
    }
    
    // Second page - Leaderboard
    return (
      <View style={styles.resultPage}>
        <Text style={styles.resultTitle}>Leaderboard</Text>
        
        <FlatList
          data={guessResult.leaderboard}
          keyExtractor={(item) => item.user_id}
          style={styles.leaderboardList}
          renderItem={({ item }) => (
            <View style={styles.leaderboardItem}>
              <View style={styles.leaderboardRank}>
                <Text style={styles.rankText}>#{item.position}</Text>
              </View>
              
              <Image
                source={{ uri: item.avatar_url || 'https://via.placeholder.com/40' }}
                style={styles.leaderboardAvatar}
              />
              
              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardUsername}>{item.username}</Text>
              </View>
              
              <Text style={styles.leaderboardPoints}>{item.points} pts</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyLeaderboard}>
              <Text style={styles.emptyLeaderboardText}>No scores yet</Text>
            </View>
          }
        />
      </View>
    );
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
      {/* Results Overlay */}
      {showResults && guessResult && (
        <View style={styles.resultsOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={closeResults}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          <Carousel
            ref={carouselRef}
            data={['results', 'leaderboard']}
            renderItem={renderResultPage}
            sliderWidth={width}
            itemWidth={width}
            onSnapToItem={setActiveResultPage}
            inactiveSlideOpacity={1}
            inactiveSlideScale={1}
          />
          
          <View style={styles.paginationContainer}>
            <View style={[
              styles.paginationDot, 
              activeResultPage === 0 ? styles.paginationDotActive : {}
            ]} />
            <View style={[
              styles.paginationDot, 
              activeResultPage === 1 ? styles.paginationDotActive : {}
            ]} />
          </View>
        </View>
      )}
      
      {/* Toggle view between photo and map */}
      {!mapToggle ? (
        <View style={styles.photoContainer}>
          {photo && (
            <Image
              source={{ uri: photo.s3_url }}
              style={styles.photo}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleMap}
          >
            <Text style={styles.toggleButtonText}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.expandedMapContainer}>
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
          
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleMap}
          >
            <Text style={styles.toggleButtonText}>🖼️ Photo</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!mapToggle && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Look at the photo and guess its location by tapping on the map
          </Text>
        </View>
      )}
      
      {!mapToggle && (
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
      )}
      
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
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  expandedMapContainer: {
    height: '50%',
    position: 'relative',
  },
  toggleButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(52, 152, 219, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
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

  // Results overlay styles
  resultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 10,
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Result page styles
  resultPage: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  resultMapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  resultMap: {
    flex: 1,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  swipePrompt: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#ccc',
  },
  paginationDotActive: {
    backgroundColor: '#3498db',
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Leaderboard styles
  leaderboardList: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  leaderboardRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontWeight: 'bold',
    color: '#555',
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardUsername: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  leaderboardPoints: {
    fontWeight: 'bold',
    color: '#3498db',
    fontSize: 16,
  },
  emptyLeaderboard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyLeaderboardText: {
    color: '#95a5a6',
    fontSize: 16,
  },
});

export default GuessScreen;