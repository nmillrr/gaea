import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import { RootState } from '../store';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Comments'>;

// Placeholder thread — comments need a backend endpoint
// (POST/GET /photos/:id/comments, gated behind hasGuessed). See PRD §22.
const SAMPLE_COMMENTS = [
  { user: 'sofia.rt', text: 'So jealous — this is top of my list now.', time: '12m' },
  { user: 'kenji.m', text: 'Got it in 3.2 mi, brutal reveal at the end.', time: '40m' },
  { user: 'amara_k', text: 'The tilework is unreal in person.', time: '1h' },
  { user: 'theo.frames', text: 'Guessed Lisbon. Way off lol.', time: '2h' },
];

function milesLabel(distanceM: number): string {
  const mi = distanceM / 1609.344;
  if (mi < 0.1) return `${Math.round(distanceM)} m`;
  return `${mi < 10 ? mi.toFixed(1) : Math.round(mi).toLocaleString()} miles`;
}

/**
 * Comments thread for a post (per prototype). Comments are unlocked only after
 * the viewer has guessed; the header note reflects that. Posting is not wired to
 * a backend yet.
 */
const CommentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { photoId } = route.params;
  const post = useSelector((s: RootState) => s.feed.photos.find((p) => p.id === photoId));
  const result = useSelector((s: RootState) => s.guesses.results.data[photoId]);
  const unlockNote = result
    ? `You guessed ${milesLabel(result.distance_m)} away · comments unlocked`
    : 'Comments unlocked';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Comments</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.postBar}>
          <Image source={{ uri: post?.s3_url }} style={styles.postThumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.postCaption} numberOfLines={1}>
              <Text style={styles.bold}>{post?.user.username}</Text> {post?.caption}
            </Text>
            <Text style={styles.unlockNote}>{unlockNote}</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 6 }}>
          {SAMPLE_COMMENTS.map((c, i) => (
            <View key={i} style={styles.commentRow}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.commentText}>
                  <Text style={styles.bold}>{c.user}</Text> {c.text}
                </Text>
                <Text style={styles.meta}>{c.time} · Reply</Text>
              </View>
              <Ionicons name="heart-outline" size={16} color="#C4C4C4" style={{ marginTop: 3 }} />
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <View style={styles.avatarSm} />
          <TextInput
            style={styles.input}
            placeholder="Add a comment…"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.post}>Post</Text>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: { fontWeight: '700', fontSize: 17, color: colors.textStrong },
  postBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  postThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.skeleton },
  postCaption: { fontSize: 13.5, color: colors.text },
  bold: { fontWeight: '700' },
  unlockNote: { color: colors.accent, fontSize: 11.5, fontWeight: '600', marginTop: 3 },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.avatar },
  commentText: { fontSize: 14, color: colors.text, lineHeight: 19 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  avatarSm: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.avatar },
  input: { flex: 1, fontSize: 14.5, color: colors.text },
  post: { color: colors.accent, fontWeight: '700', fontSize: 14 },
});

export default CommentsScreen;
