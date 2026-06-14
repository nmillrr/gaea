import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootState, AppDispatch } from '../store';
import { RootStackParamList } from '../../App';
import { fetchFeed, refreshFeed } from '../store/slices/feedSlice';
import { Photo } from '../api/photoApi';
import PhotoCard from '../components/PhotoCard';
import BottomNav from '../components/BottomNav';
import { colors, spacing } from '../theme';

type Props =
  | NativeStackScreenProps<RootStackParamList, 'Feed'>
  | NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

/** Gray placeholder card shown while the feed loads (per loading_feed mockup). */
const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonHeader}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonLine} />
    </View>
    <View style={styles.skeletonMedia} />
    <View style={[styles.skeletonLine, { width: '60%', margin: spacing.md }]} />
  </View>
);

const FeedScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { photos, isLoading, refreshing, error } = useSelector(
    (state: RootState) => state.feed,
  );

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  const renderPhotoItem = ({ item }: { item: Photo }) => <PhotoCard photo={item} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.brand}>gaea</Text>
        <TouchableOpacity style={[styles.headerSide, styles.bell]} hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {isLoading && photos.length === 0 ? (
        <FlatList
          data={[0, 1, 2]}
          renderItem={() => <SkeletonCard />}
          keyExtractor={(i) => String(i)}
          scrollEnabled={false}
        />
      ) : error && photos.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => dispatch(refreshFeed())}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptySubtext}>
            Add friends and start sharing photos to see them here.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Profile', {})}
          >
            <Text style={styles.buttonText}>Find Friends</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          onRefresh={() => dispatch(refreshFeed())}
          refreshing={refreshing}
          contentContainerStyle={styles.listContent}
        />
      )}

      <BottomNav active="home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerSide: {
    width: 40,
  },
  bell: {
    alignItems: 'flex-end',
  },
  brand: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textStrong,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  emptySubtext: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontSize: 15,
  },
  errorText: {
    color: '#C0392B',
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  // Skeleton
  skeletonCard: {
    marginBottom: spacing.sm,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  skeletonAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.skeleton,
    marginRight: spacing.sm,
  },
  skeletonLine: {
    height: 12,
    width: 120,
    borderRadius: 6,
    backgroundColor: colors.skeleton,
  },
  skeletonMedia: {
    width,
    height: width,
    backgroundColor: colors.skeleton,
  },
});

export default FeedScreen;
