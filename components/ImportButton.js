import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../lib/constants';

export function ImportButton({ onPress, loading }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        pressed && styles.pressed,
        loading && styles.disabled,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <Ionicons name="sync" size={24} color={colors.bgPrimary} />
      ) : (
        <Ionicons name="add" size={28} color={colors.bgPrimary} />
      )}
    </Pressable>
  );
}

export function ImportButtonLarge({ onPress, loading }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.largeButton,
        pressed && styles.pressed,
        loading && styles.disabled,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      <Ionicons name="images-outline" size={24} color={colors.bgPrimary} />
      <Text style={styles.buttonText}>
        {loading ? 'Processing...' : 'Import Screenshots'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.amber500,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.amber500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  disabled: {
    opacity: 0.7,
  },
  largeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amber500,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  buttonText: {
    ...typography.body,
    color: colors.bgPrimary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default ImportButton;
