import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { Photo } from '../api/photoApi';
import { RootStackParamList } from '../../App';
import { RootState, AppDispatch } from '../store';
import { submitGuess } from '../store/slices/guessesSlice';
import { colors, spacing } from '../theme';
import MapGuess from './MapGuess';
import GuessResult from './GuessResult';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PhotoCardProps {
  photo: Photo;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width;

type Mode = 'photo' | 'map';

/**
 * A single feed post. The media area toggles between the photo and an
 * interactive guessing map (map-pin button). After a guess is submitted the
 * accuracy/points result overlays the media, and the comment field — locked
 * until then, BeReal-style — unlocks.
 */
const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  const [mode, setMode] = useState<Mode>('photo');
  const result = useSelector((state: RootState) => state.guesses.results.data[photo.id]);
  const submitting = useSelector(
    (state: RootState) =>
      state.guesses.currentGuess.isSubmitting &&
      state.guesses.currentGuess.photoId === photo.id,
  );
  const hasGuessed = Boolean(result);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const diffInHours = Math.abs(Date.now() - date.getTime()) / 36e5;
    return diffInHours < 24
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, 'MMM d, yyyy');
  };

  const handleGuess = async (coords: { latitude: number; longitude: number }) => {
    try {
      await dispatch(submitGuess({ photoId: photo.id, location: coords })).unwrap();
      setMode('photo');
    } catch (err) {
      Alert.alert('Could not submit guess', String(err));
    }
  };

  return (
    <View style={styles.card}>
      {/* Author + recency + menu */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userContainer}
          onPress={() => navigation.navigate('Profile', { userId: photo.user.id })}
        >
          <Image
            source={{ uri: photo.user.avatar_url || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{photo.user.username}</Text>
          <Text style={styles.timestamp}> · {formatTimestamp(photo.created_at)}</Text>
        </TouchableOpacity>
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
      </View>

      {/* Media: photo / guessing map / result overlay */}
      <View style={styles.media}>
        {mode === 'photo' ? (
          <Image source={{ uri: photo.s3_url }} style={styles.photo} resizeMode="cover" />
        ) : (
          <MapGuess onGuess={handleGuess} submitting={submitting} hint={photo.hint} />
        )}

        {/* Toggle between photo and map (hidden once a result is showing) */}
        {!result && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setMode((m) => (m === 'photo' ? 'map' : 'photo'))}
            activeOpacity={0.85}
          >
            <Ionicons
              name={mode === 'photo' ? 'map-outline' : 'image-outline'}
              size={22}
              color={colors.onPrimary}
            />
          </TouchableOpacity>
        )}

        {result && (
          <GuessResult
            result={result}
            thumbUri={photo.s3_url}
            hint={photo.hint}
            onClose={() => setMode('photo')}
          />
        )}
      </View>

      {/* Caption */}
      {photo.caption ? (
        <Text style={styles.caption}>
          <Text style={styles.captionUser}>{photo.user.username}</Text> {photo.caption}
        </Text>
      ) : null}

      {/* Comments — locked until the viewer has guessed */}
      {hasGuessed ? (
        <TouchableOpacity
          style={styles.commentRow}
          onPress={() => navigation.navigate('Comments', { photoId: photo.id })}
          activeOpacity={0.7}
        >
          <Text style={styles.commentLocked}>Add a comment…</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.commentRow}
          onPress={() => setMode('map')}
          activeOpacity={0.7}
        >
          <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
          <Text style={styles.commentLocked}>Guess the location to unlock comments</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
    backgroundColor: colors.skeleton,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.text,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 13,
  },
  media: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: colors.skeleton,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  toggle: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26,26,26,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  caption: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    fontSize: 14,
    color: colors.text,
    lineHeight: 19,
  },
  captionUser: {
    fontWeight: '600',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 2,
  },
  commentLocked: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

export default PhotoCard;
