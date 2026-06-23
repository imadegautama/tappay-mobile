import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, shadow, spacing } from '@/constants/design';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({ children, style, onPress, accessibilityLabel }: CardProps) {
  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={[styles.card, style]}
      >
        {children}
      </PressableScale>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.card,
  },
});
