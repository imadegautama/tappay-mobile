import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, radius, spacing, text } from '@/constants/design';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export function Input({
  label,
  error,
  style,
  leftIcon,
  rightSlot,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          error && styles.fieldError,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={colors.textSoft}
          style={[styles.input, style]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...text.label,
    color: colors.text,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  fieldError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightSlot: {
    marginLeft: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text,
    ...text.body,
  },
  error: {
    ...text.caption,
    color: colors.danger,
  },
});
