// Onboarding Screen
// 5-screen animated onboarding flow for Stashd
// Includes creator type selection

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

import { GradientButton } from '../components/ui/GradientButton';
import { usePreferences, CREATOR_TYPES } from '../context/PreferencesContext';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  gradients,
  onboarding,
  animation,
} from '../lib/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// =============================================================================
// ONBOARDING SCREENS DATA
// =============================================================================

// Insert creator type screen after welcome
const screens = [
  onboarding.screens[0], // welcome
  {
    id: 'creator_type',
    title: 'What do you create?',
    subtitle: 'This helps us personalize your experience',
    visual: 'creator-type-selection',
  },
  ...onboarding.screens.slice(1), // capture, organize, create
];

// =============================================================================
// WELCOME SCREEN
// =============================================================================

function WelcomeScreen({ isActive }) {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isActive) {
      logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    }
  }, [isActive]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View style={styles.screenContainer}>
      <View style={styles.visualContainer}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <LinearGradient
            colors={gradients.primary.colors}
            start={gradients.primary.start}
            end={gradients.primary.end}
            style={styles.logoGradient}
          >
            <Ionicons name="layers" size={64} color={colors.textInverse} />
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.textContainer}>
        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.title}
        >
          {screens[0].title}
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(500).duration(500)}
          style={styles.subtitle}
        >
          {screens[0].subtitle}
        </Animated.Text>
      </View>
    </View>
  );
}

// =============================================================================
// CAPTURE SCREEN
// =============================================================================

function CaptureScreen({ isActive }) {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.visualContainer}>
        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={styles.illustrationContainer}
        >
          <View style={styles.phoneFrame}>
            <View style={styles.phoneScreen}>
              <View style={styles.screenshotPlaceholder}>
                <Ionicons name="image" size={48} color={colors.textTertiary} />
              </View>
            </View>
            <View style={styles.captureIndicator}>
              <Ionicons name="add-circle" size={32} color={colors.accent} />
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.textContainer}>
        <Animated.Text
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.title}
        >
          {screens[1].title}
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.subtitle}
        >
          {screens[1].subtitle}
        </Animated.Text>

        <View style={styles.featuresContainer}>
          {screens[1].features.map((feature, index) => (
            <Animated.View
              key={feature.text}
              entering={FadeInDown.delay(500 + index * 100).duration(400)}
              style={styles.featureItem}
            >
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={20} color={colors.accent} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

// =============================================================================
// ORGANIZE SCREEN
// =============================================================================

function OrganizeScreen({ isActive }) {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.visualContainer}>
        <View style={styles.categoriesGrid}>
          {screens[2].categories.map((category, index) => (
            <Animated.View
              key={category.name}
              entering={FadeInDown.delay(200 + index * 100).duration(400).springify()}
              style={[
                styles.categoryChip,
                { backgroundColor: `${category.color}20` },
              ]}
            >
              <Ionicons name={category.icon} size={18} color={category.color} />
              <Text style={[styles.categoryChipText, { color: category.color }]}>
                {category.name}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.textContainer}>
        <Animated.Text
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.title}
        >
          {screens[2].title}
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.subtitle}
        >
          {screens[2].subtitle}
        </Animated.Text>
      </View>
    </View>
  );
}

// =============================================================================
// CREATOR TYPE SCREEN
// =============================================================================

function CreatorTypeScreen({ isActive, selectedType, onSelectType }) {
  const creatorTypes = [
    {
      id: CREATOR_TYPES.CONTENT_CREATOR,
      title: 'Content Creator',
      description: 'YouTubers, TikTokers, streamers, podcasters',
      icon: 'videocam-outline',
      color: '#FF375F',
    },
    {
      id: CREATOR_TYPES.SOFTWARE_DEVELOPER,
      title: 'Software Developer',
      description: 'Engineers, designers, indie hackers, founders',
      icon: 'code-slash-outline',
      color: '#5AC8FA',
    },
  ];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.visualContainer}>
        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={styles.creatorTypeContainer}
        >
          {creatorTypes.map((type, index) => {
            const isSelected = selectedType === type.id;
            return (
              <AnimatedPressable
                key={type.id}
                entering={FadeInDown.delay(300 + index * 100).duration(400).springify()}
                style={[
                  styles.creatorTypeCard,
                  isSelected && styles.creatorTypeCardSelected,
                  isSelected && { borderColor: type.color },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onSelectType(type.id);
                }}
              >
                <View
                  style={[
                    styles.creatorTypeIcon,
                    { backgroundColor: `${type.color}20` },
                    isSelected && { backgroundColor: `${type.color}30` },
                  ]}
                >
                  <Ionicons name={type.icon} size={32} color={type.color} />
                </View>
                <Text style={styles.creatorTypeTitle}>{type.title}</Text>
                <Text style={styles.creatorTypeDescription}>{type.description}</Text>
                {isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: type.color }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </AnimatedPressable>
            );
          })}
        </Animated.View>
      </View>

      <View style={styles.textContainer}>
        <Animated.Text
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.title}
        >
          {screens[1].title}
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.subtitle}
        >
          {screens[1].subtitle}
        </Animated.Text>
      </View>
    </View>
  );
}

// =============================================================================
// CREATE SCREEN
// =============================================================================

