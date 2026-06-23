import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';

export default function IndexRoute() {
  const status = useAuthStore((state) => state.status);

  if (status === 'authenticated') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
