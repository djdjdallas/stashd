// ProgressBar Component
// Animated progress bar with gradient fill

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import {
  colors,
  gradients,
  componentTokens,
  animation,
} from '../../lib/constants';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * ProgressBar component with gradient fill
 *
 * @param {Object} props
 * @param {number} props.progress - Progress value (0-100)
 * @param {boolean} props.animated - Animate progress changes
 * @param {'default' | 'success' | 'warning' | 'danger'} props.variant - Color variant
 * @param {'small' | 'default' | 'large'} props.size - Bar height
 * @param {boolean} props.showGradient - Use gradient fill
 * @param {Object} props.style - Additional container styles
 */
export function ProgressBar({
  progress = 0,
  animated = true,
  variant = 'default',
  size = 'default',
  showGradient = true,
  style,
}) {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    if (animated) {
      progressValue.value = withSpring(clampedProgress, {
        damping: 20,
        stiffness: 100,
      });
    } else {
      progressValue.value = clampedProgress;
    }
  }, [progress, animated]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  const sizeStyles = getSizeStyles(size);
  const variantColors = getVariantColors(variant);

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      <Animated.View style={[styles.fill, animatedFillStyle]}>
        {showGradient && variant === 'default' ? (
          <LinearGradient
            colors={gradients.primaryHorizontal.colors}
            start={gradients.primaryHorizontal.start}
            end={gradients.primaryHorizontal.end}
            style={[styles.gradient, sizeStyles.fill]}
          />
        ) : (
          <View
            style={[
              styles.solidFill,
              sizeStyles.fill,
              { backgroundColor: variantColors.fill },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
}

function getSizeStyles(size) {
  switch (size) {
    case 'small':
      return {
        container: { height: 2, borderRadius: 1 },
        fill: { borderRadius: 1 },
      };
    case 'large':
      return {
        container: { height: 8, borderRadius: 4 },
        fill: { borderRadius: 4 },
      };
    case 'default':
    default:
      return {
        container: {
          height: componentTokens.progressBar.height,
          borderRadius: componentTokens.progressBar.borderRadius,
        },
        fill: { borderRadius: componentTokens.progressBar.borderRadius },
      };
  }
}

function getVariantColors(variant) {
  switch (variant) {
    case 'success':
      return { fill: colors.success };
    case 'warning':
      return { fill: colors.warning };
    case 'danger':
      return { fill: colors.error };
    case 'default':
    default:
      return { fill: colors.accent };
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: componentTokens.progressBar.background,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  solidFill: {
    flex: 1,
  },
});

/**
 * SkeletonLoader - Animated loading placeholder
 */
export function SkeletonLoader({ width, height, borderRadius = 8, style }) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withTiming(1, {
      duration: 1500,
      easing: (t) => t,
    });
    // Loop the animation
    const interval = setInterval(() => {
      shimmerPosition.value = 0;
      shimmerPosition.value = withTiming(1, {
        duration: 1500,
        easing: (t) => t,
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      shimmerPosition.value,
      [0, 0.5, 1],
      [0.3, 0.6, 0.3]
    ),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.bgTertiary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export default ProgressBar;
