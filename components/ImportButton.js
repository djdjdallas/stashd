// ImportButton Component
// Floating action button for importing screenshots

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  colors,
  typography,
  spacing,
  borderRadius,
  gradients,
  shadows,
  animation,
} from '../lib/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Tab bar height to position FAB above it
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

export function ImportButton({ onPress, loading }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, animation.spring.bouncy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.bouncy);
  };

  const handlePress = () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.fabContainer, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
    >
      <LinearGradient
        colors={gradients.primary.colors}
        start={gradients.primary.start}
        end={gradients.primary.end}
        style={[styles.fab, loading && styles.disabled]}
      >
        {loading ? (
          <Ionicons name="sync" size={24} color={colors.textInverse} />
        ) : (
          <Ionicons name="add" size={28} color={colors.textInverse} />
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

export function ImportButtonLarge({ onPress, loading }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(animation.press.scale, animation.spring.default);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.default);
  };

  const handlePress = () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.largeButtonContainer, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
    >
      <LinearGradient
        colors={gradients.primary.colors}
        start={gradients.primary.start}
        end={gradients.primary.end}
        style={[styles.largeButton, loading && styles.disabled]}
      >
        <Ionicons name="images-outline" size={24} color={colors.textInverse} />
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Import Screenshots'}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: TAB_BAR_HEIGHT + spacing.lg,
    ...shadows.lg,
    // Add glow effect
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  largeButtonContainer: {
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    ...shadows.md,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
  },
  largeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    ...typography.button,
    color: colors.textInverse,
    marginLeft: spacing.sm,
  },
});

export default ImportButton;
