import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootState, AppDispatch } from '../store';
import { RootStackParamList } from '../../App';
import { fetchFeed, refreshFeed } from '../store/slices/feedSlice';
import { Photo } from '../api/photoApi';
import PhotoCard from '../components/PhotoCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Feed'> | NativeStackScreenProps<RootStackParamList, 'Home'>;

const FeedScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { photos, isLoading, refreshing, error } = useSelector((state: RootState) => state.feed);
  
  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);
  
  const handleRefresh = () => {
    dispatch(refreshFeed());
  };
  
  const handleCapturePress = () => {
    navigation.navigate('Capture');
  };
  
  const handleProfilePress = () => {
    navigation.navigate('Profile', { userId: user?.id });
  };
  
  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <PhotoCard photo={item} />
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cosmo</Text>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/40' }}
            style={styles.profileIcon}
          />
        </TouchableOpacity>
      </View>
      
      {isLoading && photos.length === 0 ? (
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
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>
            Add friends and start sharing photos to see them here.
          </Text>
          <TouchableOpacity 
            style={styles.addFriendsButton}
            onPress={() => navigation.navigate('Profile', { userId: user?.id })}
          >
            <Text style={styles.addFriendsButtonText}>Find Friends</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
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
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  addFriendsButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFriendsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginTop: -2,
  },
});

export default FeedScreen;