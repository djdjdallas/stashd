// Card Component
// Flexible card component with multiple variants

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  colors,
  spacing,
  shadows,
  componentTokens,
  animation,
} from '../../lib/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Card component with multiple variants
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {'default' | 'elevated' | 'interactive'} props.variant - Card style variant
 * @param {function} props.onPress - Press handler (makes card interactive)
 * @param {boolean} props.disabled - Disable press interaction
 * @param {Object} props.style - Additional container styles
 * @param {Object} props.contentStyle - Additional content container styles
 */
export function Card({
  children,
  variant = 'default',
  onPress,
  disabled = false,
  style,
  contentStyle,
}) {
  const scale = useSharedValue(1);
  const tokens = componentTokens.card[variant] || componentTokens.card.default;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(animation.press.scale, animation.spring.default);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.default);
  };

  const handlePress = () => {
    if (disabled) return;

    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onPress) {
      onPress();
    }
  };

  const cardStyle = getCardStyle(variant);

  // Interactive cards or cards with onPress use Pressable
  if (onPress || variant === 'interactive') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[animatedStyle, cardStyle, disabled && styles.disabled, style]}
        accessibilityRole="button"
      >
        <View style={contentStyle}>{children}</View>
      </AnimatedPressable>
    );
  }

  // Non-interactive cards use View
  return (
    <View style={[cardStyle, style]}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

function getCardStyle(variant) {
  const tokens = componentTokens.card;

  switch (variant) {
    case 'elevated':
      return {
        backgroundColor: tokens.elevated.background,
        borderRadius: tokens.elevated.borderRadius,
        padding: tokens.elevated.padding,
        ...shadows.md,
      };
    case 'interactive':
      return {
        backgroundColor: tokens.interactive.background,
        borderRadius: tokens.interactive.borderRadius,
        padding: tokens.interactive.padding,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
      };
    case 'default':
    default:
      return {
        backgroundColor: tokens.default.background,
        borderRadius: tokens.default.borderRadius,
        padding: tokens.default.padding,
        borderWidth: tokens.default.borderWidth,
        borderColor: tokens.default.borderColor,
      };
  }
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

/**
 * Card.Header - Header section of a card
 */
Card.Header = function CardHeader({ children, style }) {
  return (
    <View style={[headerStyles.container, style]}>
      {children}
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
});

/**
 * Card.Body - Body section of a card
 */
Card.Body = function CardBody({ children, style }) {
  return (
    <View style={style}>
      {children}
    </View>
  );
};

/**
 * Card.Footer - Footer section of a card
 */
Card.Footer = function CardFooter({ children, style }) {
  return (
    <View style={[footerStyles.container, style]}>
      {children}
    </View>
  );
};

const footerStyles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
});

/**
 * Card.Divider - Horizontal divider within a card
 */
Card.Divider = function CardDivider({ style }) {
  return (
    <View style={[dividerStyles.divider, style]} />
  );
};

const dividerStyles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.md,
  },
});

export default Card;
