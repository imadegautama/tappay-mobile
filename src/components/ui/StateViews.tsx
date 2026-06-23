import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, text } from '@/constants/design';

type StateViewProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function LoadingState({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
      <View style={[styles.iconChip, styles.chipPrimary]}>
        <ActivityIndicator color={colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

export function EmptyState({ title, message, actionLabel, onAction }: StateViewProps) {
  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.container}>
      <View style={[styles.iconChip, styles.chipPrimary]}>
        <Ionicons name="file-tray-outline" size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
      ) : null}
    </Animated.View>
  );
}

export function ErrorState({ title, message, actionLabel, onAction }: StateViewProps) {
  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.container}>
      <View style={[styles.iconChip, styles.chipDanger]}>
        <Ionicons name="alert-circle-outline" size={28} color={colors.danger} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  iconChip: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  chipPrimary: {
    backgroundColor: colors.primaryLight,
  },
  chipDanger: {
    backgroundColor: colors.dangerLight,
  },
  title: {
    ...text.h3,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...text.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});
