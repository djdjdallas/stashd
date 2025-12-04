import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { Button } from '../components/Button';
import { LoadingSpinner, LoadingOverlay } from '../components/LoadingSpinner';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { colors, typography, spacing, borderRadius } from '../lib/constants';

export default function ImportScreen() {
  const { saveImage, fetchItems, fetchCategoryCounts } = useApp();
  const { remaining, isAtLimit, checkCanSave } = useSubscription();
  const { permission, loading, screenshots, fetchScreenshots, requestPermission } = useMediaLibrary();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    initializePermissions();
  }, []);

  const initializePermissions = async () => {
    const hasPermission = permission || await requestPermission();
    if (hasPermission) {
      await fetchScreenshots({ limit: 100 });
    }
  };

  const toggleSelection = useCallback((id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        // Check if adding more would exceed limit
        if (newSet.size >= remaining && !isAtLimit) {
          Alert.alert(
            'Limit Reached',
            `You can only import ${remaining} more items this month on the free plan.`,
            [
              { text: 'OK' },
              { text: 'Upgrade', onPress: () => setShowUpgrade(true) },
            ]
          );
          return prev;
        }
        newSet.add(id);
      }
      return newSet;
    });
  }, [remaining, isAtLimit]);

  const selectAll = useCallback(() => {
    const maxSelect = Math.min(screenshots.length, remaining);
    const newSelection = new Set(
      screenshots.slice(0, maxSelect).map(s => s.id)
    );
    setSelectedIds(newSelection);
  }, [screenshots, remaining]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleImport = useCallback(async () => {
    if (selectedIds.size === 0) return;

    if (isAtLimit) {
      setShowUpgrade(true);
      return;
    }

    setProcessing(true);
    setProcessedCount(0);

    const selectedScreenshots = screenshots.filter(s => selectedIds.has(s.id));
    let successCount = 0;
    let failCount = 0;

    for (const screenshot of selectedScreenshots) {
      // Check if we can still save
      const canSave = await checkCanSave();
      if (!canSave.allowed) {
        Alert.alert(
          'Limit Reached',
          'You have reached your monthly save limit.',
          [
            { text: 'OK' },
            { text: 'Upgrade', onPress: () => setShowUpgrade(true) },
          ]
        );
        break;
      }

      const result = await saveImage(screenshot.uri);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      setProcessedCount(prev => prev + 1);
    }

    setProcessing(false);

    // Refresh data
    await fetchItems({ refresh: true });
    await fetchCategoryCounts();

    if (successCount > 0) {
      Alert.alert(
        'Import Complete',
        `Successfully imported ${successCount} item${successCount !== 1 ? 's' : ''}${failCount > 0 ? `. ${failCount} failed.` : '.'}`,
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } else if (failCount > 0) {
      Alert.alert('Import Failed', 'Failed to import the selected items. Please try again.');
    }
  }, [selectedIds, screenshots, isAtLimit, checkCanSave, saveImage, fetchItems, fetchCategoryCounts]);

  const renderItem = useCallback(({ item }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <Pressable
        style={[styles.imageItem, isSelected && styles.imageItemSelected]}
        onPress={() => toggleSelection(item.id)}
      >
        <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkmark}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
          </View>
        )}
      </Pressable>
    );
  }, [selectedIds, toggleSelection]);

  const renderEmpty = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (!permission) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Permission Required</Text>
          <Text style={styles.emptyMessage}>
            Silo needs access to your photos to import screenshots
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={64} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No Screenshots Found</Text>
        <Text style={styles.emptyMessage}>
          Take some screenshots and they'll appear here
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            selectedIds.size > 0 ? (
              <Pressable onPress={clearSelection} hitSlop={8}>
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            ) : null
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {/* Selection bar */}
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedIds.size} selected
            {!isAtLimit && ` (${remaining} saves remaining)`}
          </Text>
          {screenshots.length > 0 && selectedIds.size < Math.min(screenshots.length, remaining) && (
            <Pressable onPress={selectAll}>
              <Text style={styles.selectAllText}>Select All</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={screenshots}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />

        {/* Import button */}
        {selectedIds.size > 0 && (
          <View style={styles.footer}>
            <Button
              title={`Import ${selectedIds.size} Screenshot${selectedIds.size !== 1 ? 's' : ''}`}
              onPress={handleImport}
              loading={processing}
            />
          </View>
        )}

        <LoadingOverlay
          visible={processing}
          message={`Processing ${processedCount + 1} of ${selectedIds.size}...`}
        />

        <UpgradePrompt
          visible={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => {
            setShowUpgrade(false);
            router.push('/settings');
          }}
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
  cancelText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  clearText: {
    ...typography.body,
    color: colors.amber500,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  selectAllText: {
    ...typography.bodySmall,
    color: colors.amber500,
    fontWeight: '600',
  },
  grid: {
    padding: spacing.xs,
    flexGrow: 1,
  },
  imageItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: spacing.xs,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.bgSecondary,
  },
  imageItemSelected: {
    borderWidth: 3,
    borderColor: colors.amber500,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: spacing.xs,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.amber500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 400,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  permissionButton: {
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgSecondary,
  },
});
