import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { RootStackParamList } from '../../App';
import { photoApi, Photo } from '../api/photoApi';
import BottomNav from '../components/BottomNav';
import { colors, spacing, radius } from '../theme';
import { showAlert } from '../utils/alert';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const { width } = Dimensions.get('window');
const GRID_GAP = 2;
const CELL = (width - GRID_GAP * 2) / 3;

/**
 * Profile — post grid + stats + "this week" highlight, per the prototype.
 *
 * Points and global rank need a profile-stats endpoint that doesn't exist yet
 * (see PRD §22 backlog); they render as "—" until that lands. Post count and the
 * grid use real data from `GET /users/me/photos`.
 */
const ProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const isCurrentUser = !userId || userId === currentUser?.id;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (isCurrentUser) {
          try {
            const res = await photoApi.getUserPhotos();
            setPhotos(res.photos);
          } catch {
            const feed = await photoApi.getFeed();
            setPhotos(feed.photos.filter((p) => p.user.id === currentUser?.id));
          }
        } else {
          const feed = await photoApi.getFeed();
          setPhotos(feed.photos.filter((p) => p.user.id === userId));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        showAlert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleSignOut = () => {
    showAlert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const username = isCurrentUser ? currentUser?.username : photos[0]?.user.username;
  const stats = [
    { n: String(photos.length), l: 'posts' },
    { n: '—', l: 'points' },
    { n: '—', l: 'global' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>{username || 'Profile'}</Text>
        {isCurrentUser ? (
          <TouchableOpacity onPress={handleSignOut} hitSlop={8}>
            <Ionicons name="log-out-outline" size={23} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Image
              source={{ uri: currentUser?.avatarUrl || 'https://via.placeholder.com/78' }}
              style={styles.avatar}
            />
            <View style={styles.statsRow}>
              {stats.map((s) => (
                <View key={s.l} style={styles.stat}>
                  <Text style={styles.statNum}>{s.n}</Text>
                  <Text style={styles.statLabel}>{s.l}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.name}>{username}</Text>
            <Text style={styles.bio}>Chasing façades and golden hours. One post a day.</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7}>
              <Text style={styles.outlineBtnText}>Edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.darkBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <Text style={styles.darkBtnText}>Leaderboard</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekCard}>
            <View>
              <Text style={styles.weekLabel}>THIS WEEK</Text>
              <Text style={styles.weekValue}>Rank & points coming soon</Text>
            </View>
            <View style={styles.weekIcon}>
              <Ionicons name="trending-up" size={22} color="#fff" />
            </View>
          </View>

          {photos.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {isCurrentUser ? "You haven't posted yet." : 'No posts yet.'}
              </Text>
              {isCurrentUser && (
                <TouchableOpacity
                  style={styles.darkBtn}
                  onPress={() => navigation.navigate('Capture')}
                >
                  <Text style={styles.darkBtnText}>Take a photo</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.grid}>
              {photos.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.cell}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('PhotoDetail', { photoId: p.id })}
                >
                  <Image source={{ uri: p.s3_url }} style={styles.cellImg} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <BottomNav active="profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: spacing.sm,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.textStrong },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.avatar,
  },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontWeight: '800', fontSize: 19, color: colors.textStrong },
  statLabel: { color: colors.textMuted, fontSize: 12.5, marginTop: 1 },
  nameBlock: { paddingHorizontal: 20, paddingTop: 10 },
  name: { fontWeight: '700', fontSize: 14.5, color: colors.textStrong },
  bio: { color: colors.text, fontSize: 13.5, lineHeight: 19, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  outlineBtn: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingVertical: 9,
  },
  outlineBtnText: { fontWeight: '600', fontSize: 13.5, color: colors.text },
  darkBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  darkBtnText: { fontWeight: '600', fontSize: 13.5, color: colors.onPrimary },
  weekCard: {
    marginHorizontal: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekLabel: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  weekValue: { color: colors.textStrong, fontWeight: '800', fontSize: 16, marginTop: 2 },
  weekIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, paddingBottom: spacing.md },
  cell: { width: CELL, height: CELL, backgroundColor: colors.skeleton },
  cellImg: { width: '100%', height: '100%' },
  empty: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});

export default ProfileScreen;
