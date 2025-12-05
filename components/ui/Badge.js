// Badge Component
// Category badges and status indicators

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  typography,
  spacing,
  componentTokens,
  categories,
} from '../../lib/constants';

/**
 * Badge component for categories and status indicators
 *
 * @param {Object} props
 * @param {string} props.label - Badge text
 * @param {string} props.color - Primary color (used for text and border)
 * @param {string} props.backgroundColor - Background color override
 * @param {string} props.icon - Ionicons icon name
 * @param {'small' | 'default'} props.size - Badge size
 * @param {string} props.category - Category key (auto-applies color scheme)
 * @param {Object} props.style - Additional container styles
 */
export function Badge({
  label,
  color,
  backgroundColor,
  icon,
  size = 'default',
  category,
  style,
}) {
  // If category is provided, use category colors
  const categoryData = category ? categories[category] : null;
  const badgeColor = color || (categoryData?.color) || colors.neutral;
  const badgeBg = backgroundColor || (categoryData?.background) || `${badgeColor}20`;
  const badgeIcon = icon || (categoryData?.icon);
  const badgeLabel = label || (categoryData?.label) || '';

  const tokens = componentTokens.badge[size] || componentTokens.badge.default;
  const sizeStyles = getSizeStyles(size);

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: badgeBg },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={badgeLabel}
    >
      {badgeIcon && (
        <Ionicons
          name={badgeIcon}
          size={sizeStyles.iconSize}
          color={badgeColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          { color: badgeColor },
        ]}
        numberOfLines={1}
      >
        {badgeLabel}
      </Text>
    </View>
  );
}

function getSizeStyles(size) {
  const tokens = componentTokens.badge;

  switch (size) {
    case 'small':
      return {
        container: {
          paddingVertical: tokens.small.paddingVertical,
          paddingHorizontal: tokens.small.paddingHorizontal,
          borderRadius: tokens.small.borderRadius,
        },
        text: {
          fontSize: tokens.small.fontSize,
          fontWeight: tokens.small.fontWeight,
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        },
        iconSize: 10,
      };
    case 'default':
    default:
      return {
        container: {
          paddingVertical: tokens.default.paddingVertical,
          paddingHorizontal: tokens.default.paddingHorizontal,
          borderRadius: tokens.default.borderRadius,
        },
        text: {
          fontSize: tokens.default.fontSize,
          fontWeight: tokens.default.fontWeight,
        },
        iconSize: 12,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    lineHeight: 16,
  },
});

/**
 * StatusBadge - Semantic status indicators
 */
export function StatusBadge({ status, label, size = 'default' }) {
  const statusColors = {
    success: {
      color: colors.success,
      background: `${colors.success}20`,
      icon: 'checkmark-circle',
    },
    warning: {
      color: colors.warning,
      background: `${colors.warning}20`,
      icon: 'warning',
    },
    error: {
      color: colors.error,
      background: `${colors.error}20`,
      icon: 'close-circle',
    },
    info: {
      color: colors.info,
      background: `${colors.info}20`,
      icon: 'information-circle',
    },
    neutral: {
      color: colors.neutral,
      background: `${colors.neutral}20`,
      icon: 'ellipse',
    },
  };

  const statusConfig = statusColors[status] || statusColors.neutral;

  return (
    <Badge
      label={label || status}
      color={statusConfig.color}
      backgroundColor={statusConfig.background}
      icon={statusConfig.icon}
      size={size}
    />
  );
}

/**
 * CategoryBadge - Convenience wrapper for category badges
 */
export function CategoryBadge({ category, size = 'default', showIcon = true }) {
  const categoryData = categories[category];

  if (!categoryData) {
    return (
      <Badge
        label="Unknown"
        color={colors.neutral}
        size={size}
      />
    );
  }

  return (
    <Badge
      label={categoryData.label}
      color={categoryData.color}
      backgroundColor={categoryData.background}
      icon={showIcon ? categoryData.icon : undefined}
      size={size}
    />
  );
}

export default Badge;
