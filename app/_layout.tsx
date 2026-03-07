import '@/src/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { queryClient } from '@/src/lib/query-client';
import { adminConfigState, hydrateAdminConfig } from '@/src/store/admin-config';

const { useSnapshot } = require('valtio/react');

export default function RootLayout() {
  const config = useSnapshot(adminConfigState);

  useEffect(() => {
    hydrateAdminConfig().catch(() => undefined);
  }, []);

  const isReady = config.hydrated;
  const isAuthenticated = Boolean(config.baseUrl.trim() && config.adminApiKey.trim());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        {!isReady ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4efe4' }}>
            <ActivityIndicator color="#1d5f55" />
          </View>
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            {isAuthenticated ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="login" />}
            <Stack.Screen name="users/[id]" />
            <Stack.Screen name="accounts/[id]" options={{ presentation: 'card' }} />
          </Stack>
        )}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
