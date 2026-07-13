import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Temporarily commenting out the maps import until it's properly configured
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import axiosInstance from '../api/axios';
import { showAlert } from '../utils/alert';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoDetail'>;

interface Photo {
  id: string;
  s3_url: string;
  latitude: number;
  longitude: number;
  user_id: string;
  created_at: string;
  user: {
    username: string;
    avatar_url?: string;
  };
}

interface Guess {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  distance_m: number;
  points: number;
  created_at: string;
}

const { width } = Dimensions.get('window');
const ASPECT_RATIO = width / width * 0.8;

const PhotoDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { photoId } = route.params;
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [userGuess, setUserGuess] = useState<Guess | null>(null);
  const [leaderboard, setLeaderboard] = useState<Guess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActualLocation, setShowActualLocation] = useState(false);
  // Commented out until maps are properly configured
  // const mapRef = useRef<MapView | null>(null);
  
  useEffect(() => {
    fetchPhotoDetails();
  }, []);
  
  const fetchPhotoDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch photo details
      const photoResponse = await axiosInstance.get(`/photos/${photoId}`);
      setPhoto(photoResponse.data);
      
      // Try to fetch user's guess
      try {
        const guessResponse = await axiosInstance.get(`/photos/${photoId}/guess`);
        setUserGuess(guessResponse.data);
        setShowActualLocation(true); // Show actual location if user has already guessed
      } catch (err) {
        // No guess found, that's okay
      }
      
      // Fetch leaderboard
      const leaderboardResponse = await axiosInstance.get(`/photos/${photoId}/leaderboard`);
      setLeaderboard(leaderboardResponse.data.leaderboard);
    } catch (error) {
      console.error('Error fetching photo details:', error);
      showAlert('Error', 'Failed to load photo details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  const handleMakeGuess = () => {
    navigation.navigate('Guess', { photoId });
  };
  
  const renderLeaderboardItem = (guess: Guess, index: number) => (
    <View key={guess.id} style={styles.leaderboardItem}>
      <Text style={styles.rankText}>{index + 1}</Text>
      
      <Image
        source={{ uri: guess.avatar_url || 'https://via.placeholder.com/40' }}
        style={styles.avatarSmall}
      />
      
      <Text style={styles.usernameText} numberOfLines={1}>
        {guess.username}
      </Text>
      
      <Text style={styles.distanceText}>
        {guess.distance_m.toLocaleString()}m
      </Text>
      
      <Text style={styles.pointsText}>
        {guess.points}
      </Text>
    </View>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading photo details...</Text>
      </SafeAreaView>
    );
  }
  
  if (!photo) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load photo</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Photo Details</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: photo.s3_url }}
            style={styles.photo}
            resizeMode="cover"
          />
          
          <View style={styles.photoMeta}>
            <TouchableOpacity 
              style={styles.userInfo}
              onPress={() => navigation.navigate('Profile', { userId: photo.user_id })}
            >
              <Image
                source={{ uri: photo.user?.avatar_url || 'https://via.placeholder.com/40' }}
                style={styles.avatar}
              />
              <Text style={styles.username}>{photo.user?.username || 'Unknown'}</Text>
            </TouchableOpacity>
            
            <Text style={styles.timestamp}>
              {new Date(photo.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        {userGuess ? (
          <View style={styles.userGuessContainer}>
            <Text style={styles.sectionTitle}>Your Guess</Text>
            
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Distance:</Text>
                <Text style={styles.resultValue}>{userGuess.distance_m.toLocaleString()} meters</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Score:</Text>
                <Text style={[styles.resultValue, styles.scoreValue]}>{userGuess.points} points</Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.guessButton}
            onPress={handleMakeGuess}
          >
            <Text style={styles.guessButtonText}>Make a Guess</Text>
          </TouchableOpacity>
        )}
        
        {userGuess && (
          <View style={styles.mapContainer}>
            <View style={styles.disabledMapView}>
              <Text style={styles.disabledMapText}>Map view temporarily disabled</Text>
              <Text style={styles.disabledMapText}>Maps functionality will be available in the next update</Text>
            </View>
            {/* Map functionality temporarily disabled
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: photo.latitude,
                longitude: photo.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1 * ASPECT_RATIO,
              }}
            >
              {showActualLocation && (
                <Marker
                  coordinate={{
                    latitude: photo.latitude,
                    longitude: photo.longitude
                  }}
                  pinColor="#2ecc71"
                  title="Actual Location"
                />
              )}
            </MapView>
            */}
          </View>
        )}
        
        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>No guesses yet</Text>
          ) : (
            <View>
              <View style={styles.leaderboardHeader}>
                <Text style={styles.headerRank}>#</Text>
                <Text style={styles.headerUser}>User</Text>
                <Text style={styles.headerDistance}>Distance</Text>
                <Text style={styles.headerPoints}>Points</Text>
              </View>
              
              {leaderboard.slice(0, 10).map((guess, index) => renderLeaderboardItem(guess, index))}
            </View>
          )}
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  photoContainer: {
    width: '100%',
  },
  photo: {
    width: '100%',
    height: 300,
  },
  photoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#999',
    fontSize: 14,
  },
  userGuessContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  resultLabel: {
    color: '#666',
    fontSize: 16,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: '#2ecc71',
  },
  guessButton: {
    backgroundColor: '#3498db',
    margin: 15,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  guessButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapContainer: {
    height: 200,
    margin: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  disabledMapView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledMapText: {
    color: '#666',
    fontWeight: '500',
    marginBottom: 5,
  },
  leaderboardContainer: {
    padding: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerRank: {
    width: 30,
    fontWeight: 'bold',
    color: '#666',
  },
  headerUser: {
    flex: 2,
    fontWeight: 'bold',
    color: '#666',
  },
  headerDistance: {
    flex: 1,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'right',
  },
  headerPoints: {
    width: 50,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'right',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rankText: {
    width: 30,
    color: '#666',
    fontWeight: 'bold',
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  usernameText: {
    flex: 1,
    marginRight: 5,
  },
  distanceText: {
    flex: 1,
    color: '#666',
    textAlign: 'right',
  },
  pointsText: {
    width: 50,
    fontWeight: 'bold',
    color: '#2ecc71',
    textAlign: 'right',
  },
});

export default PhotoDetailScreen;