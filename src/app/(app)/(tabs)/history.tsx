import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TransactionListItem, TransactionType } from '@/api/types';
import { getTransactions } from '@/api/transactions';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { PressableScale } from '@/components/ui/PressableScale';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StateViews';
import { colors, radius, spacing, text } from '@/constants/design';
import { queryKeys } from '@/constants/queryKeys';
import { formatDate } from '@/utils/format';

type Filter = 'all' | TransactionType;

const filters: { label: string; value: Filter }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Pembayaran', value: 'payment' },
  { label: 'Top-up', value: 'topup' },
];

function groupTransactions(transactions: TransactionListItem[]) {
  const groups = new Map<string, TransactionListItem[]>();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  transactions.forEach((transaction) => {
    const date = transaction.created_at ? new Date(transaction.created_at).toDateString() : '-';
    let label = formatDate(transaction.created_at);

    if (date === today) label = 'Hari ini';
    if (date === yesterday) label = 'Kemarin';

    groups.set(label, [...(groups.get(label) ?? []), transaction]);
  });

  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

export default function HistoryScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const type = filter === 'all' ? undefined : filter;

  const query = useInfiniteQuery({
    queryKey: queryKeys.transactions(type),
    queryFn: ({ pageParam }) => getTransactions({ page: pageParam, type }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page >= lastPage.meta.last_page) return undefined;
      return lastPage.meta.current_page + 1;
    },
  });

  const transactions = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );
  const sections = useMemo(() => groupTransactions(transactions), [transactions]);

  if (query.isPending) {
    return <LoadingState message="Memuat riwayat transaksi..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Riwayat belum bisa dimuat"
        message="Periksa koneksi API TapPay lalu coba lagi."
        actionLabel="Coba lagi"
        onAction={() => query.refetch()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat transaksi</Text>
        <Text style={styles.subtitle}>Semua aktivitas saldo kamu</Text>
      </View>

      <View style={styles.filters}>
        {filters.map((item) => {
          const selected = filter === item.value;
          return (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Filter ${item.label}`}
              accessibilityState={{ selected }}
              key={item.value}
              onPress={() => setFilter(item.value)}
              style={[styles.filter, selected && styles.filterActive]}
            >
              <Text style={[styles.filterText, selected && styles.filterTextActive]}>
                {item.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => router.push(`/(app)/transactions/${item.id}`)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title.toUpperCase()}</Text>
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        refreshing={query.isRefetching}
        onRefresh={() => query.refetch()}
        ListEmptyComponent={
          <EmptyState
            title="Belum ada transaksi"
            message="Top-up atau pembayaran terminal akan muncul di sini."
          />
        }
        ListFooterComponent={
          query.isFetchingNextPage ? <LoadingState message="Memuat halaman berikutnya..." /> : null
        }
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    ...text.h1,
    color: colors.text,
  },
  subtitle: {
    ...text.body,
    color: colors.textMuted,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  filter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...text.label,
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.onPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    ...text.caption,
    color: colors.textSoft,
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
