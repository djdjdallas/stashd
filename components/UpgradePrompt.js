import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, FREE_TIER_LIMIT } from '../lib/constants';

export function UsageBadge({ savesThisMonth, isPro }) {
  if (isPro) return null;

  const percentage = (savesThisMonth / FREE_TIER_LIMIT) * 100;
  const isWarning = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <View style={[
      styles.badge,
      isWarning && styles.badgeWarning,
      isAtLimit && styles.badgeError,
    ]}>
      <Text style={styles.badgeText}>
        {savesThisMonth}/{FREE_TIER_LIMIT} saves
      </Text>
    </View>
  );
}

export function UpgradePrompt({ visible, onClose, onUpgrade }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.iconContainer}>
            <Ionicons name="rocket" size={48} color={colors.amber500} />
          </View>

          <Text style={styles.title}>Upgrade to Pro</Text>
          <Text style={styles.description}>
            You've reached your free tier limit of {FREE_TIER_LIMIT} saves this month.
            Upgrade to Pro for unlimited saves!
          </Text>

          <View style={styles.features}>
            <FeatureItem text="Unlimited saves" />
            <FeatureItem text="Priority AI processing" />
            <FeatureItem text="Advanced search filters" />
            <FeatureItem text="Export capabilities" />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.upgradeButton,
              pressed && styles.pressed,
            ]}
            onPress={onUpgrade}
          >
            <Text style={styles.upgradeText}>Upgrade - $9/month</Text>
          </Pressable>

          <Pressable onPress={onClose}>
            <Text style={styles.maybeLater}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function FeatureItem({ text }) {
  return (
    <View style={styles.feature}>
      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export function UpgradeBanner({ onPress, remaining }) {
  if (remaining > 10) return null;

  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <View style={styles.bannerContent}>
        <Ionicons name="warning" size={20} color={colors.warning} />
        <Text style={styles.bannerText}>
          {remaining === 0
            ? 'You\'ve reached your monthly limit'
            : `Only ${remaining} saves left this month`}
        </Text>
      </View>
      <Text style={styles.bannerAction}>Upgrade</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.bgTertiary,
  },
  badgeWarning: {
    backgroundColor: colors.warning + '20',
  },
  badgeError: {
    backgroundColor: colors.error + '20',
  },
  badgeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.amber500 + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  features: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: colors.amber500,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  upgradeText: {
    ...typography.body,
    color: colors.bgPrimary,
    fontWeight: '700',
  },
  maybeLater: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  bannerAction: {
    ...typography.bodySmall,
    color: colors.amber500,
    fontWeight: '600',
  },
});

export default UpgradePrompt;
