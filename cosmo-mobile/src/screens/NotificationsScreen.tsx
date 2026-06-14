import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SectionList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import { notificationApi, ActivityItem } from '../api/notificationApi';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

interface Section {
  title: string;
  data: ActivityItem[];
}

/** Builds the "username (and N others) guessed/commented on your post" sentence. */
function activityText(item: ActivityItem): React.ReactNode {
  const verb = item.type === 'comment' ? 'commented on your post' : 'guessed on your post';
  return (
    <Text style={styles.itemText}>
      <Text style={styles.actor}>{item.actor.username}</Text>
      {item.others_count > 0 ? (
        <>
          {' and '}
          <Text style={styles.actor}>
            {item.others_count} {item.others_count === 1 ? 'other' : 'others'}
          </Text>
        </>
      ) : null}{' '}
      {verb}
    </Text>
  );
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await notificationApi.getActivity();
      const next: Section[] = [];
      if (data.today.length) next.push({ title: 'Today', data: data.today });
      if (data.earlier.length) next.push({ title: 'Earlier', data: data.earlier });
      setSections(next);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load activity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.row}>
      <Image
        source={{ uri: item.actor.avatar_url || 'https://via.placeholder.com/44' }}
        style={styles.avatar}
      />
      <View style={styles.textWrap}>
        {activityText(item)}
        <Text style={styles.time}>
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </Text>
      </View>
      <Image source={{ uri: item.photo_thumb_url }} style={styles.thumb} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Activity</Text>
        <View style={styles.back} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.muted}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.muted}>No activity yet.</Text>
          <Text style={styles.mutedSmall}>
            When friends guess or comment on your posts, you'll see it here.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: { width: 26 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  muted: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
  mutedSmall: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retry: { marginTop: spacing.lg },
  retryText: { color: colors.text, fontWeight: '600' },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.skeleton,
    marginRight: spacing.md,
  },
  textWrap: { flex: 1 },
  itemText: { fontSize: 14, color: colors.text, lineHeight: 19 },
  actor: { fontWeight: '700' },
  time: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: colors.skeleton,
    marginLeft: spacing.md,
  },
});

export default NotificationsScreen;
