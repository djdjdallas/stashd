// Silo Design System v2.0
// Premium dark-mode design system inspired by Opal's minimalist aesthetic

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Backgrounds - Pure black base with iOS-style gray elevations
  bgPrimary: '#000000',
  bgSecondary: '#1C1C1E',
  bgTertiary: '#2C2C2E',
  bgElevated: '#3A3A3C',

  // Accent - Signature lime-to-teal gradient colors
  accent: '#D4FF2B',
  accentDark: '#A8CC22',
  accentSecondary: '#4ECDC4',

  // Gradient stops
  gradientStart: '#D4FF2B',
  gradientMiddle: '#9EE493',
  gradientEnd: '#4ECDC4',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  textQuaternary: 'rgba(255, 255, 255, 0.3)',
  textInverse: '#000000',

  // Semantic
  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#5AC8FA',
  neutral: '#8E8E93',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.12)',
  borderFocus: 'rgba(212, 255, 43, 0.5)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',

  // Overlays
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  overlayMedium: 'rgba(0, 0, 0, 0.5)',
  overlayHeavy: 'rgba(0, 0, 0, 0.8)',
  overlayBlur: 'rgba(28, 28, 30, 0.85)',

  // Legacy mappings for backward compatibility
  amber400: '#D4FF2B',
  amber500: '#A8CC22',
  orange500: '#4ECDC4',
};

// =============================================================================
// CATEGORY COLORS
// =============================================================================

export const categoryColors = {
  videoIdea: {
    primary: '#34C759',
    background: 'rgba(52, 199, 89, 0.15)',
    border: 'rgba(52, 199, 89, 0.3)',
  },
  hook: {
    primary: '#FF9F0A',
    background: 'rgba(255, 159, 10, 0.15)',
    border: 'rgba(255, 159, 10, 0.3)',
  },
  thumbnail: {
    primary: '#5AC8FA',
    background: 'rgba(90, 200, 250, 0.15)',
    border: 'rgba(90, 200, 250, 0.3)',
  },
  script: {
    primary: '#BF5AF2',
    background: 'rgba(191, 90, 242, 0.15)',
    border: 'rgba(191, 90, 242, 0.3)',
  },
  visual: {
    primary: '#FF375F',
    background: 'rgba(255, 55, 95, 0.15)',
    border: 'rgba(255, 55, 95, 0.3)',
  },
  analytics: {
    primary: '#64D2FF',
    background: 'rgba(100, 210, 255, 0.15)',
    border: 'rgba(100, 210, 255, 0.3)',
  },
};

export const categories = {
  hook: {
    label: 'Hooks',
    icon: 'flash-outline',
    color: categoryColors.hook.primary,
    background: categoryColors.hook.background,
    border: categoryColors.hook.border,
  },
  thumbnail: {
    label: 'Thumbnails',
    icon: 'image-outline',
    color: categoryColors.thumbnail.primary,
    background: categoryColors.thumbnail.background,
    border: categoryColors.thumbnail.border,
  },
  video_idea: {
    label: 'Video Ideas',
    icon: 'bulb-outline',
    color: categoryColors.videoIdea.primary,
    background: categoryColors.videoIdea.background,
    border: categoryColors.videoIdea.border,
  },
  script: {
    label: 'Scripts',
    icon: 'document-text-outline',
    color: categoryColors.script.primary,
    background: categoryColors.script.background,
    border: categoryColors.script.border,
  },
  visual: {
    label: 'Visuals',
    icon: 'color-palette-outline',
    color: categoryColors.visual.primary,
    background: categoryColors.visual.background,
    border: categoryColors.visual.border,
  },
  analytics: {
    label: 'Analytics',
    icon: 'stats-chart-outline',
    color: categoryColors.analytics.primary,
    background: categoryColors.analytics.background,
    border: categoryColors.analytics.border,
  },
  other: {
    label: 'Other',
    icon: 'folder-outline',
    color: '#8E8E93',
    background: 'rgba(142, 142, 147, 0.15)',
    border: 'rgba(142, 142, 147, 0.3)',
  },
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  display: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  h1: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: 0,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  bodySmall: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: 0,
  },
  captionSmall: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  button: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
};

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  massive: 80,
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#D4FF2B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 0,
  },
};

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  spring: {
    default: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 180,
      mass: 1,
    },
    gentle: {
      damping: 20,
      stiffness: 120,
      mass: 1,
    },
  },
  press: {
    scale: 0.97,
  },
  hover: {
    scale: 1.02,
  },
};

