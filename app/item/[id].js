import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, typography, spacing, borderRadius, categories } from '../../lib/constants';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
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

  const handleSave = useCallback(async () => {
    setSaving(true);
    const result = await editItem(id, {
      user_note: note,
      category: selectedCategory,
    });
    setSaving(false);

    if (result.success) {
      setItem(result.data);
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

    try {
      await Share.share({
        url: item.image_url,
        message: item.extracted_text || 'Check out this screenshot from Silo',
      });
    } catch (error) {
      console.error('Share error:', error);
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
          headerRight: () => (
            <Pressable onPress={handleShare} hitSlop={8}>
              <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Metadata */}
          <View style={styles.metadata}>
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: categoryInfo.color }]}>
                <Ionicons name={categoryInfo.icon} size={14} color="#fff" />
                <Text style={styles.badgeText}>{categoryInfo.label}</Text>
              </View>
              {item.source_platform && item.source_platform !== 'other' && (
                <View style={styles.platformBadge}>
                  <Text style={styles.platformText}>
                    {item.source_platform.charAt(0).toUpperCase() + item.source_platform.slice(1)}
                  </Text>
                </View>
              )}
            </View>

            {item.ai_confidence && (
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
          </View>

          {/* Extracted Text */}
          {item.extracted_text && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Extracted Text</Text>
              <View style={styles.textBox}>
                <Text style={styles.extractedText}>{item.extracted_text}</Text>
              </View>
            </View>
          )}

          {/* Category Selector */}
          <View style={styles.section}>
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
                    selectedCategory === key && { backgroundColor: cat.color + '20', borderColor: cat.color },
                  ]}
                  onPress={() => setSelectedCategory(key)}
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
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Notes</Text>
            <Input
              value={note}
              onChangeText={setNote}
              placeholder="Add your notes here..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {hasChanges && (
              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={saving}
                style={styles.saveButton}
              />
            )}
            <Button
              title="Delete"
              variant="danger"
              onPress={handleDelete}
              icon={<Ionicons name="trash-outline" size={18} color="#fff" />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
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
  imageContainer: {
    width: width,
    height: width * 1.2,
    backgroundColor: colors.bgSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  metadata: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
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
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textBox: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  extractedText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  categoryList: {
    paddingRight: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryChipSelected: {
    borderWidth: 2,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  actions: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  saveButton: {
    marginBottom: spacing.sm,
  },
});
