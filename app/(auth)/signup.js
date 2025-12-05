// Signup Screen
// Updated with Stashd Design System v2.0

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { useShareIntentContext } from 'expo-share-intent';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  gradients,
} from '../../lib/constants';

export default function SignupScreen() {
  const { signUp, loading, error } = useAuth();
  const { hasShareIntent, shareIntent } = useShareIntentContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignup = async () => {
    setLocalError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }

    if (!password) {
      setLocalError('Password is required');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const { error: signUpError, data } = await signUp(email.trim(), password);

    if (signUpError) {
      setLocalError(signUpError.message || 'Sign up failed');
    } else {
      // Check if email confirmation is required
      if (data?.user && !data?.session) {
        setSuccessMessage('Please check your email to confirm your account');
      } else {
        // Check if there's a pending share intent to process
        if (hasShareIntent && shareIntent?.files?.length > 0) {
          router.replace('/share-process');
        } else {
          router.replace('/(tabs)');
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Logo */}
          <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={gradients.primary.colors}
                start={gradients.primary.start}
                end={gradients.primary.end}
                style={styles.logoGradient}
              >
                <Ionicons name="layers" size={32} color={colors.textInverse} />
              </LinearGradient>
            </View>
            <Text style={styles.logo}>Stashd</Text>
            <Text style={styles.tagline}>
              Organize your content inspiration with AI
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.form}
          >
            <Text style={styles.title}>Create account</Text>

            {(localError || error) && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.errorContainer}
              >
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{localError || error}</Text>
              </Animated.View>
            )}

            {successMessage && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.successContainer}
              >
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.successText}>{successMessage}</Text>
              </Animated.View>
            )}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoComplete="email"
              leftIcon={
                <Ionicons name="mail-outline" size={20} color={colors.textTertiary} />
              }
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              autoComplete="new-password"
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
              }
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="new-password"
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
              }
            />

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              variant="primary"
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={styles.link}>Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    ...typography.display,
    fontSize: 42,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  form: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.error}15`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
    gap: spacing.sm,
  },
  successText: {
    ...typography.bodySmall,
    color: colors.success,
    flex: 1,
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
});
