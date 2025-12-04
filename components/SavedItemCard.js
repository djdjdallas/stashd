import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, categories } from '../lib/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 3) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

export function SavedItemCard({ item, onPress }) {
  const categoryInfo = categories[item.category] || categories.other;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={[styles.badge, { backgroundColor: categoryInfo.color }]}>
          <Ionicons name={categoryInfo.icon} size={12} color="#fff" />
          <Text style={styles.badgeText}>{categoryInfo.label}</Text>
        </View>
      </View>
      {item.extracted_text ? (
        <View style={styles.textPreview}>
          <Text style={styles.previewText} numberOfLines={2}>
            {item.extracted_text}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function SavedItemCardSmall({ item, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.smallContainer,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.smallImage}
        resizeMode="cover"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: colors.bgTertiary,
  },
  overlay: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    right: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  textPreview: {
    padding: spacing.sm,
    backgroundColor: colors.bgSecondary,
  },
  previewText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  smallContainer: {
    width: 100,
    height: 150,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bgTertiary,
  },
});

export default SavedItemCard;
