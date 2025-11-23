import React from 'react';
import './globals.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Main navigation component with authentication logic
 */
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) {
      // Still checking authentication status
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';
    const inGroupFlow = segments[0] === 'groupchoice' || segments[0] === 'creategroup' || segments[0] === 'findgroup';

    if (!isAuthenticated) {
      // User is not authenticated, redirect to login
      if (segments[0] !== 'login' && segments[0] !== 'register') {
        router.replace('/login');
      }
    } else {
      // User is authenticated, allow navigation to proceed
      // Group check will be handled by the groupchoice page
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="groupchoice" options={{ headerShown: false }} />
        <Stack.Screen name="creategroup" options={{ headerShown: false }} />
        <Stack.Screen name="findgroup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

/**
 * Root component with AuthProvider
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
