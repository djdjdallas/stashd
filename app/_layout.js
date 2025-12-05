import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { colors } from '../lib/constants';

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

/**
 * Inner layout component that handles share intent routing.
 * Wrapped inside providers to access auth and share intent context.
 */
function RootLayoutNav() {
  const { user, loading: authLoading } = useAuth();
  const { hasShareIntent, shareIntent } = useShareIntentContext();

  useEffect(() => {
    // Hide splash screen after a short delay
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  // Handle share intent routing when auth state is resolved
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Check if we have a share intent with files
    if (hasShareIntent && shareIntent?.files?.length > 0) {
      if (user) {
        // User is authenticated, navigate to share processing screen
        // Use setTimeout to ensure navigation happens after initial render
        setTimeout(() => {
          router.push('/share-process');
        }, 100);
      }
      // If not authenticated, the share intent will be preserved
      // and processed after login via the share-process screen check
    }
  }, [hasShareIntent, shareIntent, user, authLoading]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.bgPrimary,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.bgPrimary,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="category/[name]"
          options={{
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="item/[id]"
          options={{
            headerBackTitle: 'Back',
            title: 'Details',
          }}
        />
        <Stack.Screen
          name="import"
          options={{
            presentation: 'modal',
            title: 'Import Screenshots',
          }}
        />
        <Stack.Screen
          name="share-process"
          options={{
            presentation: 'modal',
            title: 'Save to Stash\'d',
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <AppProvider>
          <ShareIntentProvider>
            <RootLayoutNav />
          </ShareIntentProvider>
        </AppProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
});