function CreateScreen({ isActive }) {
  // Find the create screen index (it's now at index 4)
  const createScreenIndex = screens.findIndex(s => s.id === 'create');
  const createScreen = screens[createScreenIndex];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.visualContainer}>
        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={styles.createIllustration}
        >
          <View style={styles.sparkleContainer}>
            <Ionicons name="sparkles" size={48} color={colors.accent} />
          </View>
          <View style={styles.arrowsContainer}>
            <Ionicons name="arrow-forward" size={24} color={colors.accentSecondary} />
          </View>
          <View style={styles.contentContainer}>
            <Ionicons name="document-text" size={40} color={colors.textSecondary} />
          </View>
        </Animated.View>
      </View>

      <View style={styles.textContainer}>
        <Animated.Text
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.title}
        >
          {createScreen?.title}
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.subtitle}
        >
          {createScreen?.subtitle}
        </Animated.Text>
      </View>
    </View>
  );
}

// =============================================================================
// PAGINATION DOTS
// =============================================================================

function PaginationDots({ activeIndex, total }) {
  return (
    <View style={styles.pagination}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              isActive ? styles.dotActive : styles.dotInactive,
            ]}
          />
        );
      })}
    </View>
  );
}

// =============================================================================
// MAIN ONBOARDING COMPONENT
// =============================================================================

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCreatorType, setSelectedCreatorType] = useState(null);
  const flatListRef = useRef(null);
  const { setCreatorType, completeOnboarding } = usePreferences();

  const handleScroll = useCallback((event) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    if (slideIndex !== activeIndex) {
      setActiveIndex(slideIndex);
      Haptics.selectionAsync();
    }
  }, [activeIndex]);

  const handleNext = useCallback(() => {
    // On creator type screen, require selection before proceeding
    if (screens[activeIndex]?.id === 'creator_type' && !selectedCreatorType) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (activeIndex < screens.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  }, [activeIndex, selectedCreatorType]);

  const handleSkip = useCallback(() => {
    // If skipping, default to content creator
    if (!selectedCreatorType) {
      setSelectedCreatorType(CREATOR_TYPES.CONTENT_CREATOR);
      setCreatorType(CREATOR_TYPES.CONTENT_CREATOR);
    }
    handleComplete();
  }, [selectedCreatorType, setCreatorType]);

  const handleCreatorTypeSelect = useCallback((type) => {
    setSelectedCreatorType(type);
    setCreatorType(type);
  }, [setCreatorType]);

  const handleComplete = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save creator type if selected
    if (selectedCreatorType) {
      await setCreatorType(selectedCreatorType);
    } else {
      // Default to content creator if not selected
      await setCreatorType(CREATOR_TYPES.CONTENT_CREATOR);
    }

    // Mark onboarding as complete
    await completeOnboarding();

    router.replace('/(auth)/signup');
  }, [selectedCreatorType, setCreatorType, completeOnboarding]);

  const renderScreen = useCallback(({ item, index }) => {
    const isActive = index === activeIndex;

    switch (item.id) {
      case 'welcome':
        return <WelcomeScreen isActive={isActive} />;
      case 'creator_type':
        return (
          <CreatorTypeScreen
            isActive={isActive}
            selectedType={selectedCreatorType}
            onSelectType={handleCreatorTypeSelect}
          />
        );
      case 'capture':
        return <CaptureScreen isActive={isActive} />;
      case 'organize':
        return <OrganizeScreen isActive={isActive} />;
      case 'create':
        return <CreateScreen isActive={isActive} />;
      default:
        return null;
    }
  }, [activeIndex, selectedCreatorType, handleCreatorTypeSelect]);

  const isLastScreen = activeIndex === screens.length - 1;
  const currentScreen = screens[activeIndex];
  const ctaText = currentScreen.ctaText || 'Next';

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      {!isLastScreen && (
        <Animated.View
          entering={FadeIn.delay(600).duration(400)}
          style={styles.skipContainer}
        >
          <Pressable onPress={handleSkip} hitSlop={16}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Screens */}
      <FlatList
        ref={flatListRef}
        data={screens}
        renderItem={renderScreen}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <PaginationDots activeIndex={activeIndex} total={screens.length} />

        <View style={styles.buttonContainer}>
          <GradientButton
            title={ctaText}
            onPress={handleNext}
            icon={
              isLastScreen ? null : (
                <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
              )
            }
            iconPosition="right"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: spacing.xl,
    zIndex: 10,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  screenContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.huge,
  },
  textContainer: {
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Logo styles
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Phone illustration
  phoneFrame: {
    width: 200,
    height: 280,
    backgroundColor: colors.bgSecondary,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    position: 'relative',
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: colors.bgTertiary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenshotPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureIndicator: {
    position: 'absolute',
    bottom: -16,
    right: -16,
    backgroundColor: colors.bgPrimary,
    borderRadius: 20,
    padding: 4,
  },

  // Features list
  featuresContainer: {
    marginTop: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.textPrimary,
  },

  // Categories grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    gap: spacing.xs,
  },
  categoryChipText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },

  // Create illustration
  createIllustration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  sparkleContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowsContainer: {
    opacity: 0.6,
  },
  contentContainer: {
    width: 70,
    height: 90,
    borderRadius: 12,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: onboarding.styling.indicatorSpacing,
    marginBottom: spacing.xl,
  },
  dot: {
    height: onboarding.styling.indicatorSize,
    borderRadius: onboarding.styling.indicatorSize / 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: onboarding.styling.indicatorActiveColor,
  },
  dotInactive: {
    width: onboarding.styling.indicatorSize,
    backgroundColor: onboarding.styling.indicatorInactiveColor,
  },

  // Bottom section
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  buttonContainer: {
    width: '100%',
  },

  // Creator type selection
  creatorTypeContainer: {
    width: '100%',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  creatorTypeCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  creatorTypeCardSelected: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 2,
  },
  creatorTypeIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  creatorTypeTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  creatorTypeDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
