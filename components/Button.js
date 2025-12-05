// Button Component
// Updated with new design system variants and styling

import React from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  componentTokens,
  gradients,
  animation,
} from '../lib/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Button component with multiple variants
 *
 * @param {Object} props
 * @param {string} props.title - Button text
 * @param {function} props.onPress - Press handler
 * @param {'primary' | 'secondary' | 'ghost' | 'danger'} props.variant - Button style variant
 * @param {'small' | 'medium' | 'large'} props.size - Button size
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable the button
 * @param {React.ReactNode} props.icon - Icon element
 * @param {'left' | 'right'} props.iconPosition - Icon position
 * @param {Object} props.style - Additional container styles
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
}) {
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
    if (disabled || loading) return;

    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onPress) {
      onPress();
    }
  };

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size, variant);
  const isDisabled = disabled || loading;

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.spinnerColor}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </>
      )}
    </View>
  );

  // Primary variant uses gradient
  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[animatedStyle, style]}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled }}
      >
        <LinearGradient
          colors={gradients.primary.colors}
          start={gradients.primary.start}
          end={gradients.primary.end}
          style={[
            styles.base,
            sizeStyles.container,
            { borderRadius: componentTokens.button.primary.borderRadius },
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // Other variants use solid backgrounds
  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

function getVariantStyles(variant) {
  const tokens = componentTokens.button;

  switch (variant) {
    case 'primary':
      return {
        container: {},
        text: { color: colors.textInverse },
        spinnerColor: colors.textInverse,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: tokens.secondary.background,
          borderWidth: tokens.secondary.borderWidth,
          borderColor: tokens.secondary.borderColor,
          borderRadius: tokens.secondary.borderRadius,
        },
        text: { color: tokens.secondary.textColor },
        spinnerColor: colors.textPrimary,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: tokens.ghost.background,
        },
        text: { color: tokens.ghost.textColor },
        spinnerColor: colors.accent,
      };
    case 'danger':
      return {
        container: {
          backgroundColor: tokens.danger.background,
          borderWidth: tokens.danger.borderWidth,
          borderColor: tokens.danger.borderColor,
          borderRadius: tokens.danger.borderRadius,
        },
        text: { color: tokens.danger.textColor },
        spinnerColor: colors.error,
      };
    default:
      return {
        container: {},
        text: { color: colors.textInverse },
        spinnerColor: colors.textInverse,
      };
  }
}

function getSizeStyles(size, variant) {
  const primaryRadius = componentTokens.button.primary.borderRadius;
  const otherRadius = borderRadius.md;

  switch (size) {
    case 'small':
      return {
        container: {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.base,
          minHeight: 44,
          borderRadius: variant === 'primary' ? primaryRadius : otherRadius,
        },
        text: {
          fontSize: 15,
        },
      };
    case 'large':
      return {
        container: {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xxl,
          minHeight: 60,
          borderRadius: variant === 'primary' ? primaryRadius : otherRadius,
        },
        text: {
          fontSize: 18,
        },
      };
    case 'medium':
    default:
      return {
        container: {
          paddingVertical: componentTokens.button.primary.paddingVertical,
          paddingHorizontal: componentTokens.button.primary.paddingHorizontal,
          minHeight: componentTokens.button.primary.minHeight,
          borderRadius: variant === 'primary' ? primaryRadius : otherRadius,
        },
        text: {
          fontSize: typography.button.fontSize,
        },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default Button;
