import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getTransactionDetail } from '@/api/transactions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { ErrorState, LoadingState } from '@/components/ui/StateViews';
import { colors, font, radius, spacing, tabularNums, text } from '@/constants/design';
import { queryKeys } from '@/constants/queryKeys';
import { formatCurrency, formatDate, formatTime } from '@/utils/format';

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id ?? '');
  const query = useQuery({
    queryKey: queryKeys.transactionDetail(id),
    queryFn: () => getTransactionDetail(id),
    enabled: id.length > 0,
  });

  if (query.isPending) {
    return <LoadingState message="Memuat detail transaksi..." />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Transaksi tidak ditemukan"
        message="Detail transaksi ini tidak tersedia atau koneksi API bermasalah."
        actionLabel="Kembali"
        onAction={() => router.back()}
      />
    );
  }

  const transaction = query.data;
  const isTopup = transaction.type === 'topup';

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Detail transaksi' }} />
      <Card style={styles.hero}>
        <View style={[styles.icon, isTopup ? styles.successBg : styles.dangerBg]}>
          <Ionicons
            name={isTopup ? 'arrow-down' : 'arrow-up'}
            size={28}
            color={isTopup ? colors.success : colors.danger}
          />
        </View>
        <Text style={styles.type}>{isTopup ? 'Top-up' : 'Pembayaran'}</Text>
        <Text style={[styles.amount, isTopup ? styles.success : styles.danger]}>
          {isTopup ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{transaction.status}</Text>
        </View>
      </Card>

      <Card style={styles.detail}>
        <DetailRow label="Deskripsi" value={transaction.description ?? '-'} />
        <DetailRow label="Tanggal" value={formatDate(transaction.created_at)} />
        <DetailRow label="Waktu" value={formatTime(transaction.created_at)} />
        <DetailRow label="Saldo sebelum" value={formatCurrency(transaction.balance_before)} />
        <DetailRow label="Saldo sesudah" value={formatCurrency(transaction.balance_after)} />
        <DetailRow
          label="Terminal"
          last
          value={
            transaction.terminal
              ? `${transaction.terminal.name} (${transaction.terminal.terminal_code})`
              : '-'
          }
        />
      </Card>

      <Button title="Kembali" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBg: {
    backgroundColor: colors.successLight,
  },
  dangerBg: {
    backgroundColor: colors.dangerLight,
  },
  type: {
    ...text.h3,
    color: colors.text,
    marginTop: spacing.xs,
  },
  amount: {
    ...text.h1,
    ...tabularNums,
  },
  success: {
    color: colors.success,
  },
  danger: {
    color: colors.danger,
  },
  statusPill: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  statusText: {
    ...text.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  detail: {
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    ...text.bodySmall,
    color: colors.textMuted,
  },
  rowValue: {
    ...text.bodySmall,
    ...tabularNums,
    fontFamily: font.semibold,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
});
