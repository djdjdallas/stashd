// Silo Theme Provider
// Centralized theme context and utilities for the design system

import React, { createContext, useContext } from 'react';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  componentTokens,
  categories,
  categoryColors,
  gradients,
} from './constants';

// =============================================================================
// THEME OBJECT
// =============================================================================

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  components: componentTokens,
  categories,
  categoryColors,
  gradients,
};

// =============================================================================
// THEME CONTEXT
// =============================================================================

const ThemeContext = createContext(theme);

/**
 * Theme Provider component
 * Wraps the app to provide theme access via context
 */
export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme values
 * @returns {typeof theme} The complete theme object
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// =============================================================================
// GRADIENT UTILITIES
// =============================================================================

/**
 * Get gradient props for LinearGradient component
 * @param {'primary' | 'primaryHorizontal' | 'primaryVertical'} preset - Gradient preset name
 * @returns {Object} Props object for LinearGradient
 */
export function getGradientProps(preset = 'primary') {
  const gradient = gradients[preset] || gradients.primary;
  return {
    colors: gradient.colors,
    start: gradient.start,
    end: gradient.end,
  };
}

/**
 * Create custom gradient configuration
 * @param {string[]} gradientColors - Array of color hex values
 * @param {number} angle - Gradient angle in degrees (0-360)
 * @returns {Object} Props object for LinearGradient
 */
export function createGradient(gradientColors, angle = 135) {
  // Convert angle to start/end points
  const angleRad = (angle * Math.PI) / 180;
  const x = Math.cos(angleRad);
  const y = Math.sin(angleRad);

  return {
    colors: gradientColors,
    start: { x: 0.5 - x / 2, y: 0.5 - y / 2 },
    end: { x: 0.5 + x / 2, y: 0.5 + y / 2 },
  };
}

/**
 * Get primary accent gradient props (lime to teal)
 * @param {'diagonal' | 'horizontal' | 'vertical'} direction - Gradient direction
 * @returns {Object} Props object for LinearGradient
 */
export function getPrimaryGradient(direction = 'diagonal') {
  switch (direction) {
    case 'horizontal':
      return getGradientProps('primaryHorizontal');
    case 'vertical':
      return getGradientProps('primaryVertical');
    case 'diagonal':
    default:
      return getGradientProps('primary');
  }
}

// =============================================================================
// CATEGORY UTILITIES
// =============================================================================

/**
 * Get category by key
 * @param {string} key - Category key (e.g., 'hook', 'video_idea')
 * @returns {Object | undefined} Category object with label, icon, color, etc.
 */
export function getCategory(key) {
  return categories[key];
}

/**
 * Get category color set
 * @param {string} key - Category key
 * @returns {Object} Object with primary, background, and border colors
 */
export function getCategoryColors(key) {
  const category = categories[key];
  if (!category) {
    return {
      primary: colors.neutral,
      background: 'rgba(142, 142, 147, 0.15)',
      border: 'rgba(142, 142, 147, 0.3)',
    };
  }
  return {
    primary: category.color,
    background: category.background,
    border: category.border,
  };
}

/**
 * Get all categories as an array
 * @returns {Array} Array of category objects with their keys
 */
export function getCategoriesArray() {
  return Object.entries(categories).map(([key, value]) => ({
    key,
    ...value,
  }));
}

// =============================================================================
// SHADOW UTILITIES
// =============================================================================

/**
 * Get shadow style object by size
 * @param {'none' | 'sm' | 'md' | 'lg' | 'glow'} size - Shadow size
 * @returns {Object} Shadow style object
 */
export function getShadow(size = 'md') {
  return shadows[size] || shadows.none;
}

/**
 * Create custom glow shadow
 * @param {string} color - Glow color
 * @param {number} radius - Shadow radius
 * @param {number} opacity - Shadow opacity (0-1)
 * @returns {Object} Shadow style object
 */
export function createGlow(color, radius = 12, opacity = 0.3) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: 0,
  };
}

// =============================================================================
// TYPOGRAPHY UTILITIES
// =============================================================================

/**
 * Get typography style object
 * @param {'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'captionSmall' | 'button'} variant - Typography variant
 * @param {string} color - Optional text color override
 * @returns {Object} Typography style object
 */
export function getTypography(variant = 'body', color) {
  const style = typography[variant] || typography.body;
  return {
    ...style,
    color: color || colors.textPrimary,
  };
}

