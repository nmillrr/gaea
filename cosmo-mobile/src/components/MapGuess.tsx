import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius } from '../theme';

/**
 * Zoomed-out world view used as the starting region so the guesser gets no
 * positional bias (per the map_guess mockup).
 */
const WORLD_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 120,
  longitudeDelta: 120,
};

interface MapGuessProps {
  /** Called with the map's current center when the user locks in their guess. */
  onGuess: (coords: { latitude: number; longitude: number }) => void;
  submitting?: boolean;
  /** Optional clue from the poster, shown as a banner over the map. */
  hint?: string;
}

/**
 * Interactive guessing map. A pin is pinned to the screen center (it never
 * moves) while the user pans/zooms the map underneath it, so wherever the pin
 * points when they tap "Guess" is their answer.
 */
const MapGuess: React.FC<MapGuessProps> = ({ onGuess, submitting, hint }) => {
  // Track the map center as the user pans; the visible pin is a static overlay.
  const center = useRef<{ latitude: number; longitude: number }>({
    latitude: WORLD_REGION.latitude,
    longitude: WORLD_REGION.longitude,
  });
  const [ready, setReady] = useState(false);

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={WORLD_REGION}
        onMapReady={() => setReady(true)}
        onRegionChangeComplete={(region) => {
          center.current = { latitude: region.latitude, longitude: region.longitude };
        }}
      />

      {hint ? (
        <View pointerEvents="none" style={styles.hintBanner}>
          <Ionicons name="bulb-outline" size={14} color={colors.onPrimary} />
          <Text style={styles.hintText} numberOfLines={2}>
            {hint}
          </Text>
        </View>
      ) : null}

      {/* Sticky center pin — sits above the map and stays put while panning. */}
      <View pointerEvents="none" style={styles.pinWrap}>
        <Ionicons name="location-sharp" size={40} color={colors.pinGuess} />
      </View>

      {!ready && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      <TouchableOpacity
        style={styles.guessButton}
        onPress={() => onGuess(center.current)}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color={colors.onPrimary} size="small" />
        ) : (
          <Text style={styles.guessButtonText}>Guess</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skeleton,
  },
  hintBanner: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    maxWidth: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26,26,26,0.85)',
  },
  hintText: {
    color: colors.onPrimary,
    fontSize: 13,
    flexShrink: 1,
  },
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    // Nudge up so the pin tip (not its center) rests on the map center.
    paddingBottom: 40,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guessButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 16,
    minWidth: 120,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  guessButtonText: {
    color: colors.onPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default MapGuess;
