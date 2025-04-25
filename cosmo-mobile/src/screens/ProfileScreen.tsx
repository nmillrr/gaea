import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  Dimensions,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { format } from 'date-fns';

import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { RootStackParamList } from '../../App';
import { photoApi } from '../api/photoApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface Photo {
  id: string;
  s3_url: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [photosWithLocation, setPhotosWithLocation] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const mapRef = useRef<MapView | null>(null);
  const isCurrentUser = !userId || userId === currentUser?.id;
  
  useEffect(() => {
    fetchProfileData();
  }, [userId]);
  
  useEffect(() => {
    // Filter photos that have location data
    const photosWithCoordinates = userPhotos.filter(
      photo => photo.latitude !== undefined && photo.longitude !== undefined
    );
    setPhotosWithLocation(photosWithCoordinates);
  }, [userPhotos]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      if (isCurrentUser) {
        // Current user's profile
        setProfile({
          id: currentUser!.id,
          username: currentUser!.username,
          email: currentUser!.email,
          avatar_url: currentUser!.avatarUrl,
          created_at: new Date().toISOString() // We don't have this from auth state
        });
        
        // Fetch current user's photos with the new endpoint
        try {
          const photosResponse = await photoApi.getUserPhotos();
          setUserPhotos(photosResponse.photos);
        } catch (err) {
          // Fallback to old endpoint if the new one is not available
          const photosResponse = await photoApi.getFeed();
          // Filter to only include user's photos
          const myPhotos = photosResponse.photos.filter(photo => photo.user.id === currentUser!.id);
          setUserPhotos(myPhotos);
        }
      } else {
        // Other user's profile
        const profileResponse = await photoApi.getUserPhotos();
        setProfile(profileResponse.data);
        
        // Check friendship status
        const friendshipResponse = await photoApi.getUserPhotos();
        setIsFriend(friendshipResponse.data.status === 'accepted');
        setFriendRequestSent(friendshipResponse.data.status === 'pending');
        
        // Fetch user's photos (if friends)
        if (friendshipResponse.data.status === 'accepted') {
          const photosResponse = await photoApi.getFeed();
          // Filter to only include this user's photos
          const theirPhotos = photosResponse.photos.filter(photo => photo.user.id === userId);
          setUserPhotos(theirPhotos);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendFriendRequest = async () => {
    if (!profile) return;
    
    try {
      await photoApi.getUserPhotos();
      setFriendRequestSent(true);
      Alert.alert('Success', 'Friend request sent');
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send friend request');
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        },
      ]
    );
  };

  const handleToggleView = () => {
    setViewMode(viewMode === 'grid' ? 'map' : 'grid');
  };

  const handleMarkerPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const handleMapReady = () => {
    if (photosWithLocation.length > 0 && mapRef.current) {
      const coordinates = photosWithLocation.map(photo => ({
        latitude: photo.latitude!,
        longitude: photo.longitude!
      }));
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => navigation.navigate('PhotoDetail', { photoId: item.id })}
    >
      <Image
        source={{ uri: item.s3_url }}
        style={styles.photoThumbnail}
      />
    </TouchableOpacity>
  );

  const renderListPhotoItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.listPhotoItem}
      onPress={() => navigation.navigate('PhotoDetail', { photoId: item.id })}
    >
      <Image
        source={{ uri: item.s3_url }}
        style={styles.listPhotoThumbnail}
      />
      <View style={styles.listPhotoInfo}>
        <Text style={styles.listPhotoTimestamp}>{formatDate(item.created_at)}</Text>
        {item.latitude !== undefined && item.longitude !== undefined ? (
          <Text style={styles.locationAvailableText}>📍 Location Available</Text>
        ) : (
          <Text style={styles.noLocationText}>No Location Data</Text>
        )}
      </View>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        {isCurrentUser && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
        
        <Text style={styles.username}>{profile?.username}</Text>
        
        {!isCurrentUser && (
          <View style={styles.friendshipContainer}>
            {isFriend ? (
              <View style={styles.friendBadge}>
                <Text style={styles.friendBadgeText}>Friends</Text>
              </View>
            ) : friendRequestSent ? (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Request Sent</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addFriendButton}
                onPress={handleSendFriendRequest}
              >
                <Text style={styles.addFriendButtonText}>Add Friend</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userPhotos.length}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{photosWithLocation.length}</Text>
          <Text style={styles.statLabel}>Mapped</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.photosHeader}>
        <Text style={styles.sectionTitle}>Photos</Text>
        
        {userPhotos.length > 0 && (
          <TouchableOpacity 
            style={[
              styles.viewToggleButton,
              viewMode === 'map' ? styles.mapActiveButton : styles.gridActiveButton
            ]}
            onPress={handleToggleView}
          >
            <Text style={styles.viewToggleText}>
              {viewMode === 'grid' ? '🗺️ Map View' : '📷 Grid View'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {userPhotos.length === 0 ? (
        <View style={styles.emptyPhotosContainer}>
          <Text style={styles.emptyPhotosText}>
            {isCurrentUser 
              ? "You haven't shared any photos yet" 
              : "This user hasn't shared any photos yet"}
          </Text>
          
          {isCurrentUser && (
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={() => navigation.navigate('Capture')}
            >
              <Text style={styles.captureButtonText}>Take a Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : viewMode === 'grid' ? (
        <View style={styles.photoViewContainer}>
          <FlatList
            data={userPhotos}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.photoGrid}
          />
        </View>
      ) : (
        <View style={styles.photoViewContainer}>
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onMapReady={handleMapReady}
            >
              {photosWithLocation.map((photo) => (
                <Marker
                  key={photo.id}
                  coordinate={{
                    latitude: photo.latitude!,
                    longitude: photo.longitude!
                  }}
                  onPress={() => handleMarkerPress(photo)}
                >
                  <Callout tooltip>
                    <View style={styles.markerCallout}>
                      <Image
                        source={{ uri: photo.s3_url }}
                        style={styles.calloutImage}
                      />
                      <Text style={styles.calloutText}>
                        {formatDate(photo.created_at)}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          </View>
          
          <FlatList
            data={userPhotos}
            renderItem={renderListPhotoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.photoList}
            horizontal={false}
          />
        </View>
      )}

      {/* Modal for selected photo from map */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: selectedPhoto.s3_url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalDate}>{formatDate(selectedPhoto.created_at)}</Text>
                
                <TouchableOpacity
                  style={styles.viewDetailButton}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('PhotoDetail', { photoId: selectedPhoto.id });
                  }}
                >
                  <Text style={styles.viewDetailButtonText}>View Details</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  backButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
  logoutButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  logoutButtonText: {
    color: '#e74c3c',
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  friendshipContainer: {
    marginTop: 10,
  },
  addFriendButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addFriendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  friendBadge: {
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  friendBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#f39c12',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  pendingBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 15,
    backgroundColor: '#f8f8f8',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewToggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  gridActiveButton: {
    backgroundColor: '#f0f0f0',
  },
  mapActiveButton: {
    backgroundColor: '#e1f5fe',
  },
  viewToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emptyPhotosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyPhotosText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  photoViewContainer: {
    flex: 1,
  },
  photoGrid: {
    padding: 5,
  },
  photoItem: {
    flex: 1/3,
    aspectRatio: 1,
    padding: 2,
  },
  photoThumbnail: {
    flex: 1,
    borderRadius: 2,
  },
  // Map view styles
  mapContainer: {
    height: width * 0.8, // Make the map square
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  map: {
    flex: 1,
  },
  photoList: {
    paddingHorizontal: 10,
  },
  listPhotoItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listPhotoThumbnail: {
    width: 80,
    height: 80,
  },
  listPhotoInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  listPhotoTimestamp: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationAvailableText: {
    color: '#2ecc71',
    fontSize: 12,
  },
  noLocationText: {
    color: '#95a5a6',
    fontSize: 12,
  },
  markerCallout: {
    width: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 4,
    marginBottom: 5,
  },
  calloutText: {
    textAlign: 'center',
    fontSize: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 8,
    marginVertical: 10,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  viewDetailButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  viewDetailButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;