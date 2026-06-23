import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, font, radius, spacing, tabularNums, text } from '@/constants/design';

type UserIdCardProps = {
  id: number;
  caption?: string;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_CAPTION =
  'Tunjukkan ID ini ke petugas saat enroll sidik jari di terminal TapPay.';

export function UserIdCard({ id, caption = DEFAULT_CAPTION, style }: UserIdCardProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    await Clipboard.setStringAsync(String(id));
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.row}>
        <View style={styles.iconChip}>
          <Ionicons name="finger-print" size={22} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>ID Pengguna</Text>
          <Text style={styles.value} selectable>
            #{id}
          </Text>
        </View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={copied ? 'ID tersalin' : 'Salin ID pengguna'}
          onPress={handleCopy}
          scaleTo={0.94}
          style={[styles.copyButton, copied && styles.copyButtonDone]}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={16}
            color={copied ? colors.success : colors.primary}
          />
          <Text style={[styles.copyText, copied && styles.copyTextDone]}>
            {copied ? 'Tersalin' : 'Salin'}
          </Text>
        </PressableScale>
      </View>
      <Text style={styles.caption}>{caption}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...text.label,
    color: colors.textMuted,
  },
  value: {
    ...text.h2,
    ...tabularNums,
    color: colors.primary,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  copyButtonDone: {
    borderColor: colors.successBorder,
    backgroundColor: colors.successLight,
  },
  copyText: {
    ...text.caption,
    fontFamily: font.semibold,
    color: colors.primary,
  },
  copyTextDone: {
    color: colors.success,
  },
  caption: {
    ...text.bodySmall,
    color: colors.textMuted,
  },
});
