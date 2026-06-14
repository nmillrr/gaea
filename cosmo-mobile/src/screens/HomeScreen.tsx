import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootState } from '../store';
import { RootStackParamList } from '../../App';
import axiosInstance from '../api/axios';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface Photo {
  id: string;
  s3_url: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPhotoFeed();
  }, []);
  
  const fetchPhotoFeed = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/photos/feed');
      setPhotos(response.data.photos);
      setError(null);
    } catch (err) {
      console.error('Error fetching photo feed:', err);
      setError('Failed to load photos. Pull down to refresh.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchPhotoFeed();
  };
  
  const handlePhotoPress = (photoId: string) => {
    navigation.navigate('PhotoDetail', { photoId });
  };
  
  const handleCapturePress = () => {
    navigation.navigate('Capture');
  };
  
  const handleProfilePress = () => {
    navigation.navigate('Profile', { userId: user?.id });
  };
  
  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoCard}
      onPress={() => handlePhotoPress(item.id)}
    >
      <View style={styles.photoHeader}>
        <Image
          source={{ uri: item.user.avatar_url || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{item.user.username}</Text>
      </View>
      
      <Image
        source={{ uri: item.s3_url }}
        style={styles.photo}
        resizeMode="cover"
      />
      
      <View style={styles.photoFooter}>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={styles.guessButton}
          onPress={() => navigation.navigate('Guess', { photoId: item.id })}
        >
          <Text style={styles.guessButtonText}>Make a Guess</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>gaea</Text>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/40' }}
            style={styles.profileIcon}
          />
        </TouchableOpacity>
      </View>
      
      {loading && photos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      ) : error && photos.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photos yet.</Text>
          <Text style={styles.emptySubtext}>
            Add friends and start sharing photos to see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.photoList}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={loading}
        />
      )}
      
      <TouchableOpacity style={styles.captureButton} onPress={handleCapturePress}>
        <Text style={styles.captureButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
  },
  photoList: {
    padding: 10,
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  photo: {
    width: '100%',
    height: 300,
  },
  photoFooter: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
  },
  guessButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  guessButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default HomeScreen;