// =============================================================================
// COMPONENT TOKENS
// =============================================================================

export const componentTokens = {
  button: {
    primary: {
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      minHeight: 56,
    },
    secondary: {
      background: '#2C2C2E',
      textColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    ghost: {
      background: 'transparent',
      textColor: '#D4FF2B',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    danger: {
      background: 'rgba(255, 69, 58, 0.15)',
      textColor: '#FF453A',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 69, 58, 0.3)',
    },
  },
  card: {
    default: {
      background: '#1C1C1E',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      padding: 16,
    },
    elevated: {
      background: '#2C2C2E',
      borderRadius: 20,
      padding: 20,
    },
    interactive: {
      background: '#1C1C1E',
      borderRadius: 16,
      padding: 16,
      pressedBackground: '#2C2C2E',
    },
  },
  input: {
    background: '#1C1C1E',
    textColor: '#FFFFFF',
    placeholderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    focusBorderColor: 'rgba(212, 255, 43, 0.5)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 17,
  },
  badge: {
    small: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      fontSize: 11,
      fontWeight: '600',
    },
    default: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      fontSize: 13,
      fontWeight: '500',
    },
  },
  progressBar: {
    height: 4,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  bottomSheet: {
    background: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    handleWidth: 36,
    handleHeight: 5,
    handleColor: 'rgba(255, 255, 255, 0.3)',
    handleBorderRadius: 2.5,
    overlayColor: 'rgba(0, 0, 0, 0.6)',
  },
  tabBar: {
    background: '#000000',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    activeColor: '#D4FF2B',
    inactiveColor: 'rgba(255, 255, 255, 0.5)',
    iconSize: 24,
    labelSize: 10,
  },
  listItem: {
    background: '#1C1C1E',
    pressedBackground: '#2C2C2E',
    separatorColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    iconContainerSize: 36,
    iconContainerRadius: 8,
  },
};

// =============================================================================
// ONBOARDING
// =============================================================================

export const onboarding = {
  screens: [
    {
      id: 'welcome',
      title: 'Welcome to Stashd',
      subtitle: 'Your creative vault for content inspiration',
      visual: 'logo-animation',
      ctaText: 'Get Started',
    },
    {
      id: 'capture',
      title: 'Capture Everything',
      subtitle: 'Screenshots, ideas, hooks—save inspiration from anywhere in seconds',
      visual: 'capture-illustration',
      features: [
        { icon: 'camera-outline', text: 'Screenshot import' },
        { icon: 'share-outline', text: 'Share extension' },
        { icon: 'sparkles-outline', text: 'AI auto-categorization' },
      ],
    },
    {
      id: 'organize',
      title: 'AI-Powered Organization',
      subtitle: 'Let AI analyze and categorize your content automatically',
      visual: 'organize-illustration',
      categories: [
        { name: 'Video Ideas', color: '#34C759', icon: 'bulb-outline' },
        { name: 'Hooks', color: '#FF9F0A', icon: 'flash-outline' },
        { name: 'Thumbnails', color: '#5AC8FA', icon: 'image-outline' },
        { name: 'Scripts', color: '#BF5AF2', icon: 'document-text-outline' },
      ],
    },
    {
      id: 'create',
      title: 'Turn Ideas Into Content',
      subtitle: 'Transform your saved inspiration into scripts, outlines, and video concepts',
      visual: 'create-illustration',
      ctaText: 'Start Creating',
    },
  ],
  styling: {
    indicatorActiveColor: '#D4FF2B',
    indicatorInactiveColor: 'rgba(255, 255, 255, 0.2)',
    indicatorSize: 8,
    indicatorSpacing: 12,
  },
};

// =============================================================================
// GRADIENT PRESETS
// =============================================================================

