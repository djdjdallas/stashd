import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getSavedItems } from '../../lib/storage';
import { SavedItemCard } from '../../components/SavedItemCard';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { colors, typography, spacing, categories } from '../../lib/constants';

export default function CategoryScreen() {
  const { name } = useLocalSearchParams();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const categoryInfo = categories[name] || categories.other;

  const fetchItems = useCallback(async (refresh = false) => {
    if (!user) return;

    if (refresh) {
      setRefreshing(true);
    }

    const offset = refresh ? 0 : items.length;
    const result = await getSavedItems(user.id, {
      category: name,
      offset,
      limit: 20,
    });

    if (refresh) {
      setRefreshing(false);
    }
    setLoading(false);

    if (result.success) {
      if (refresh) {
        setItems(result.data);
      } else {
        setItems(prev => [...prev, ...result.data]);
      }
      setHasMore(result.data.length === 20);
    }
  }, [user, name, items.length]);

  useEffect(() => {
    fetchItems(true);
  }, [user, name]);

  const handleRefresh = useCallback(() => {
    fetchItems(true);
  }, [fetchItems]);

  const handleEndReached = useCallback(() => {
    if (!loading && hasMore) {
      fetchItems(false);
    }
  }, [loading, hasMore, fetchItems]);

  const handleItemPress = useCallback((item) => {
    router.push(`/item/${item.id}`);
  }, []);

  const renderItem = useCallback(({ item, index }) => (
    <View style={[styles.cardWrapper, index % 2 === 1 && styles.cardRight]}>
      <SavedItemCard item={item} onPress={() => handleItemPress(item)} />
    </View>
  ), [handleItemPress]);

  const renderEmpty = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    return (
      <EmptyState
        icon={
          <Ionicons
            name={categoryInfo.icon}
            size={64}
            color={categoryInfo.color}
          />
        }
        title={`No ${categoryInfo.label.toLowerCase()} yet`}
        message="Import screenshots and they'll be automatically categorized here"
      />
    );
  };

  const renderFooter = () => {
    if (!loading || items.length === 0) return null;
    return (
      <View style={styles.footer}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: categoryInfo.label,
          headerStyle: {
            backgroundColor: colors.bgPrimary,
          },
        }}
      />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: categoryInfo.color + '20' }]}>
            <Ionicons name={categoryInfo.icon} size={24} color={categoryInfo.color} />
          </View>
          <Text style={styles.count}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.amber500}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  count: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '48%',
  },
  cardRight: {
    marginLeft: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
