import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePreferences, CREATOR_TYPES } from '../context/PreferencesContext';
import { colors, typography, spacing, borderRadius, getCategoriesForType } from '../lib/constants';

// Category display order
const CATEGORY_ORDER = ['video_idea', 'hook', 'thumbnail', 'script', 'analytics', 'visual'];

export function CategorySelectionModal({
  visible,
  imageUri,
  onSelect,
  onSkip,
  onClose,
  currentIndex,
  totalCount,
}) {
  const { creatorType } = usePreferences();

  // Get categories based on creator type (defaults to content_creator)
  const categories = useMemo(() => {
    const categoryConfig = getCategoriesForType(creatorType || CREATOR_TYPES.CONTENT_CREATOR);
    return CATEGORY_ORDER.map(id => categoryConfig[id]).filter(Boolean);
  }, [creatorType]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>What is this?</Text>
            <Text style={styles.subtitle}>
              {currentIndex + 1} of {totalCount}
            </Text>
          </View>

          {/* Image Preview */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
          </View>

          {/* Category Options */}
          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.optionButton,
                  pressed && styles.optionButtonPressed,
                ]}
                onPress={() => onSelect(category.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: category.color + '20' },
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color={category.color}
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionLabel}>{category.label}</Text>
                  <Text style={styles.optionDescription}>
                    {category.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textTertiary}
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel All</Text>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  imageContainer: {
    height: 200,
    backgroundColor: colors.bgPrimary,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    maxHeight: 280,
  },
  optionsContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  optionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  optionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  skipButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default CategorySelectionModal;
