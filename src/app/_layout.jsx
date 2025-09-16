
import { useAuth } from '@/utils/auth/useAuth';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady } = useAuth();

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            // Use standard card presentation for normal screens to get reliable focus events
            presentation: 'card',
            animation: 'fade',
            stackAnimation: 'fade',
            animationTypeForReplace: 'push',
            freezeOnBlur: false,
            detachInactiveScreens: true,
            fullScreenGestureEnabled: true,
            gestureEnabled: true,
            statusBarStyle: 'light',
            contentStyle: { backgroundColor: '#000' },
          }}
        >
          {/* Tabs group */}
          <Stack.Screen name="(tabs)" options={{ presentation: 'card', animation: 'fade', stackAnimation: 'fade' }} />
          {/* Common stack screens */}
          <Stack.Screen name="index" />
          <Stack.Screen name="exercises" options={{ presentation: 'card', animation: 'fade', stackAnimation: 'fade' }} />
          <Stack.Screen name="exercise-detail" options={{ presentation: 'card', animation: 'fade', stackAnimation: 'fade' }} />
          <Stack.Screen name="workout-detail" options={{ presentation: 'card', animation: 'fade', stackAnimation: 'fade' }} />
          <Stack.Screen name="workout-builder" options={{ presentation: 'card', animation: 'fade', stackAnimation: 'fade' }} />
          <Stack.Screen name="workout-builder-preview" options={{ presentation: 'card', animation: 'fade', stackAnimation: 'fade' }} />
          {/* Modal-style screens with fade + gesture */}
          <Stack.Screen
            name="workout-session/index"
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              stackAnimation: 'fade',
              gestureEnabled: true,
              fullScreenGestureEnabled: true,
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

