import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import { colors, spacing, radius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;
type Tab = 'friends' | 'global';

interface Row {
  name: string;
  pts: number;
  delta: string;
  you?: boolean;
}

// Placeholder standings — the Friends/Global leaderboard needs a real backend
// endpoint (per-photo leaderboards exist today; aggregate ranking does not).
// See PRD §22. Wire these to that endpoint when it lands.
const FRIENDS: Row[] = [
  { name: 'sofia.rt', pts: 128940, delta: '+1' },
  { name: 'kenji.m', pts: 96110, delta: '0' },
  { name: 'marco.viajes', pts: 48210, delta: '+2', you: true },
  { name: 'amara_k', pts: 37600, delta: '-1' },
  { name: 'theo.frames', pts: 29450, delta: '+3' },
  { name: 'yuki.snaps', pts: 21980, delta: '0' },
  { name: 'dan.explore', pts: 15340, delta: '-2' },
];
const GLOBAL: Row[] = [
  { name: 'wanderlei', pts: 412300, delta: '0' },
  { name: 'globe_trotter', pts: 388120, delta: '+1' },
  { name: 'sofia.rt', pts: 128940, delta: '+4' },
  { name: 'mika.k', pts: 119880, delta: '-1' },
  { name: 'kenji.m', pts: 96110, delta: '0' },
  { name: 'atlas.io', pts: 81240, delta: '+2' },
  { name: 'pin_dropper', pts: 74650, delta: '-3' },
  { name: 'lena.wander', pts: 66120, delta: '+1' },
  { name: 'marco.viajes', pts: 48210, delta: '+2', you: true },
];

function medalStyle(rank: number) {
  if (rank === 1) return { backgroundColor: colors.medalGold, color: '#3a2e00' };
  if (rank === 2) return { backgroundColor: colors.medalSilver, color: '#2a2f36' };
  if (rank === 3) return { backgroundColor: colors.medalBronze, color: '#3a1f00' };
  return { backgroundColor: 'transparent', color: colors.textMuted };
}

function deltaColor(delta: string) {
  if (delta.startsWith('+')) return colors.deltaPositive;
  if (delta.startsWith('-')) return colors.deltaNegative;
  return colors.textMuted;
}

const LeaderboardScreen: React.FC<Props> = ({ navigation }) => {
  const [tab, setTab] = useState<Tab>('friends');
  const rows = tab === 'friends' ? FRIENDS : GLOBAL;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.tabs}>
        {(['friends', 'global'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'friends' ? 'Friends' : 'Global'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {rows.map((r, i) => {
          const rank = i + 1;
          const medal = medalStyle(rank);
          return (
            <View key={`${r.name}-${i}`} style={[styles.row, r.you && styles.rowYou]}>
              <View style={[styles.rankBadge, { backgroundColor: medal.backgroundColor }]}>
                <Text style={[styles.rankText, { color: medal.color }]}>{rank}</Text>
              </View>
              <View style={styles.avatar} />
              <Text style={styles.name}>{r.name}</Text>
              <Text style={[styles.delta, { color: deltaColor(r.delta) }]}>{r.delta}</Text>
              <Text style={styles.pts}>{r.pts.toLocaleString()}</Text>
            </View>
          );
        })}
      </ScrollView>
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
  title: { fontSize: 18, fontWeight: '700', color: colors.textStrong },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: '#F0F0F0',
    borderRadius: 11,
    padding: 4,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 8 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontWeight: '600', fontSize: 14, color: colors.textMuted },
  tabTextActive: { color: colors.onPrimary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowYou: { backgroundColor: colors.accentSoft },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontWeight: '700', fontSize: 13 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.avatar },
  name: { flex: 1, fontWeight: '600', fontSize: 14.5, color: colors.textStrong },
  delta: { fontSize: 12, fontWeight: '600', marginRight: spacing.sm },
  pts: { fontWeight: '700', fontSize: 14.5, color: colors.textStrong },
});

export default LeaderboardScreen;
