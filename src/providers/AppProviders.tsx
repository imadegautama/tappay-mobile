import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureApiClient } from '@/api/client';
import { queryClient } from '@/api/queryClient';
import { colors, font, radius, shadow, spacing, text } from '@/constants/design';
import { useAuthStore } from '@/stores/authStore';

function SessionBootstrap() {
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    configureApiClient({
      getToken: () => useAuthStore.getState().token,
      onUnauthorized: () => useAuthStore.getState().handleUnauthorized(),
    });

    void initialize();
  }, [initialize]);

  if (status === 'idle' || status === 'loading') {
    return (
      <View style={styles.loading}>
        <View style={styles.brandTile}>
          <Text style={styles.brandText}>TP</Text>
        </View>
        <Text style={styles.brandName}>TapPay</Text>
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export function AppProviders() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <SessionBootstrap />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  brandTile: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
  },
  brandText: {
    fontFamily: font.extrabold,
    fontSize: 30,
    color: colors.onPrimary,
    letterSpacing: -0.5,
  },
  brandName: {
    ...text.h2,
    color: colors.text,
  },
  spinner: {
    marginTop: spacing.sm,
  },
});
