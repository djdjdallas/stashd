import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useShareIntent } from '../hooks/useShareIntent';
import { Button } from '../components/Button';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { CategorySelectionModal } from '../components/CategorySelectionModal';
import { colors, typography, spacing, borderRadius } from '../lib/constants';

/**
 * Share Processing Screen
 * Handles images shared from other apps via the native share sheet.
 * Similar to the Import screen but optimized for external shares.
 */
export default function ShareProcessScreen() {
  const { user } = useAuth();
  const { saveImageWithCategory, fetchItems, fetchCategoryCounts } = useApp();
  const { remaining, isAtLimit, checkCanSave } = useSubscription();
  const { sharedFiles, clearShareIntent, hasShareIntent } = useShareIntent();

  const [processing, setProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Category selection modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processingResults, setProcessingResults] = useState({ success: 0, failed: 0, savedItems: [] });

  // Convert shared files to a format similar to screenshots
  // Ensure file paths have the file:// prefix for proper URI handling
  const filesToProcess = sharedFiles.map((file, index) => {
    let uri = file.path;
    // Add file:// prefix if it's a local path without it
    if (uri && !uri.startsWith('file://') && !uri.startsWith('http')) {
      uri = `file://${uri}`;
    }
    return {
      id: `shared-${index}`,
      uri,
      fileName: file.fileName,
      mimeType: file.mimeType,
    };
  });

  // Start processing when we have files and user is authenticated
  useEffect(() => {
    if (filesToProcess.length > 0 && user && !showCategoryModal && !processing) {
      // Small delay to let the screen render
      const timer = setTimeout(() => {
        setShowCategoryModal(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filesToProcess.length, user]);

  // Handle category selection for current file
  const handleCategorySelect = useCallback(async (category) => {
    const currentFile = filesToProcess[currentFileIndex];

    setShowCategoryModal(false);
    setProcessing(true);

    // Check if we can still save
    const canSave = await checkCanSave();
    if (!canSave.allowed) {
      setProcessing(false);
      Alert.alert(
        'Limit Reached',
        'You have reached your monthly save limit.',
        [
          { text: 'OK' },
          { text: 'Upgrade', onPress: () => setShowUpgrade(true) },
        ]
      );
      finishProcessing();
      return;
    }

    // Process with selected category
    const result = await saveImageWithCategory(currentFile.uri, category);

    if (result.success && result.data) {
      setProcessingResults(prev => ({
        ...prev,
        success: prev.success + 1,
        savedItems: [...prev.savedItems, result.data],
      }));
    } else {
      setProcessingResults(prev => ({ ...prev, failed: prev.failed + 1 }));
    }

    setProcessing(false);

    // Move to next file or finish
    if (currentFileIndex < filesToProcess.length - 1) {
      setCurrentFileIndex(prev => prev + 1);
      setShowCategoryModal(true);
    } else {
      finishProcessing();
    }
  }, [currentFileIndex, filesToProcess, checkCanSave, saveImageWithCategory]);

  // Handle skip - move to next without saving
  const handleSkip = useCallback(() => {
    if (currentFileIndex < filesToProcess.length - 1) {
      setCurrentFileIndex(prev => prev + 1);
    } else {
      setShowCategoryModal(false);
      finishProcessing();
    }
  }, [currentFileIndex, filesToProcess]);

  // Handle cancel all - stop import process
  const handleCancelAll = useCallback(() => {
    setShowCategoryModal(false);
    clearShareIntent();
    router.back();
  }, [clearShareIntent]);

  // Finish processing and show results
  const finishProcessing = useCallback(async () => {
    // Refresh data
    await fetchItems({ refresh: true });
    await fetchCategoryCounts();

    const { success, failed, savedItems } = processingResults;

    // Clear the share intent
    clearShareIntent();

    // If only one item was successfully saved, navigate directly to its detail screen
    if (success === 1 && savedItems.length === 1 && savedItems[0]?.id) {
      router.replace(`/item/${savedItems[0].id}`);
      return;
    }

    // For multiple items or failures, show summary alert
    if (success > 0 || failed > 0) {
      Alert.alert(
        'Import Complete',
        `Successfully saved ${success} item${success !== 1 ? 's' : ''}${failed > 0 ? `. ${failed} failed.` : '.'}`,
        [{ text: 'Done', onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      router.replace('/(tabs)');
    }
  }, [processingResults, fetchItems, fetchCategoryCounts, clearShareIntent]);

  // Render preview of shared files
  const renderFilePreview = useCallback(({ item, index }) => {
    const isActive = index === currentFileIndex;

    return (
      <View style={[styles.previewItem, isActive && styles.previewItemActive]}>
        <Image
          source={{ uri: item.uri }}
          style={styles.previewImage}
          contentFit="cover"
          transition={200}
        />
        {isActive && (
          <View style={styles.activeOverlay}>
            <View style={styles.activeIndicator}>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </View>
        )}
      </View>
    );
  }, [currentFileIndex]);

  // Get current file for modal
  const currentFile = filesToProcess[currentFileIndex];

  // If no files, show empty state
  if (filesToProcess.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Shared Content',
            headerLeft: () => (
              <Pressable onPress={() => router.back()} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            ),
          }}
        />
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Images Shared</Text>
            <Text style={styles.emptyMessage}>
              Share images from other apps to save them here
            </Text>
            <Button
              title="Go Back"
              onPress={() => router.back()}
              style={styles.emptyButton}
            />
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Save to Stash\'d',
          presentation: 'modal',
          headerLeft: () => (
            <Pressable onPress={handleCancelAll} hitSlop={8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {/* Header info */}
        <View style={styles.infoBar}>
          <Ionicons name="share-outline" size={20} color={colors.accent} />
          <Text style={styles.infoText}>
            {filesToProcess.length} image{filesToProcess.length !== 1 ? 's' : ''} shared
            {!isAtLimit && ` (${remaining} saves remaining)`}
          </Text>
        </View>

        {/* Preview grid */}
        <FlatList
          data={filesToProcess}
          keyExtractor={(item) => item.id}
          renderItem={renderFilePreview}
          numColumns={3}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />

        {/* Processing overlay */}
        <LoadingOverlay
          visible={processing}
          message={`Saving ${currentFileIndex + 1} of ${filesToProcess.length}...`}
        />

        {/* Category selection modal */}
        {currentFile && (
          <CategorySelectionModal
            visible={showCategoryModal}
            imageUri={currentFile.uri}
            onSelect={handleCategorySelect}
            onSkip={handleSkip}
            onClose={handleCancelAll}
            currentIndex={currentFileIndex}
            totalCount={filesToProcess.length}
          />
        )}

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
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  grid: {
    padding: spacing.xs,
    flexGrow: 1,
  },
  previewItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: spacing.xs,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.bgSecondary,
  },
  previewItemActive: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${colors.accent}30`,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: spacing.xs,
  },
  activeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
  emptyButton: {
    marginTop: spacing.sm,
  },
});
