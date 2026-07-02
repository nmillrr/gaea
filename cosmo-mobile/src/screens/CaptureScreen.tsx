import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { RootState, AppDispatch } from '../store';
import {
  setPhotoUri,
  setLocation,
  setAddress,
  setCaption,
  setHint,
  clearCapture,
  uploadPhoto,
  checkUploadAllowed,
} from '../store/slices/captureSlice';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Capture'>;

/**
 * Capture is camera-only by design — photos must be taken live in-app so a
 * location can be recorded at the shutter and can't be spoofed from the gallery.
 *
 * Stages: camera (live_camera) → processing (photo_processing, while GPS +
 * reverse-geocode resolve) → compose (pre_upload, caption/hint + upload).
 */
type Stage = 'camera' | 'processing' | 'compose';

const CaptureScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    photoUri,
    location,
    address,
    caption,
    hint,
    canUpload,
    nextUploadTime,
    isUploading,
    isCheckingUpload,
    uploadSuccess,
    error,
  } = useSelector((state: RootState) => state.capture);

  const [permission, requestPermission] = useCameraPermissions();
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [stage, setStage] = useState<Stage>('camera');
  const cameraRef = useRef<CameraView | null>(null);

  // Check the once-per-day upload limit and ask for permissions up front.
  useEffect(() => {
    dispatch(checkUploadAllowed());
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
      const loc = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(loc.status === 'granted');
    })();
    return () => {
      dispatch(clearCapture());
    };
  }, [dispatch]);

  // Leave the screen once the upload succeeds.
  useEffect(() => {
    if (uploadSuccess) {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Feed');
    }
  }, [uploadSuccess, navigation]);

  useEffect(() => {
    if (error) Alert.alert('Error', error);
  }, [error]);

  /** Capture the photo, then collect + reverse-geocode the location. */
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;
      dispatch(setPhotoUri(photo.uri));
      setStage('processing');
      await collectLocation();
      setStage('compose');
    } catch (err) {
      console.error('Error taking picture:', err);
      Alert.alert('Error', 'Failed to take picture');
      setStage('camera');
    }
  };

  const collectLocation = async () => {
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      dispatch(setLocation(current));
      try {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
        if (place) {
          const line1 = [place.name || place.street, place.city].filter(Boolean).join(', ');
          const line2 = [place.region, place.postalCode, place.country]
            .filter(Boolean)
            .join(', ');
          dispatch(setAddress([line1, line2].filter(Boolean).join('\n')));
        }
      } catch {
        // Reverse geocoding is best-effort; coordinates are what matter.
      }
    } catch (err) {
      console.error('Error getting location:', err);
      Alert.alert(
        'Location Error',
        'Unable to get your location. Make sure location services are enabled.',
      );
    }
  };

  const handleUpload = () => {
    if (!photoUri || !location) {
      Alert.alert('Error', 'Photo or location data is missing');
      return;
    }
    dispatch(
      uploadPhoto({
        photoUri,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        caption: caption.trim() || undefined,
        hint: hint.trim() || undefined,
      }),
    );
  };

  // ---- Gating / loading states -------------------------------------------

  if (isCheckingUpload) {
    return (
      <View style={styles.fullCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!canUpload && nextUploadTime) {
    const formatted = format(new Date(nextUploadTime), 'MMM dd, yyyy h:mm a');
    return (
      <View style={styles.gateContainer}>
        <Text style={styles.gateTitle}>Daily Upload Limit Reached</Text>
        <Text style={styles.gateText}>You can post one photo per day. Next post:</Text>
        <Text style={styles.gateHighlight}>{formatted}</Text>
        <TouchableOpacity style={styles.darkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.darkButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (permission === null || locationGranted === null) {
    return (
      <View style={styles.fullCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted || !locationGranted) {
    return (
      <View style={styles.gateContainer}>
        <Text style={styles.gateText}>
          Camera and location access are required to post on Gaea.
        </Text>
        <TouchableOpacity style={styles.darkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.darkButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- Processing (photo_processing) -------------------------------------

  if (stage === 'processing' && photoUri) {
    return (
      <SafeAreaView style={styles.darkScreen}>
        <View style={styles.processingWrap}>
          <Image source={{ uri: photoUri }} style={styles.processingImage} />
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Tagging your location…</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Compose (pre_upload) ----------------------------------------------

  if (stage === 'compose' && photoUri) {
    return (
      <SafeAreaView style={styles.lightScreen}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.composeHeader}>
            <TouchableOpacity onPress={() => setStage('camera')} hitSlop={8}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.composeTitle}>New post</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView contentContainerStyle={styles.composeBody} keyboardShouldPersistTaps="handled">
            <Image source={{ uri: photoUri }} style={styles.composeImage} />

            <View style={styles.fieldRow}>
              <Ionicons name="location-sharp" size={18} color={colors.text} />
              <Text style={styles.addressText}>
                {address ||
                  (location
                    ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
                    : 'Locating…')}
              </Text>
            </View>

            <View style={styles.fieldRow}>
              <Ionicons name="pencil" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Write a caption…"
                placeholderTextColor={colors.textMuted}
                value={caption}
                onChangeText={(t) => dispatch(setCaption(t))}
                maxLength={200}
                multiline
              />
            </View>

            <View style={styles.fieldRow}>
              <Ionicons name="bulb-outline" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Add a hint for guessers…"
                placeholderTextColor={colors.textMuted}
                value={hint}
                onChangeText={(t) => dispatch(setHint(t))}
                maxLength={200}
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.disabledButton]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.uploadButtonText}>Share to Gaea</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ---- Camera (live_camera) ----------------------------------------------

  return (
    <View style={styles.darkScreen}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      <SafeAreaView style={styles.cameraUi} pointerEvents="box-none">
        <View style={styles.cameraTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            hitSlop={8}
          >
            <Ionicons name="camera-reverse-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraBottom}>
          <TouchableOpacity style={styles.shutter} onPress={takePicture} activeOpacity={0.8}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullCenter: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  lightScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Gate / permission screens
  gateContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  gateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.text,
    textAlign: 'center',
  },
  gateText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  gateHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  darkButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  darkButtonText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  // Camera UI
  cameraUi: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  cameraBottom: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  shutter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  // Processing
  processingWrap: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  processingImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    resizeMode: 'cover',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '500',
  },
  // Compose
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  composeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  composeBody: {
    padding: spacing.lg,
  },
  composeImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    backgroundColor: colors.skeleton,
    marginBottom: spacing.lg,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },
  uploadButton: {
    margin: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CaptureScreen;