export const gradients = {
  primary: {
    colors: ['#D4FF2B', '#9EE493', '#4ECDC4'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primaryHorizontal: {
    colors: ['#D4FF2B', '#4ECDC4'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  primaryVertical: {
    colors: ['#D4FF2B', '#4ECDC4'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
};

// =============================================================================
// CREATOR TYPES
// =============================================================================

export const CREATOR_TYPES = {
  CONTENT_CREATOR: 'content_creator',
  SOFTWARE_DEVELOPER: 'software_developer',
};

// Category labels and descriptions by creator type
// Same underlying category IDs, different display text
export const categoryConfig = {
  content_creator: {
    video_idea: {
      id: 'video_idea',
      label: 'Video Idea',
      pluralLabel: 'Video Ideas',
      icon: 'bulb-outline',
      description: 'Generate full video concept',
      color: categoryColors.videoIdea.primary,
      background: categoryColors.videoIdea.background,
      border: categoryColors.videoIdea.border,
    },
    hook: {
      id: 'hook',
      label: 'Hook',
      pluralLabel: 'Hooks',
      icon: 'flash-outline',
      description: 'Extract attention-grabbing hooks',
      color: categoryColors.hook.primary,
      background: categoryColors.hook.background,
      border: categoryColors.hook.border,
    },
    thumbnail: {
      id: 'thumbnail',
      label: 'Thumbnail',
      pluralLabel: 'Thumbnails',
      icon: 'image-outline',
      description: 'Analyze thumbnail design',
      color: categoryColors.thumbnail.primary,
      background: categoryColors.thumbnail.background,
      border: categoryColors.thumbnail.border,
    },
    script: {
      id: 'script',
      label: 'Script',
      pluralLabel: 'Scripts',
      icon: 'document-text-outline',
      description: 'Extract script or talking points',
      color: categoryColors.script.primary,
      background: categoryColors.script.background,
      border: categoryColors.script.border,
    },
    analytics: {
      id: 'analytics',
      label: 'Analytics',
      pluralLabel: 'Analytics',
      icon: 'stats-chart-outline',
      description: 'Extract metrics and insights',
      color: categoryColors.analytics.primary,
      background: categoryColors.analytics.background,
      border: categoryColors.analytics.border,
    },
    visual: {
      id: 'visual',
      label: 'Visual',
      pluralLabel: 'Visuals',
      icon: 'color-palette-outline',
      description: 'Save as visual inspiration',
      color: categoryColors.visual.primary,
      background: categoryColors.visual.background,
      border: categoryColors.visual.border,
    },
  },
  software_developer: {
    video_idea: {
      id: 'video_idea',
      label: 'Project Idea',
      pluralLabel: 'Project Ideas',
      icon: 'bulb-outline',
      description: 'App concepts, features, or side projects',
      color: categoryColors.videoIdea.primary,
      background: categoryColors.videoIdea.background,
      border: categoryColors.videoIdea.border,
    },
    hook: {
      id: 'hook',
      label: 'README Hook',
      pluralLabel: 'README Hooks',
      icon: 'flash-outline',
      description: 'Compelling intros for docs or repos',
      color: categoryColors.hook.primary,
      background: categoryColors.hook.background,
      border: categoryColors.hook.border,
    },
    thumbnail: {
      id: 'thumbnail',
      label: 'UI Design',
      pluralLabel: 'UI Designs',
      icon: 'image-outline',
      description: 'UI/UX inspiration and patterns',
      color: categoryColors.thumbnail.primary,
      background: categoryColors.thumbnail.background,
      border: categoryColors.thumbnail.border,
    },
    script: {
      id: 'script',
      label: 'Code Snippet',
      pluralLabel: 'Code Snippets',
      icon: 'document-text-outline',
      description: 'Code patterns and algorithms',
      color: categoryColors.script.primary,
      background: categoryColors.script.background,
      border: categoryColors.script.border,
    },
    analytics: {
      id: 'analytics',
      label: 'Metrics',
      pluralLabel: 'Metrics',
      icon: 'stats-chart-outline',
      description: 'Performance benchmarks and stats',
      color: categoryColors.analytics.primary,
      background: categoryColors.analytics.background,
      border: categoryColors.analytics.border,
    },
    visual: {
      id: 'visual',
      label: 'Architecture',
      pluralLabel: 'Architecture',
      icon: 'color-palette-outline',
      description: 'System diagrams and architecture',
      color: categoryColors.visual.primary,
      background: categoryColors.visual.background,
      border: categoryColors.visual.border,
    },
  },
};

// Helper function to get categories for a creator type
export const getCategoriesForType = (creatorType) => {
  return categoryConfig[creatorType] || categoryConfig.content_creator;
};

// Helper function to get a single category config
export const getCategoryForType = (categoryId, creatorType) => {
  const config = categoryConfig[creatorType] || categoryConfig.content_creator;
  return config[categoryId] || config.video_idea;
};

// =============================================================================
// APP CONSTANTS
// =============================================================================

export const FREE_TIER_LIMIT = 50;
