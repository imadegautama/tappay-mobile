import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, shadow, spacing, text } from '@/constants/design';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const TINT: Record<ButtonVariant, string> = {
  primary: colors.onPrimary,
  secondary: colors.primary,
  ghost: colors.primary,
  danger: colors.danger,
};

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  icon,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        styles[variant],
        variant === 'primary' && shadow.sm,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={TINT[variant]} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: TINT[variant] }]}>{title}</Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.dangerLight,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...text.h3,
    fontSize: 15,
  },
});
