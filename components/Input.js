// Input Component
// Updated with new design system styling

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import {
  colors,
  typography,
  spacing,
  borderRadius,
  componentTokens,
  shadows,
  animation,
} from '../lib/constants';

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * Input component with updated styling
 *
 * @param {Object} props
 * @param {string} props.label - Input label text
 * @param {string} props.value - Input value
 * @param {function} props.onChangeText - Text change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {boolean} props.secureTextEntry - Password input
 * @param {string} props.keyboardType - Keyboard type
 * @param {string} props.autoCapitalize - Auto capitalize setting
 * @param {string} props.autoComplete - Auto complete setting
 * @param {boolean} props.editable - Whether input is editable
 * @param {boolean} props.multiline - Multi-line input
 * @param {number} props.numberOfLines - Number of lines for multiline
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 * @param {React.ReactNode} props.rightIcon - Icon on the right
 * @param {Object} props.style - Additional container styles
 */
export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusAnimation = useSharedValue(0);

  const tokens = componentTokens.input;

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: animation.duration.fast });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: animation.duration.fast });
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [tokens.borderColor, tokens.focusBorderColor]
    );

    return {
      borderColor,
    };
  });

  const focusGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: focusAnimation.value * 0.15,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <AnimatedView
        style={[
          styles.inputContainer,
          animatedContainerStyle,
          error && styles.errorBorder,
          !editable && styles.disabled,
          multiline && styles.multiline,
        ]}
      >
        {/* Focus glow effect */}
        {isFocused && (
          <Animated.View style={[styles.focusGlow, focusGlowStyle]} />
        )}

        {leftIcon && (
          <View style={styles.leftIcon}>{leftIcon}</View>
        )}

        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={tokens.placeholderColor}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.accent}
          {...props}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={8}
            style={styles.eyeButton}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textTertiary}
            />
          </Pressable>
        )}

        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </AnimatedView>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const tokens = componentTokens.input;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.background,
    borderRadius: tokens.borderRadius,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.borderColor,
    overflow: 'hidden',
    position: 'relative',
  },
  focusGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accent,
    borderRadius: tokens.borderRadius,
  },
  errorBorder: {
    borderColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.bgTertiary,
  },
  multiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: tokens.fontSize,
    color: tokens.textColor,
    paddingVertical: tokens.paddingVertical,
    paddingHorizontal: tokens.paddingHorizontal,
    lineHeight: typography.body.lineHeight,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  leftIcon: {
    paddingLeft: tokens.paddingHorizontal,
  },
  rightIcon: {
    paddingRight: tokens.paddingHorizontal,
  },
  eyeButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginLeft: spacing.xs,
  },
});

export default Input;
