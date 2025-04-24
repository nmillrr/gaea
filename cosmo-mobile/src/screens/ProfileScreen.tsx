import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { RootStackParamList } from '../../App';
import axiosInstance from '../api/axios';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface Photo {
  id: string;
  s3_url: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

const ProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  
  const isCurrentUser = !userId || userId === currentUser?.id;
  
  useEffect(() => {
    fetchProfileData();
  }, [userId]);
  
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
        
        // Fetch current user's photos
        const photosResponse = await axiosInstance.get('/photos');
        setUserPhotos(photosResponse.data);
      } else {
        // Other user's profile
        const profileResponse = await axiosInstance.get(`/api/users/${userId}`);
        setProfile(profileResponse.data);
        
        // Check friendship status
        const friendshipResponse = await axiosInstance.get(`/friends/status/${userId}`);
        setIsFriend(friendshipResponse.data.status === 'accepted');
        setFriendRequestSent(friendshipResponse.data.status === 'pending');
        
        // Fetch user's photos (if friends)
        if (friendshipResponse.data.status === 'accepted') {
          const photosResponse = await axiosInstance.get(`/photos?user_id=${userId}`);
          setUserPhotos(photosResponse.data);
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
      await axiosInstance.post('/friends/request', { friend_email: profile.email });
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
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.photosContainer}>
        <Text style={styles.sectionTitle}>Photos</Text>
        
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
        ) : (
          <FlatList
            data={userPhotos}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.photoGrid}
          />
        )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 15,
  },
  photosContainer: {
    flex: 1,
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
});

export default ProfileScreen;