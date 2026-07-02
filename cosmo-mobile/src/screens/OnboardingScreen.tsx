import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, radius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'camera-outline',
    title: 'Snap where you are',
    body: 'Photos are taken live in-app and tagged with your location automatically — so nobody can fake a spot.',
  },
  {
    icon: 'earth-outline',
    title: 'Guess where they are',
    body: 'Drop a pin anywhere on the world map. The closer your guess, the more points you earn.',
  },
  {
    icon: 'bar-chart-outline',
    title: 'Climb the leaderboard',
    body: 'Beat your friends and the world. Fresh photos to guess every single day.',
  },
];

/** 3-step intro carousel (per prototype). Finishing marks onboarding complete. */
const OnboardingScreen: React.FC<Props> = () => {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);

  const finish = () => completeOnboarding();
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : finish());

  const s = STEPS[step];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={finish} hitSlop={8}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons name={s.icon} size={62} color={colors.accent} />
        </View>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.text}>{s.body}</Text>
      </View>

      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={next} activeOpacity={0.85}>
        <Text style={styles.buttonText}>{step < STEPS.length - 1 ? 'Next' : 'Get started'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  skipRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: 22 },
  skip: { color: colors.textMuted, fontSize: 14 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 42,
  },
  iconCircle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: colors.accentSoftAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.textStrong, textAlign: 'center' },
  text: {
    color: colors.textMuted,
    fontSize: 15.5,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, paddingVertical: 18 },
  dot: { height: 8, width: 8, borderRadius: radius.pill, backgroundColor: colors.border },
  dotActive: { width: 22, backgroundColor: colors.primary },
  button: {
    marginHorizontal: 22,
    marginBottom: 26,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
});

export default OnboardingScreen;
