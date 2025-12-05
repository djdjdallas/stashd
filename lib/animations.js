// Animation Presets
// Reusable animation configurations for react-native-reanimated

import {
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { animation } from './constants';

// =============================================================================
// TIMING CONFIGURATIONS
// =============================================================================

export const timingConfigs = {
  fast: {
    duration: animation.duration.fast,
    easing: Easing.out(Easing.cubic),
  },
  normal: {
    duration: animation.duration.normal,
    easing: Easing.inOut(Easing.cubic),
  },
  slow: {
    duration: animation.duration.slow,
    easing: Easing.inOut(Easing.cubic),
  },
  easeOut: {
    duration: animation.duration.normal,
    easing: Easing.out(Easing.cubic),
  },
  easeIn: {
    duration: animation.duration.normal,
    easing: Easing.in(Easing.cubic),
  },
  bounce: {
    duration: animation.duration.slow,
    easing: Easing.bounce,
  },
};

// =============================================================================
// SPRING CONFIGURATIONS
// =============================================================================

export const springConfigs = {
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
  stiff: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  wobbly: {
    damping: 8,
    stiffness: 200,
    mass: 1,
  },
};

// =============================================================================
// ANIMATION HELPERS
// =============================================================================

/**
 * Create a fade in animation value
 * @param {number} toValue - Target opacity (default 1)
 * @param {Object} config - Timing configuration
 */
export function fadeIn(toValue = 1, config = timingConfigs.normal) {
  return withTiming(toValue, config);
}

/**
 * Create a fade out animation value
 * @param {Object} config - Timing configuration
 */
export function fadeOut(config = timingConfigs.normal) {
  return withTiming(0, config);
}

/**
 * Create a slide up animation value
 * @param {number} fromY - Starting Y position
 * @param {Object} config - Spring configuration
 */
export function slideUp(fromY = 20, config = springConfigs.default) {
  return withSpring(0, config);
}

/**
 * Create a slide down animation value
 * @param {number} toY - Target Y position
 * @param {Object} config - Spring configuration
 */
export function slideDown(toY = 20, config = springConfigs.default) {
  return withSpring(toY, config);
}

/**
 * Create a scale in animation value
 * @param {number} fromScale - Starting scale
 * @param {Object} config - Spring configuration
 */
export function scaleIn(fromScale = 0.95, config = springConfigs.default) {
  return withSpring(1, config);
}

/**
 * Create a scale out animation value
 * @param {number} toScale - Target scale
 * @param {Object} config - Spring configuration
 */
export function scaleOut(toScale = 0.95, config = springConfigs.default) {
  return withSpring(toScale, config);
}

/**
 * Create a press animation
 * @param {number} scale - Scale when pressed (default 0.97)
 */
export function pressAnimation(scale = animation.press.scale) {
  return withSpring(scale, springConfigs.default);
}

/**
 * Create a release animation
 */
export function releaseAnimation() {
  return withSpring(1, springConfigs.default);
}

// =============================================================================
// STAGGER UTILITIES
// =============================================================================

/**
 * Calculate stagger delay for list animations
 * @param {number} index - Item index
 * @param {number} baseDelay - Base delay in ms (default 50)
 * @param {number} maxDelay - Maximum total delay (default 500)
 */
export function staggerDelay(index, baseDelay = 50, maxDelay = 500) {
  return Math.min(index * baseDelay, maxDelay);
}

/**
 * Create a delayed animation
 * @param {number} delay - Delay in ms
 * @param {*} animationValue - The animation to delay
 */
export function delayed(delay, animationValue) {
  return withDelay(delay, animationValue);
}

/**
 * Create a staggered fade in animation value
 * @param {number} index - Item index
 * @param {number} baseDelay - Base delay between items
 */
export function staggeredFadeIn(index, baseDelay = 50) {
  return withDelay(
    staggerDelay(index, baseDelay),
    withTiming(1, timingConfigs.normal)
  );
}

/**
 * Create a staggered slide up animation value
 * @param {number} index - Item index
 * @param {number} baseDelay - Base delay between items
 */
export function staggeredSlideUp(index, baseDelay = 50) {
  return withDelay(
    staggerDelay(index, baseDelay),
    withSpring(0, springConfigs.default)
  );
}

// =============================================================================
// INTERPOLATION HELPERS
// =============================================================================

/**
 * Create an interpolation for scroll-based animations
 * @param {number} scrollY - Scroll position
 * @param {number[]} inputRange - Input scroll values
 * @param {number[]} outputRange - Output values
 */
export function scrollInterpolate(scrollY, inputRange, outputRange) {
  return interpolate(
    scrollY,
    inputRange,
    outputRange,
    Extrapolation.CLAMP
  );
}

/**
 * Create a parallax effect interpolation
 * @param {number} scrollY - Scroll position
 * @param {number} speed - Parallax speed (0.5 = half speed)
 */
export function parallax(scrollY, speed = 0.5) {
  return interpolate(
    scrollY,
    [0, 100],
    [0, 100 * speed],
    Extrapolation.EXTEND
  );
}

// =============================================================================
// SEQUENCE ANIMATIONS
// =============================================================================

/**
 * Create a pulse animation
 * @param {number} minScale - Minimum scale
 * @param {number} maxScale - Maximum scale
 * @param {number} duration - Animation duration
 */
export function pulse(minScale = 0.95, maxScale = 1.05, duration = 1000) {
  return withRepeat(
    withSequence(
      withTiming(maxScale, { duration: duration / 2 }),
      withTiming(minScale, { duration: duration / 2 })
    ),
    -1,
    true
  );
}

/**
 * Create a shake animation
 * @param {number} intensity - Shake intensity in pixels
 */
export function shake(intensity = 10) {
  return withSequence(
    withTiming(intensity, { duration: 50 }),
    withTiming(-intensity, { duration: 50 }),
    withTiming(intensity / 2, { duration: 50 }),
    withTiming(-intensity / 2, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
}

/**
 * Create a bounce animation
 */
export function bounce() {
  return withSequence(
    withSpring(1.1, springConfigs.stiff),
    withSpring(0.9, springConfigs.stiff),
    withSpring(1, springConfigs.default)
  );
}

// =============================================================================
// ENTERING/EXITING ANIMATIONS
// =============================================================================

/**
 * Preset entering animations for use with Animated.View entering prop
 */
export const entering = {
  fadeIn: {
    initialValues: { opacity: 0 },
    animations: { opacity: fadeIn() },
  },
  slideUp: {
    initialValues: { opacity: 0, transform: [{ translateY: 20 }] },
    animations: {
      opacity: fadeIn(),
      transform: [{ translateY: slideUp() }],
    },
  },
  slideDown: {
    initialValues: { opacity: 0, transform: [{ translateY: -20 }] },
    animations: {
      opacity: fadeIn(),
      transform: [{ translateY: withSpring(0, springConfigs.default) }],
    },
  },
  scaleIn: {
    initialValues: { opacity: 0, transform: [{ scale: 0.9 }] },
    animations: {
      opacity: fadeIn(),
      transform: [{ scale: scaleIn() }],
    },
  },
  slideRight: {
    initialValues: { opacity: 0, transform: [{ translateX: -20 }] },
    animations: {
      opacity: fadeIn(),
      transform: [{ translateX: withSpring(0, springConfigs.default) }],
    },
  },
};

// =============================================================================
// ANIMATED STYLE CREATORS
// =============================================================================

/**
 * Create an animated style for fade + slide up effect
 * @param {SharedValue} opacity - Opacity animated value
 * @param {SharedValue} translateY - TranslateY animated value
 */
export function createFadeSlideStyle(opacity, translateY) {
  'worklet';
  return {
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  };
}

/**
 * Create an animated style for scale effect
 * @param {SharedValue} scale - Scale animated value
 */
export function createScaleStyle(scale) {
  'worklet';
  return {
    transform: [{ scale: scale.value }],
  };
}

/**
 * Create an animated style for press effect
 * @param {SharedValue} pressed - Pressed state (0 or 1)
 */
export function createPressStyle(pressed) {
  'worklet';
  return {
    transform: [
      {
        scale: interpolate(pressed.value, [0, 1], [1, animation.press.scale]),
      },
    ],
  };
}

// =============================================================================
// DURATION CONSTANTS (re-export from constants)
// =============================================================================

export const duration = animation.duration;

export default {
  timingConfigs,
  springConfigs,
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  scaleIn,
  scaleOut,
  pressAnimation,
  releaseAnimation,
  staggerDelay,
  delayed,
  staggeredFadeIn,
  staggeredSlideUp,
  scrollInterpolate,
  parallax,
  pulse,
  shake,
  bounce,
  entering,
  duration,
};
