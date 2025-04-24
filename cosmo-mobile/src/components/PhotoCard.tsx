import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Photo } from '../api/photoApi';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PhotoCardProps {
  photo: Photo;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width;

const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
  const navigation = useNavigation<NavigationProp>();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <View style={styles.photoCard}>
      <View style={styles.photoHeader}>
        <TouchableOpacity 
          style={styles.userContainer}
          onPress={() => navigation.navigate('Profile', { userId: photo.user.id })}
        >
          <Image
            source={{ uri: photo.user.avatar_url || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{photo.user.username}</Text>
        </TouchableOpacity>
        <Text style={styles.timestamp}>{formatTimestamp(photo.created_at)}</Text>
      </View>
      
      <TouchableOpacity onPress={() => navigation.navigate('PhotoDetail', { photoId: photo.id })}>
        <Image
          source={{ uri: photo.s3_url }}
          style={styles.photo}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.photoFooter}>
        <View>
          <Text style={styles.locationText}>Mystery Location</Text>
        </View>
        <TouchableOpacity
          style={styles.guessButton}
          onPress={() => navigation.navigate('Guess', { photoId: photo.id })}
        >
          <Text style={styles.guessButtonText}>Guess Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  photoCard: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
  },
  photo: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
  },
  photoFooter: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    color: '#333',
    fontSize: 14,
  },
  guessButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  guessButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PhotoCard;