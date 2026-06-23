import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { LoadingState } from '@/components/ui/StateViews';
import { colors, font } from '@/constants/design';
import { useAuthStore } from '@/stores/authStore';

export default function ProtectedLayout() {
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return <LoadingState />;
  }

  if (status !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: font.semibold, fontSize: 17 },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="transactions/[id]" options={{ title: 'Detail transaksi' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Edit profil', presentation: 'modal' }} />
      <Stack.Screen
        name="profile/change-pin"
        options={{ title: 'Ganti PIN', presentation: 'modal' }}
      />
    </Stack>
  );
}
