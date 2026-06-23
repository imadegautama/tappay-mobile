import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TransactionListItem } from '@/api/types';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, font, radius, spacing, tabularNums, text } from '@/constants/design';
import { formatCurrency, formatTime } from '@/utils/format';

type TransactionItemProps = {
  transaction: TransactionListItem;
  onPress?: () => void;
};

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isTopup = transaction.type === 'topup';
  const amountPrefix = isTopup ? '+' : '-';
  const title = isTopup ? 'Top-up' : 'Pembayaran';
  const subtitle = transaction.description ?? (isTopup ? 'Via aplikasi' : 'Pembayaran TapPay');

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${title} ${formatCurrency(transaction.amount)}`}
      onPress={onPress}
      scaleTo={0.98}
      style={styles.row}
    >
      <View style={[styles.iconWrap, isTopup ? styles.iconSuccess : styles.iconDanger]}>
        <Ionicons
          name={isTopup ? 'arrow-down' : 'arrow-up'}
          size={18}
          color={isTopup ? colors.success : colors.danger}
        />
      </View>
      <View style={styles.main}>
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {subtitle} · {formatTime(transaction.created_at)}
        </Text>
      </View>
      <View style={styles.trailing}>
        <Text style={[styles.amount, isTopup ? styles.successText : styles.dangerText]}>
          {amountPrefix}
          {formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.balance}>Sisa {formatCurrency(transaction.balance_after)}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSuccess: {
    backgroundColor: colors.successLight,
  },
  iconDanger: {
    backgroundColor: colors.dangerLight,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...text.bodyMed,
    color: colors.text,
  },
  subtitle: {
    ...text.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  trailing: {
    alignItems: 'flex-end',
    maxWidth: 138,
  },
  amount: {
    ...text.bodyMed,
    ...tabularNums,
    fontFamily: font.bold,
  },
  successText: {
    color: colors.success,
  },
  dangerText: {
    color: colors.danger,
  },
  balance: {
    ...text.caption,
    ...tabularNums,
    color: colors.textSoft,
    marginTop: 2,
  },
});
