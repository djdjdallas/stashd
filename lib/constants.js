// Design System Constants

export const colors = {
  // Backgrounds
  bgPrimary: '#0a0a0b',
  bgSecondary: '#1a1a1c',
  bgTertiary: '#2a2a2c',

  // Accent
  amber400: '#fbbf24',
  amber500: '#f59e0b',
  orange500: '#f97316',

  // Status
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',

  // Text
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',

  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderFocus: 'rgba(251, 191, 36, 0.5)',
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const categories = {
  hook: {
    label: 'Hooks',
    icon: 'flash-outline',
    color: '#f59e0b',
  },
  thumbnail: {
    label: 'Thumbnails',
    icon: 'image-outline',
    color: '#3b82f6',
  },
  video_idea: {
    label: 'Video Ideas',
    icon: 'bulb-outline',
    color: '#22c55e',
  },
  script: {
    label: 'Scripts',
    icon: 'document-text-outline',
    color: '#a855f7',
  },
  visual: {
    label: 'Visuals',
    icon: 'color-palette-outline',
    color: '#ec4899',
  },
  analytics: {
    label: 'Analytics',
    icon: 'stats-chart-outline',
    color: '#06b6d4',
  },
  other: {
    label: 'Other',
    icon: 'folder-outline',
    color: '#6b7280',
  },
};

export const FREE_TIER_LIMIT = 50;