// =============================================================================
// SPACING UTILITIES
// =============================================================================

/**
 * Get spacing value
 * @param {'xxs' | 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'huge' | 'massive'} size - Spacing size
 * @returns {number} Spacing value in pixels
 */
export function getSpacing(size = 'base') {
  return spacing[size] || spacing.base;
}

/**
 * Create padding object from spacing tokens
 * @param {Object} sides - Padding configuration
 * @param {string} sides.top - Top spacing key
 * @param {string} sides.right - Right spacing key
 * @param {string} sides.bottom - Bottom spacing key
 * @param {string} sides.left - Left spacing key
 * @returns {Object} Padding style object
 */
export function createPadding({ top, right, bottom, left, vertical, horizontal, all }) {
  if (all) {
    return { padding: spacing[all] || all };
  }

  const result = {};

  if (vertical) {
    result.paddingVertical = spacing[vertical] || vertical;
  }
  if (horizontal) {
    result.paddingHorizontal = spacing[horizontal] || horizontal;
  }
  if (top) result.paddingTop = spacing[top] || top;
  if (right) result.paddingRight = spacing[right] || right;
  if (bottom) result.paddingBottom = spacing[bottom] || bottom;
  if (left) result.paddingLeft = spacing[left] || left;

  return result;
}

// =============================================================================
// COMPONENT TOKEN UTILITIES
// =============================================================================

/**
 * Get button variant tokens
 * @param {'primary' | 'secondary' | 'ghost' | 'danger'} variant - Button variant
 * @returns {Object} Button token object
 */
export function getButtonTokens(variant = 'primary') {
  return componentTokens.button[variant] || componentTokens.button.primary;
}

/**
 * Get card variant tokens
 * @param {'default' | 'elevated' | 'interactive'} variant - Card variant
 * @returns {Object} Card token object
 */
export function getCardTokens(variant = 'default') {
  return componentTokens.card[variant] || componentTokens.card.default;
}

/**
 * Get input tokens
 * @returns {Object} Input token object
 */
export function getInputTokens() {
  return componentTokens.input;
}

/**
 * Get badge variant tokens
 * @param {'small' | 'default'} size - Badge size
 * @returns {Object} Badge token object
 */
export function getBadgeTokens(size = 'default') {
  return componentTokens.badge[size] || componentTokens.badge.default;
}

// =============================================================================
// ANIMATION UTILITIES
// =============================================================================

/**
 * Get animation duration
 * @param {'instant' | 'fast' | 'normal' | 'slow' | 'verySlow'} speed - Animation speed
 * @returns {number} Duration in milliseconds
 */
export function getAnimationDuration(speed = 'normal') {
  return animation.duration[speed] || animation.duration.normal;
}

/**
 * Get spring configuration for react-native-reanimated
 * @param {'default' | 'bouncy' | 'gentle'} preset - Spring preset
 * @returns {Object} Spring configuration object
 */
export function getSpringConfig(preset = 'default') {
  return animation.spring[preset] || animation.spring.default;
}

// =============================================================================
// STYLE BUILDER UTILITIES
// =============================================================================

/**
 * Build a complete card style
 * @param {'default' | 'elevated' | 'interactive'} variant - Card variant
 * @returns {Object} Complete card style object
 */
export function buildCardStyle(variant = 'default') {
  const tokens = getCardTokens(variant);
  const style = {
    backgroundColor: tokens.background,
    borderRadius: tokens.borderRadius,
    padding: tokens.padding,
  };

  if (variant === 'default') {
    style.borderWidth = tokens.borderWidth;
    style.borderColor = tokens.borderColor;
  }

  if (variant === 'elevated') {
    Object.assign(style, getShadow('md'));
  }

  return style;
}

/**
 * Build a complete input style
 * @param {boolean} isFocused - Whether the input is focused
 * @returns {Object} Complete input style object
 */
export function buildInputStyle(isFocused = false) {
  const tokens = getInputTokens();
  return {
    backgroundColor: tokens.background,
    color: tokens.textColor,
    borderRadius: tokens.borderRadius,
    borderWidth: tokens.borderWidth,
    borderColor: isFocused ? tokens.focusBorderColor : tokens.borderColor,
    paddingVertical: tokens.paddingVertical,
    paddingHorizontal: tokens.paddingHorizontal,
    fontSize: tokens.fontSize,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  theme,
  ThemeContext,
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  componentTokens,
  categories,
  categoryColors,
  gradients,
};

export default theme;
