import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '../theme';
import { GuessResult as GuessResultType } from '../api/photoApi';

const { width } = Dimensions.get('window');
const PAGE_WIDTH = width;

function metersToMiles(m: number): string {
  const miles = m / 1609.344;
  if (miles < 0.1) return `${Math.round(m)} m`;
  return `${miles.toFixed(1)} miles`;
}

/** Region that comfortably frames both the guess and the true location. */
function regionForPins(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): Region {
  const latitude = (a.latitude + b.latitude) / 2;
  const longitude = (a.longitude + b.longitude) / 2;
  const latitudeDelta = Math.max(Math.abs(a.latitude - b.latitude) * 1.8, 0.05);
  const longitudeDelta = Math.max(Math.abs(a.longitude - b.longitude) * 1.8, 0.05);
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

interface GuessResultProps {
  result: GuessResultType;
  onClose: () => void;
}

/**
 * Post-guess overlay. Two swipeable pages mirror the guess_accuracy mockups:
 *  1. a two-pin map showing how far the guess was from the truth
 *  2. the points earned, shown as a big number under an arc
 * A "See leaderboard" CTA on either page reveals this post's leaderboard.
 */
const GuessResult: React.FC<GuessResultProps> = ({ result, onClose }) => {
  const [page, setPage] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const actual = { latitude: result.actual_lat, longitude: result.actual_lng };
  const guess = { latitude: result.guess_lat, longitude: result.guess_lng };
  const distanceLabel = metersToMiles(result.distance_m);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH));
  };

  if (showLeaderboard) {
    return (
      <View style={styles.overlay}>
        <View style={styles.leaderboardHeader}>
          <TouchableOpacity onPress={() => setShowLeaderboard(false)} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          {result.leaderboard.length === 0 ? (
            <Text style={styles.emptyLeaderboard}>No guesses yet.</Text>
          ) : (
            result.leaderboard.map((entry) => (
              <View key={entry.user_id} style={styles.leaderboardRow}>
                <Text style={styles.rank}>{entry.position}</Text>
                <Image
                  source={{ uri: entry.avatar_url || 'https://via.placeholder.com/40' }}
                  style={styles.leaderboardAvatar}
                />
                <Text style={styles.leaderboardName}>{entry.username}</Text>
                <Text style={styles.leaderboardPoints}>{entry.points.toLocaleString()}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  const LeaderboardCta = (
    <TouchableOpacity style={styles.cta} onPress={() => setShowLeaderboard(true)}>
      <Text style={styles.ctaText}>SEE LEADERBOARD</Text>
      <Ionicons name="arrow-forward" size={16} color={colors.text} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={8}>
        <Ionicons name="close" size={22} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {/* Page 1 — distance on a two-pin map */}
        <View style={styles.page}>
          <Text style={styles.title}>NICE GUESS!</Text>
          <View style={styles.resultMapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={regionForPins(actual, guess)}
              scrollEnabled
              zoomEnabled
            >
              <Marker coordinate={guess} title="Your guess" pinColor={colors.pinGuess} />
              <Marker coordinate={actual} title="Location" pinColor={colors.pinActual} />
              <Polyline
                coordinates={[guess, actual]}
                strokeColor={colors.text}
                strokeWidth={2}
                lineDashPattern={[6, 6]}
              />
            </MapView>
          </View>
          <Text style={styles.distanceText}>
            Your guess was <Text style={styles.distanceStrong}>{distanceLabel}</Text> from the
            correct location
          </Text>
          {LeaderboardCta}
        </View>

        {/* Page 2 — points earned */}
        <View style={styles.page}>
          <Text style={styles.title}>NICE GUESS!</Text>
          <View style={styles.scoreBlock}>
            <View style={styles.arc} />
            <Text style={styles.score}>{result.points.toLocaleString()}</Text>
          </View>
          <Text style={styles.distanceText}>
            Your guess was <Text style={styles.distanceStrong}>{distanceLabel}</Text> from the
            correct location
          </Text>
          {LeaderboardCta}
        </View>
      </ScrollView>

      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.dot, page === i && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  close: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    zIndex: 20,
  },
  page: {
    width: PAGE_WIDTH,
    paddingHorizontal: spacing.xl,
    paddingTop: 36,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  resultMapContainer: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  distanceText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  distanceStrong: {
    color: colors.text,
    fontWeight: '700',
  },
  scoreBlock: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  arc: {
    position: 'absolute',
    top: 0,
    width: 180,
    height: 90,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    borderColor: colors.border,
    borderWidth: 6,
    borderBottomWidth: 0,
  },
  score: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.textStrong,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  ctaText: {
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontSize: 13,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.text,
  },
  // Leaderboard
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rank: {
    width: 28,
    fontWeight: '700',
    color: colors.textMuted,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.md,
  },
  leaderboardName: {
    flex: 1,
    fontWeight: '600',
    color: colors.text,
  },
  leaderboardPoints: {
    fontWeight: '700',
    color: colors.text,
  },
  emptyLeaderboard: {
    textAlign: 'center',
    color: colors.textMuted,
    padding: spacing.xl,
  },
});

export default GuessResult;
