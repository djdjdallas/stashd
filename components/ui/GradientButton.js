// GradientButton Component
// Primary CTA button with lime-to-teal gradient background

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
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
  componentTokens,
  gradients,
  animation,
} from '../../lib/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * GradientButton - Primary CTA button with gradient background
 *
 * @param {Object} props
 * @param {string} props.title - Button text
 * @param {function} props.onPress - Press handler
 * @param {boolean} props.loading - Show loading spinner
 * @param {React.ReactNode} props.icon - Icon element to display
 * @param {'left' | 'right'} props.iconPosition - Icon position relative to text
 * @param {boolean} props.disabled - Disable the button
 * @param {Object} props.style - Additional container styles
 * @param {Object} props.textStyle - Additional text styles
 * @param {'small' | 'default' | 'large'} props.size - Button size variant
 */
export function GradientButton({
  title,
  onPress,
  loading = false,
  icon,
  iconPosition = 'right',
  disabled = false,
  style,
  textStyle,
  size = 'default',
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (onPress) {
      onPress();
    }
  };

  const sizeStyles = getSizeStyles(size);
  const isDisabled = disabled || loading;

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
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
          styles.gradient,
          sizeStyles.container,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.textInverse}
          />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <View style={styles.iconLeft}>{icon}</View>
            )}
            <Text
              style={[
                styles.text,
                sizeStyles.text,
                textStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <View style={styles.iconRight}>{icon}</View>
            )}
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

function getSizeStyles(size) {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingVertical: 10,
          paddingHorizontal: 16,
          minHeight: 44,
          borderRadius: 12,
        },
        text: {
          fontSize: 15,
        },
      };
    case 'large':
      return {
        container: {
          paddingVertical: 18,
          paddingHorizontal: 32,
          minHeight: 60,
          borderRadius: 20,
        },
        text: {
          fontSize: 18,
        },
      };
    case 'default':
    default:
      return {
        container: {
          paddingVertical: componentTokens.button.primary.paddingVertical,
          paddingHorizontal: componentTokens.button.primary.paddingHorizontal,
          minHeight: componentTokens.button.primary.minHeight,
          borderRadius: componentTokens.button.primary.borderRadius,
        },
        text: {
          fontSize: typography.button.fontSize,
        },
      };
  }
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.textInverse,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default GradientButton;
