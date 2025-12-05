// Item Detail Screen
// Updated with Stashd Design System v2.0

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
  Share,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  categories,
  shadows,
} from '../../lib/constants';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { editItem, removeItem } = useApp();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setItem(data);
      setNote(data.user_note || '');
      setSelectedCategory(data.category);
    } catch (error) {
      console.error('Error fetching item:', error);
      Alert.alert('Error', 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const result = await editItem(id, {
      user_note: note,
      category: selectedCategory,
    });
    setSaving(false);

    if (result.success) {
      setItem(result.data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Changes saved successfully');
    } else {
      Alert.alert('Error', 'Failed to save changes');
    }
  }, [id, note, selectedCategory, editItem]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await removeItem(id, item?.storage_path);
            if (result.success) {
              router.back();
            } else {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  }, [id, item, removeItem]);

  const handleShare = useCallback(async () => {
    if (!item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await Share.share({
        url: item.image_url,
        message: item.extracted_text || 'Check out this screenshot from Stash\'d',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [item]);

  // Share generated content as formatted text
  const handleShareContent = useCallback(async () => {
    if (!item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Build formatted content
    let content = '';
    const categoryLabel = categories[item.category]?.label || item.category;

    // Add title
    if (item.generated_title) {
      content += `📌 ${item.generated_title}\n\n`;
    }

    // Add category header
    content += `Category: ${categoryLabel}\n`;
    if (item.source_platform && item.source_platform !== 'other') {
      content += `Source: ${item.source_platform.charAt(0).toUpperCase() + item.source_platform.slice(1)}\n`;
    }
    content += '\n';

    // Add hook
    if (item.generated_hook) {
      const hookLabel = item.category === 'hook' ? 'Hook' :
                       item.category === 'thumbnail' ? 'Thumbnail Text' :
                       item.category === 'visual' ? 'Mood/Feeling' :
                       item.category === 'analytics' ? 'Key Insight' : 'Hook';
      content += `⚡ ${hookLabel}:\n"${item.generated_hook}"\n\n`;
    }

    // Add outline
    if (item.generated_outline && item.generated_outline.length > 0) {
      const outlineLabel = item.category === 'video_idea' ? 'Video Outline' :
                          item.category === 'hook' ? 'Alternative Hooks' :
                          item.category === 'script' ? 'Script Points' :
                          item.category === 'thumbnail' ? 'Design Elements' :
                          item.category === 'visual' ? 'Visual Techniques' :
                          item.category === 'analytics' ? 'Insights' : 'Key Points';
      content += `📝 ${outlineLabel}:\n`;
      item.generated_outline.forEach((point, index) => {
        content += `${index + 1}. ${point}\n`;
      });
      content += '\n';
    }

    // Add extracted text
    if (item.extracted_text) {
      content += `📄 Extracted Text:\n${item.extracted_text}\n\n`;
    }

    // Add user note
    if (item.user_note) {
      content += `💭 Notes:\n${item.user_note}\n\n`;
    }

    // Add platform recommendation
    if (item.suggested_platform && item.suggested_platform !== 'other') {
      content += `🎯 Recommended Platform: ${item.suggested_platform.charAt(0).toUpperCase() + item.suggested_platform.slice(1)}\n`;
    }

    // Add format
    if (item.suggested_format) {
      content += `📱 Format: ${item.suggested_format === 'short' ? 'Short Form' : 'Long Form'}\n`;
    }

    content += '\n---\nSaved with Stash\'d';

    try {
      await Share.share({
        message: content,
        title: item.generated_title || 'Stash\'d Content',
      });
    } catch (error) {
      console.error('Share content error:', error);
    }
  }, [item]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  const categoryInfo = categories[item.category] || categories.other;
  const hasChanges = note !== (item.user_note || '') || selectedCategory !== item.category;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Fixed header with back/share buttons */}
        <View style={[styles.fixedHeader, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            style={styles.overlayButton}
            onPress={handleBack}
            hitSlop={12}
          >
            <BlurView intensity={60} tint="dark" style={styles.blurButton}>
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </BlurView>
          </Pressable>

          <Pressable
            style={styles.overlayButton}
            onPress={handleShare}
            hitSlop={12}
          >
            <BlurView intensity={60} tint="dark" style={styles.blurButton}>
              <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
            </BlurView>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 60 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
              contentFit="contain"
              transition={300}
            />
          </View>

          {/* Metadata */}
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.metadata}
          >
            <View style={styles.metaRow}>
              <Badge
                category={item.category}
                size="default"
              />
              {item.source_platform && item.source_platform !== 'other' && (
                <View style={styles.platformBadge}>
                  <Text style={styles.platformText}>
                    {item.source_platform.charAt(0).toUpperCase() + item.source_platform.slice(1)}
                  </Text>
                </View>
              )}
              {item.suggested_format && (
                <View style={styles.formatBadge}>
                  <Ionicons
                    name={item.suggested_format === 'short' ? 'time-outline' : 'film-outline'}
                    size={12}
                    color={colors.accent}
                  />
                  <Text style={styles.formatText}>
                    {item.suggested_format === 'short' ? 'Short Form' : 'Long Form'}
                  </Text>
                </View>
              )}
            </View>

            {item.ai_confidence > 0 && (
              <Text style={styles.confidence}>
                AI Confidence: {Math.round(item.ai_confidence * 100)}%
              </Text>
            )}

            <Text style={styles.date}>
              Saved {new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </Animated.View>

          {/* Generated Title */}
          {item.generated_title && (
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Generated Title</Text>
              <View style={styles.titleBox}>
                <Text style={styles.generatedTitle}>{item.generated_title}</Text>
              </View>
            </Animated.View>
          )}

          {/* Generated Hook */}
          {item.generated_hook && (
            <Animated.View
              entering={FadeInDown.delay(150).duration(400)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>
                {item.category === 'hook' ? 'Main Hook' :
                 item.category === 'thumbnail' ? 'Thumbnail Text' :
                 item.category === 'visual' ? 'Mood / Feeling' :
                 item.category === 'analytics' ? 'Key Insight' :
                 'Hook'}
              </Text>
              <View style={styles.hookBox}>
                <Ionicons
                  name={
                    item.category === 'thumbnail' ? 'text' :
                    item.category === 'visual' ? 'color-palette' :
                    item.category === 'analytics' ? 'trending-up' :
                    'flash'
                  }
                  size={18}
                  color={colors.accent}
                  style={styles.hookIcon}
                />
                <Text style={styles.hookText}>{item.generated_hook}</Text>
              </View>
            </Animated.View>
          )}

          {/* Outline */}
          {item.generated_outline && item.generated_outline.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>
                {item.category === 'video_idea' ? 'Video Outline' :
                 item.category === 'hook' ? 'Alternative Hooks' :
                 item.category === 'script' ? 'Script Points' :
                 item.category === 'thumbnail' ? 'Design Elements' :
                 item.category === 'visual' ? 'Visual Techniques' :
                 item.category === 'analytics' ? 'Insights' :
                 'Key Points'}
              </Text>
              <View style={styles.outlineBox}>
                {item.generated_outline.map((point, index) => (
                  <View key={index} style={styles.outlineItem}>
                    <View style={[
                      styles.outlineNumber,
                      { backgroundColor: categoryInfo.color },
                    ]}>
                      {item.category === 'hook' ? (
                        <Ionicons name="flash" size={12} color="#fff" />
                      ) : (
                        <Text style={styles.outlineNumberText}>{index + 1}</Text>
                      )}
                    </View>
                    <Text style={styles.outlineText}>{point}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Suggested Platform */}
          {item.suggested_platform && item.suggested_platform !== 'other' && (
            <Animated.View
              entering={FadeInDown.delay(250).duration(400)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Recommended Platform</Text>
              <View style={styles.platformRecommendation}>
                <Ionicons
                  name={
                    item.suggested_platform === 'tiktok' ? 'logo-tiktok' :
                    item.suggested_platform === 'youtube' ? 'logo-youtube' :
                    item.suggested_platform === 'instagram' ? 'logo-instagram' :
                    'globe-outline'
                  }
                  size={24}
                  color={colors.accent}
                />
                <Text style={styles.platformRecommendationText}>
                  {item.suggested_platform.charAt(0).toUpperCase() + item.suggested_platform.slice(1)}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Extracted Text */}
          {item.extracted_text && (
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Extracted Text</Text>
              <View style={styles.textBox}>
                <Text style={styles.extractedText}>{item.extracted_text}</Text>
              </View>
            </Animated.View>
          )}

          {/* Category Selector */}
          <Animated.View
            entering={FadeInDown.delay(350).duration(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {Object.entries(categories).map(([key, cat]) => (
                <Pressable
                  key={key}
                  style={[
                    styles.categoryChip,
                    selectedCategory === key && styles.categoryChipSelected,
                    selectedCategory === key && { backgroundColor: cat.background, borderColor: cat.color },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCategory(key);
                  }}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={selectedCategory === key ? cat.color : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === key && { color: cat.color },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Notes */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Personal Notes</Text>
            <Input
              value={note}
              onChangeText={setNote}
              placeholder="Add your notes here..."
              multiline
              numberOfLines={4}
            />
          </Animated.View>

          {/* Share Content Button */}
          {(item.generated_title || item.generated_hook || item.generated_outline?.length > 0 || item.extracted_text) && (
            <Animated.View
              entering={FadeInDown.delay(450).duration(400)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Export</Text>
              <Pressable
                style={styles.shareContentButton}
                onPress={handleShareContent}
              >
                <View style={styles.shareContentIcon}>
                  <Ionicons name="document-text-outline" size={24} color={colors.accent} />
                </View>
                <View style={styles.shareContentInfo}>
                  <Text style={styles.shareContentTitle}>Share as Text</Text>
                  <Text style={styles.shareContentDesc}>
                    Export all content to notes, messages, or other apps
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </Pressable>
            </Animated.View>
          )}

          {/* Actions */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(400)}
            style={styles.actions}
          >
            {hasChanges && (
              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={saving}
                variant="primary"
                style={styles.saveButton}
              />
            )}
            <Button
              title="Delete"
              variant="danger"
              onPress={handleDelete}
              icon={<Ionicons name="trash-outline" size={18} color={colors.error} />}
            />
          </Animated.View>
        </ScrollView>
      </View>
    </>
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
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  imageContainer: {
    width: width,
    height: width * 1.2,
    backgroundColor: colors.bgSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  metadata: {
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  platformBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.bgTertiary,
  },
  platformText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.accent}20`,
    borderWidth: 1,
    borderColor: colors.accent,
    gap: 4,
  },
  formatText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  confidence: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  section: {
    padding: spacing.base,
  },
  sectionTitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  textBox: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  extractedText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  titleBox: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  generatedTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  hookBox: {
    backgroundColor: `${colors.accent}15`,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hookIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  hookText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    fontStyle: 'italic',
  },
  outlineBox: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  outlineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  outlineNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  outlineNumberText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  outlineText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    paddingTop: 2,
  },
  platformRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  platformRecommendationText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  categoryList: {
    paddingRight: spacing.base,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.xs,
  },
  categoryChipSelected: {
    borderWidth: 2,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  saveButton: {
    marginBottom: spacing.xs,
  },
  shareContentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  shareContentIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  shareContentInfo: {
    flex: 1,
  },
  shareContentTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  shareContentDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
