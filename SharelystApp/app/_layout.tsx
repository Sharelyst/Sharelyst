import React from 'react';
import './globals.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ConnectionStatusProvider } from '../contexts/ConnectionStatusContext';
import { ConnectionStatus } from '../components/ConnectionStatus';

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
  // ...existing code...
  React.useEffect(() => {
    if (isLoading) {
      return;
    }
    const inAuthGroup = segments[0] === '(tabs)';
    const inGroupFlow = segments[0] === 'groupchoice' || segments[0] === 'creategroup' || segments[0] === 'findgroup';
    if (!isAuthenticated) {
      if (segments[0] !== 'login' && segments[0] !== 'register') {
        router.replace('/login');
      }
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
      <ConnectionStatus />
    </ThemeProvider>
  );
}

/**
 * Root component with AuthProvider
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <ConnectionStatusProvider>
        <RootLayoutNav />
      </ConnectionStatusProvider>
    </AuthProvider>
  );
}
