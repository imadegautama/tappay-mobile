import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { colors, font, radius, shadow, spacing, tabularNums, text } from '@/constants/design';
import { formatCurrency } from '@/utils/format';

type BalanceCardProps = {
  balance: number;
  isEnrolled: boolean;
  onEnrollPress?: () => void;
};

export function BalanceCard({ balance, isEnrolled, onEnrollPress }: BalanceCardProps) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative depth — soft translucent circles clipped to the card. */}
        <View pointerEvents="none" style={styles.decor}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottom]} />
        </View>

        <Text style={styles.label}>Saldo TapPay</Text>
        <AnimatedNumber
          value={balance}
          format={formatCurrency}
          style={styles.balance}
          numberOfLines={1}
          adjustsFontSizeToFit
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isEnrolled ? 'Sidik jari terdaftar' : 'Belum enroll sidik jari'}
          onPress={onEnrollPress}
          style={[styles.badge, isEnrolled ? styles.badgeReady : styles.badgeWarning]}
        >
          <Ionicons
            name={isEnrolled ? 'finger-print-outline' : 'warning-outline'}
            size={15}
            color={isEnrolled ? colors.onPrimary : colors.warning}
          />
          <Text style={[styles.badgeText, !isEnrolled && styles.badgeWarningText]}>
            {isEnrolled ? 'Sidik jari terdaftar' : 'Belum enroll sidik jari'}
          </Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xxl,
    ...shadow.lg,
  },
  card: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
    overflow: 'hidden',
  },
  decor: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: 'absolute',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleTop: {
    width: 180,
    height: 180,
    top: -70,
    right: -50,
  },
  circleBottom: {
    width: 120,
    height: 120,
    bottom: -50,
    left: -20,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  label: {
    ...text.label,
    color: colors.onPrimaryMuted,
  },
  balance: {
    ...text.display,
    ...tabularNums,
    color: colors.onPrimary,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  badgeReady: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  badgeWarning: {
    backgroundColor: colors.warningLight,
  },
  badgeText: {
    ...text.caption,
    fontFamily: font.semibold,
    color: colors.onPrimary,
  },
  badgeWarningText: {
    color: colors.warning,
  },
});
