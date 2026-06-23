import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);

  if (status === 'authenticated') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
