import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font } from '@/constants/design';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, focused, size }: { color: string; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} color={color} size={size} />;
  };
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: {
          fontFamily: font.medium,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8),
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: tabIcon('home', 'home-outline'),
        }}
      />
      <Tabs.Screen
        name="topup"
        options={{
          title: 'Top-up',
          tabBarIcon: tabIcon('add-circle', 'add-circle-outline'),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: tabIcon('document-text', 'document-text-outline'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: tabIcon('person', 'person-outline'),
        }}
      />
    </Tabs>
  );
}
