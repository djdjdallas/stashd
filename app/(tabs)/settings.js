import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { UpgradePrompt } from '../../components/UpgradePrompt';
import { colors, typography, spacing, borderRadius, FREE_TIER_LIMIT } from '../../lib/constants';

function SettingsItem({ icon, title, subtitle, onPress, showArrow = true, danger = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, danger && styles.dangerIcon]}>
        <Ionicons name={icon} size={20} color={danger ? colors.error : colors.textPrimary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { reset } = useApp();
  const {
    savesThisMonth,
    isPro,
    usagePercentage,
    subscription,
    loading: subLoading,
  } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            reset();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }, [signOut, reset]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your saved items. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  }, []);

  const handleUpgrade = useCallback(() => {
    setShowUpgrade(false);
    // TODO: Implement Stripe checkout
    Alert.alert('Coming Soon', 'Subscription management will be available soon.');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.accountInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.accountDetails}>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.plan}>
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Usage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage</Text>
          <View style={styles.card}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageTitle}>Monthly Saves</Text>
              <Text style={styles.usageCount}>
                {savesThisMonth}/{isPro ? '∞' : FREE_TIER_LIMIT}
              </Text>
            </View>
            {!isPro && (
              <>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(usagePercentage, 100)}%` },
                      usagePercentage >= 80 && styles.progressWarning,
                      usagePercentage >= 100 && styles.progressDanger,
                    ]}
                  />
                </View>
                <Pressable
                  style={styles.upgradeButton}
                  onPress={() => setShowUpgrade(true)}
                >
                  <Ionicons name="rocket" size={16} color={colors.amber500} />
                  <Text style={styles.upgradeText}>Upgrade to Pro</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage notification settings"
              onPress={() => {}}
            />
            <SettingsItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help or send feedback"
              onPress={() => {}}
            />
            <SettingsItem
              icon="document-text-outline"
              title="Privacy Policy"
              onPress={() => {}}
            />
            <SettingsItem
              icon="shield-outline"
              title="Terms of Service"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingsItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleSignOut}
              showArrow={false}
            />
            <SettingsItem
              icon="trash-outline"
              title="Delete Account"
              onPress={handleDeleteAccount}
              showArrow={false}
              danger
            />
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>Silo v1.0.0</Text>
      </ScrollView>

      <UpgradePrompt
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={handleUpgrade}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.amber500,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h3,
    color: colors.bgPrimary,
    fontWeight: '700',
  },
  accountDetails: {
    flex: 1,
  },
  email: {
    ...typography.body,
    color: colors.textPrimary,
  },
  plan: {
    ...typography.bodySmall,
    color: colors.amber500,
    marginTop: 2,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  usageTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  usageCount: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.bgTertiary,
    marginHorizontal: spacing.md,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.amber500,
    borderRadius: 3,
  },
  progressWarning: {
    backgroundColor: colors.warning,
  },
  progressDanger: {
    backgroundColor: colors.error,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  upgradeText: {
    ...typography.bodySmall,
    color: colors.amber500,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.bgTertiary,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dangerIcon: {
    backgroundColor: colors.error + '20',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.error,
  },
  itemSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
