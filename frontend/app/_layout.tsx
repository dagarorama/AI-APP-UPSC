import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/onboarding" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/profile-setup" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="chat" />
          <Stack.Screen name="library" />
          <Stack.Screen name="mcq" />
          <Stack.Screen name="evaluation" />
          <Stack.Screen name="dose" />
          <Stack.Screen name="planner" />
        </Stack>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}