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
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useSubscription } from '../../hooks/useSubscription';
import { CategoryCard } from '../../components/CategoryCard';
import { SavedItemCardSmall } from '../../components/SavedItemCard';
import { ImportButton } from '../../components/ImportButton';
import { UpgradeBanner, UsageBadge } from '../../components/UpgradePrompt';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { colors, typography, spacing, categories } from '../../lib/constants';

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
      // Show upgrade prompt
      return;
    }
    router.push('/import');
  }, [isAtLimit]);

  const handleUpgradePress = useCallback(() => {
    // Navigate to settings or show upgrade modal
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
            tintColor={colors.amber500}
          />
        }
      >
        {/* Header with usage */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your Swipe File</Text>
            <Text style={styles.subheading}>{totalCount} saves total</Text>
          </View>
          <UsageBadge savesThisMonth={savesThisMonth} isPro={isPro} />
        </View>

        {/* Upgrade banner if needed */}
        <UpgradeBanner onPress={handleUpgradePress} remaining={remaining} />

        {/* Recent Saves */}
        {recentItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Saves</Text>
            <FlatList
              horizontal
              data={recentItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SavedItemCardSmall
                  item={item}
                  onPress={() => handleItemPress(item)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            />
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {categoryList.map((category) => (
            <CategoryCard
              key={category.key}
              category={category.key}
              count={category.count}
              onPress={() => handleCategoryPress(category.key)}
            />
          ))}
        </View>

        {/* Empty state */}
        {totalCount === 0 && !loading && (
          <EmptyState
            icon={<Ionicons name="images-outline" size={64} color={colors.textTertiary} />}
            title="No saves yet"
            message="Import your first screenshot to get started"
          />
        )}
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
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subheading: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  recentList: {
    paddingRight: spacing.md,
  },
});
