import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing } from '../lib/constants';
import { LoadingSpinner } from '../components/LoadingSpinner';

/**
 * Catch-all route for unmatched URLs.
 * Handles expo-share-intent deep links that expo-router can't match.
 */
export default function NotFoundScreen() {
  const pathname = usePathname();
  const { hasShareIntent, shareIntent } = useShareIntentContext();
  const { user } = useAuth();

  useEffect(() => {
    // Check if this is a share intent URL (contains dataurl or stashdsharekey)
    const isShareIntentUrl = pathname?.includes('dataurl') || pathname?.includes('stashdsharekey');

    if (isShareIntentUrl || (hasShareIntent && shareIntent?.files?.length > 0)) {
      // This is a share intent - redirect to the share process screen
      if (user) {
        router.replace('/share-process');
      } else {
        // If not logged in, go to auth first (share intent will be preserved)
        router.replace('/(auth)/login');
      }
    } else {
      // Not a share intent, go to home
      router.replace('/(tabs)');
    }
  }, [pathname, hasShareIntent, shareIntent, user]);

  // Show loading while redirecting
  return (
    <View style={styles.container}>
      <LoadingSpinner />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
