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

/** Distance formatting mirrors the prototype's distLabel. */
function distanceLabelFromMeters(m: number): string {
  const mi = m / 1609.344;
  if (mi < 0.1) return `${Math.round(m)} m`;
  const num = mi < 10 ? mi.toFixed(1) : Math.round(mi).toLocaleString();
  return `${num} miles`;
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
  /** The post's photo, shown as a circular thumbnail on the overlay. */
  thumbUri?: string;
  /** The poster's hint, shown as a chip on the distance page. */
  hint?: string;
  onClose: () => void;
}

/**
 * Post-guess overlay — a dark, full-bleed result surface matching the prototype's
 * accuracy screens:
 *  page 0: two-pin distance map + "how far off" line
 *  page 1: points earned under an arc
 * "See leaderboard" flips to this post's leaderboard. Swipe or tap the dots to page.
 */
const GuessResult: React.FC<GuessResultProps> = ({ result, thumbUri, hint, onClose }) => {
  const [page, setPage] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const actual = { latitude: result.actual_lat, longitude: result.actual_lng };
  const guess = { latitude: result.guess_lat, longitude: result.guess_lng };
  const distanceLabel = distanceLabelFromMeters(result.distance_m);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH));
  };

  if (showLeaderboard) {
    return (
      <View style={styles.lbOverlay}>
        <View style={styles.lbHeader}>
          <TouchableOpacity onPress={() => setShowLeaderboard(false)} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.lbTitle}>Leaderboard</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          {result.leaderboard.length === 0 ? (
            <Text style={styles.emptyLb}>No guesses yet.</Text>
          ) : (
            result.leaderboard.map((entry) => (
              <View key={entry.user_id} style={styles.lbRow}>
                <Text style={styles.rank}>{entry.position}</Text>
                <Image
                  source={{ uri: entry.avatar_url || 'https://via.placeholder.com/40' }}
                  style={styles.lbAvatar}
                />
                <Text style={styles.lbName}>{entry.username}</Text>
                <Text style={styles.lbPoints}>{entry.points.toLocaleString()}</Text>
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
      <Ionicons name="arrow-forward" size={16} color="#fff" />
    </TouchableOpacity>
  );

  const Title = <Text style={styles.title}>NICE GUESS!</Text>;
  const DistanceLine = (
    <Text style={styles.distanceText}>
      Your guess was <Text style={styles.distanceStrong}>{distanceLabel}</Text> from the correct
      location
    </Text>
  );

  return (
    <View style={styles.overlay}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {/* Page 0 — distance on a two-pin map */}
        <View style={styles.page}>
          {Title}
          {hint ? (
            <View style={styles.hintChip}>
              <Ionicons name="bulb-outline" size={14} color="#fff" />
              <Text style={styles.hintText} numberOfLines={1}>
                {hint}
              </Text>
            </View>
          ) : null}
          <View style={styles.resultMapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={regionForPins(actual, guess)}
              scrollEnabled
              zoomEnabled
            >
              <Marker coordinate={guess} title="Your guess" pinColor={colors.pinYourGuess} />
              <Marker coordinate={actual} title="Location" pinColor={colors.pinActual} />
              <Polyline
                coordinates={[guess, actual]}
                strokeColor="#fff"
                strokeWidth={2}
                lineDashPattern={[6, 7]}
              />
            </MapView>
          </View>
          {DistanceLine}
          {LeaderboardCta}
        </View>

        {/* Page 1 — points earned */}
        <View style={styles.page}>
          {Title}
          <View style={styles.scoreBlock}>
            <View style={styles.arc} />
            <Text style={styles.score}>{result.points.toLocaleString()}</Text>
          </View>
          {DistanceLine}
          {LeaderboardCta}
        </View>
      </ScrollView>

      {/* close */}
      <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={8}>
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>

      {/* pagination dots */}
      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.dot, page === i && styles.dotActive]} />
        ))}
      </View>

      {/* photo thumbnail */}
      {thumbUri ? (
        <View style={styles.thumbWrap}>
          <Image source={{ uri: thumbUri }} style={styles.thumb} />
        </View>
      ) : null}
    </View>
  );
};

const OVERLAY_BG = '#141416';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY_BG,
    zIndex: 10,
  },
  close: {
    position: 'absolute',
    top: spacing.lg,
    right: 18,
    zIndex: 20,
  },
  page: {
    width: PAGE_WIDTH,
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    maxWidth: '92%',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  hintText: {
    color: '#fff',
    fontSize: 12.5,
    flexShrink: 1,
  },
  resultMapContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  distanceText: {
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 20,
  },
  distanceStrong: {
    color: '#fff',
    fontWeight: '700',
  },
  scoreBlock: {
    marginTop: 14,
    width: 210,
    height: 118,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  arc: {
    position: 'absolute',
    top: 0,
    width: 184,
    height: 92,
    borderTopLeftRadius: 92,
    borderTopRightRadius: 92,
    borderColor: '#fff',
    borderWidth: 7,
    borderBottomWidth: 0,
  },
  score: {
    fontSize: 52,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    paddingBottom: 6,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.pill,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.8,
    fontSize: 13,
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  thumbWrap: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    zIndex: 20,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  // Leaderboard (white)
  lbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  lbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lbTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textStrong,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rank: {
    width: 22,
    fontWeight: '700',
    color: colors.textMuted,
    fontSize: 14,
  },
  lbAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.avatar,
    marginHorizontal: spacing.md,
  },
  lbName: {
    flex: 1,
    fontWeight: '600',
    color: colors.textStrong,
    fontSize: 14,
  },
  lbPoints: {
    fontWeight: '700',
    color: colors.textStrong,
    fontSize: 14,
  },
  emptyLb: {
    textAlign: 'center',
    color: colors.textMuted,
    padding: spacing.xl,
  },
});

export default GuessResult;
