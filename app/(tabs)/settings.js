// Settings Screen
// Updated with Stashd Design System v2.0

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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { UpgradePrompt } from '../../components/UpgradePrompt';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  gradients,
  componentTokens,
  FREE_TIER_LIMIT,
} from '../../lib/constants';

const listItemTokens = componentTokens.listItem;

function SettingsItem({ icon, title, subtitle, onPress, showArrow = true, danger = false }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? colors.error : colors.textPrimary}
        />
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

function SectionHeader({ title }) {
  return (
    <Text style={styles.sectionTitle}>{title}</Text>
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
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  }, []);

  const handleUpgrade = useCallback(() => {
    setShowUpgrade(false);
    Alert.alert('Coming Soon', 'Subscription management will be available soon.');
  }, []);

  const getProgressVariant = () => {
    if (usagePercentage >= 100) return 'danger';
    if (usagePercentage >= 80) return 'warning';
    return 'default';
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.section}
        >
          <SectionHeader title="Account" />
          <View style={styles.card}>
            <View style={styles.accountInfo}>
              <LinearGradient
                colors={gradients.primary.colors}
                start={gradients.primary.start}
                end={gradients.primary.end}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </Text>
              </LinearGradient>
              <View style={styles.accountDetails}>
                <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planText}>
                    {isPro ? 'Pro Plan' : 'Free Plan'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Usage Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.section}
        >
          <SectionHeader title="Usage" />
          <View style={styles.card}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageTitle}>Monthly Saves</Text>
              <Text style={styles.usageCount}>
                {savesThisMonth}/{isPro ? '∞' : FREE_TIER_LIMIT}
              </Text>
            </View>
            {!isPro && (
              <>
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={Math.min(usagePercentage, 100)}
                    variant={getProgressVariant()}
                    size="default"
                    showGradient={usagePercentage < 80}
                  />
                </View>
                <Pressable
                  style={styles.upgradeButton}
                  onPress={() => setShowUpgrade(true)}
                >
                  <Ionicons name="rocket" size={16} color={colors.accent} />
                  <Text style={styles.upgradeText}>Upgrade to Pro</Text>
                </Pressable>
              </>
            )}
          </View>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.section}
        >
          <SectionHeader title="Preferences" />
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
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.section}
        >
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
        </Animated.View>

        {/* Version */}
        <Animated.View
          entering={FadeIn.delay(400).duration(400)}
        >
          <Text style={styles.version}>Stashd v1.0.0</Text>
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
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
    padding: spacing.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h2,
    color: colors.textInverse,
    fontWeight: '700',
  },
  accountDetails: {
    flex: 1,
  },
  email: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.accent}20`,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  planText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    paddingBottom: spacing.md,
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
  progressContainer: {
    paddingHorizontal: spacing.base,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  upgradeText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: listItemTokens.paddingVertical,
    paddingHorizontal: listItemTokens.paddingHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: listItemTokens.separatorColor,
  },
  pressed: {
    backgroundColor: listItemTokens.pressedBackground,
  },
  iconContainer: {
    width: listItemTokens.iconContainerSize,
    height: listItemTokens.iconContainerSize,
    borderRadius: listItemTokens.iconContainerRadius,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dangerIconContainer: {
    backgroundColor: `${colors.error}20`,
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
    marginTop: spacing.xxs,
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  bottomPadding: {
    height: 100,
  },
});
