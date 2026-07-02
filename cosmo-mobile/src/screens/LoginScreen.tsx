import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootState, AppDispatch } from '../store';
import { login, clearError } from '../store/slices/authSlice';
import { RootStackParamList } from '../../App';
import { colors, spacing, radius, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) navigation.replace('Onboarding');
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (error && hasAttemptedLogin) Alert.alert('Login Error', error);
  }, [error, hasAttemptedLogin]);

  const handleLogin = () => {
    if (!email.trim()) return Alert.alert('Error', 'Email is required');
    if (!password) return Alert.alert('Error', 'Password is required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return Alert.alert('Error', 'Please enter a valid email address');
    setHasAttemptedLogin(true);
    dispatch(login({ email, password }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.brand}>gaea</Text>
          <Text style={styles.tagline}>Guess the world, one photo at a time.</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username or email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              testID="email-input"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="password-input"
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              testID="login-button"
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.buttonText}>Log in</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.forgot}>Forgot password?</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            New here?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
              Create account
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fonts.brand,
    fontSize: 46,
    fontWeight: '700',
    color: colors.textStrong,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14.5,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  form: { width: '100%', marginTop: 36, gap: spacing.md },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
  forgot: { color: colors.textMuted, fontSize: 13, marginTop: 18 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    padding: 18,
    alignItems: 'center',
  },
  footerText: { fontSize: 14, color: colors.text },
  footerLink: { color: colors.accent, fontWeight: '700' },
});

export default LoginScreen;
