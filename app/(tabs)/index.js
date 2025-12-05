// Home Screen
// Updated with Stashd Design System v2.0

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useSubscription } from '../../hooks/useSubscription';
import { CategoryCard } from '../../components/CategoryCard';
import { SavedItemCardSmall } from '../../components/SavedItemCard';
import { ImportButton } from '../../components/ImportButton';
import { UpgradeBanner, UsageBadge } from '../../components/UpgradePrompt';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import { Badge, CategoryBadge } from '../../components/ui/Badge';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  categories,
} from '../../lib/constants';

export default function HomeScreen() {
  const { user } = useAuth();
  const {
    items,
    categoryCounts,
    loading,
    refreshing,
    fetchItems,
    fetchCategoryCounts,
  } = useApp();
  const { savesThisMonth, isPro, remaining, isAtLimit } = useSubscription();

  useEffect(() => {
    if (user) {
      fetchItems({ refresh: true });
      fetchCategoryCounts();
    }
  }, [user]);

  const handleRefresh = useCallback(() => {
    fetchItems({ refresh: true });
    fetchCategoryCounts();
  }, [fetchItems, fetchCategoryCounts]);

  const handleCategoryPress = useCallback((categoryKey) => {
    router.push(`/category/${categoryKey}`);
  }, []);

  const handleItemPress = useCallback((item) => {
    router.push(`/item/${item.id}`);
  }, []);

  const handleImportPress = useCallback(() => {
    if (isAtLimit) {
      return;
    }
    router.push('/import');
  }, [isAtLimit]);

  const handleUpgradePress = useCallback(() => {
    router.push('/settings');
  }, []);

  const recentItems = items.slice(0, 10);
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const categoryList = Object.entries(categories).map(([key, value]) => ({
    key,
    ...value,
    count: categoryCounts[key] || 0,
  })).filter(cat => cat.count > 0 || cat.key !== 'other');

  if (loading && !refreshing && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with usage */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>Your Swipe File</Text>
            <Text style={styles.subheading}>{totalCount} saves total</Text>
          </View>
          <UsageBadge savesThisMonth={savesThisMonth} isPro={isPro} />
        </Animated.View>

        {/* Upgrade banner if needed */}
        <UpgradeBanner onPress={handleUpgradePress} remaining={remaining} />

        {/* Recent Saves */}
        {recentItems.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Saves</Text>
              <Text style={styles.seeAll}>See all</Text>
            </View>
            <FlatList
              horizontal
              data={recentItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.delay(150 + index * 50).duration(400)}
                >
                  <SavedItemCardSmall
                    item={item}
                    onPress={() => handleItemPress(item)}
                  />
                </Animated.View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            />
          </Animated.View>
        )}

        {/* Categories */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          <View style={styles.categoriesGrid}>
            {categoryList.map((category, index) => (
              <Animated.View
                key={category.key}
                entering={FadeInDown.delay(250 + index * 50).duration(400)}
                style={styles.categoryWrapper}
              >
                <CategoryCard
                  category={category.key}
                  count={category.count}
                  onPress={() => handleCategoryPress(category.key)}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Empty state */}
        {totalCount === 0 && !loading && (
          <Animated.View
            entering={FadeIn.delay(300).duration(500)}
          >
            <EmptyState
              icon={<Ionicons name="images-outline" size={64} color={colors.textTertiary} />}
              title="No saves yet"
              message="Import your first screenshot to get started"
            />
          </Animated.View>
        )}

        {/* Bottom padding for FAB */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <ImportButton onPress={handleImportPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subheading: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  recentList: {
    paddingRight: spacing.base,
    gap: spacing.md,
  },
  categoriesGrid: {
    gap: spacing.md,
  },
  categoryWrapper: {
    marginBottom: spacing.xs,
  },
  bottomPadding: {
    height: 120,
  },
});
