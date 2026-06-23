import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProfile } from '@/api/user';
import { getBalance } from '@/api/wallet';
import { getTransactions } from '@/api/transactions';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StateViews';
import { UserIdCard } from '@/components/user/UserIdCard';
import { colors, radius, shadow, spacing, text } from '@/constants/design';
import { queryKeys } from '@/constants/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, getGreeting } from '@/utils/format';

export default function HomeScreen() {
  const setUser = useAuthStore((state) => state.setUser);
  const cachedUser = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });
  const balanceQuery = useQuery({
    queryKey: queryKeys.balance,
    queryFn: getBalance,
  });
  const latestQuery = useQuery({
    queryKey: queryKeys.latestTransactions,
    queryFn: () => getTransactions({ per_page: 3 }),
  });

  const profile = profileQuery.data ?? cachedUser;
  const balance = balanceQuery.data?.balance ?? profile?.balance ?? 0;

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
    }
  }, [profileQuery.data, setUser]);

  async function refreshAll() {
    setRefreshing(true);
    try {
      await Promise.all([profileQuery.refetch(), balanceQuery.refetch(), latestQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }

  function showEnrollmentInfo() {
    Alert.alert(
      'Enrollment sidik jari',
      profile?.is_enrolled
        ? `Sidik jari sudah terdaftar${profile.fingerprint_id ? ` dengan ID #${profile.fingerprint_id}` : ''}.`
        : `Tunjukkan User ID kamu (#${profile?.id ?? '-'}) ke petugas di terminal TapPay terdekat untuk scan sidik jari sebelum melakukan pembayaran.`,
    );
  }

  if (profileQuery.isPending && !profile) {
    return <LoadingState message="Memuat wallet TapPay..." />;
  }

  if (profileQuery.isError && !profile) {
    return (
      <ErrorState
        title="Wallet belum bisa dimuat"
        message="Periksa koneksi API TapPay lalu coba lagi."
        actionLabel="Coba lagi"
        onAction={() => profileQuery.refetch()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.slice(0, 1).toUpperCase() ?? 'T'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text numberOfLines={1} style={styles.name}>
              {profile?.name ?? 'Pengguna TapPay'}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(450).springify().damping(18)}>
          <BalanceCard
            balance={balance}
            isEnrolled={profile?.is_enrolled ?? false}
            onEnrollPress={showEnrollmentInfo}
          />
        </Animated.View>

        {!profile?.is_enrolled && profile?.id ? (
          <Animated.View entering={FadeInDown.delay(150).duration(450)}>
            <UserIdCard
              id={profile.id}
              caption="Sidik jari belum terdaftar. Tunjukkan User ID ini ke petugas terminal TapPay untuk enroll."
            />
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(210).duration(450)} style={styles.actions}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Top-up saldo"
            onPress={() => router.push('/(app)/(tabs)/topup')}
            style={styles.action}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="add" size={22} color={colors.success} />
            </View>
            <Text style={styles.actionTitle}>Top-up</Text>
            <Text style={styles.actionSub}>Mulai {formatCurrency(10000)}</Text>
          </PressableScale>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Lihat riwayat transaksi"
            onPress={() => router.push('/(app)/(tabs)/history')}
            style={styles.action}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Riwayat</Text>
            <Text style={styles.actionSub}>Semua transaksi</Text>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(450)}>
          <Card style={styles.latestCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transaksi terakhir</Text>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Lihat semua transaksi"
                hitSlop={8}
                onPress={() => router.push('/(app)/(tabs)/history')}
              >
                <Text style={styles.sectionLink}>Lihat semua</Text>
              </PressableScale>
            </View>
            {latestQuery.data?.data.length ? (
              latestQuery.data.data.map((transaction, index) => (
                <View key={transaction.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <TransactionItem
                    transaction={transaction}
                    onPress={() => router.push(`/(app)/transactions/${transaction.id}`)}
                  />
                </View>
              ))
            ) : (
              <EmptyState
                title="Belum ada transaksi"
                message="Top-up atau pembayaran terminal akan muncul di sini."
              />
            )}
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...text.h3,
    color: colors.primary,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    ...text.bodySmall,
    color: colors.textMuted,
  },
  name: {
    ...text.h3,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionTitle: {
    ...text.h3,
    fontSize: 16,
    color: colors.text,
  },
  actionSub: {
    ...text.caption,
    color: colors.textMuted,
  },
  latestCard: {
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...text.h3,
    color: colors.text,
  },
  sectionLink: {
    ...text.label,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
