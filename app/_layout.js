import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { colors } from '../lib/constants';

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
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
          </Stack>
        </View>
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
});
