import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { topup } from '@/api/wallet';
import { getProfile } from '@/api/user';
import { queryClient } from '@/api/queryClient';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { TOPUP_MAX, TOPUP_MIN, TOPUP_PRESETS } from '@/constants/config';
import { colors, font, radius, shadow, spacing, tabularNums, text } from '@/constants/design';
import { queryKeys } from '@/constants/queryKeys';
import { formatCurrency, formatInputCurrency, parseInputCurrency } from '@/utils/format';
import { getErrorMessage } from '@/utils/errors';

export default function TopupScreen() {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const amount = useMemo(() => parseInputCurrency(input), [input]);
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });

  const currentBalance = profileQuery.data?.balance ?? 0;
  const nextBalance = currentBalance + amount;
  const isValid = amount >= TOPUP_MIN && amount <= TOPUP_MAX;

  const mutation = useMutation({
    mutationFn: topup,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
        queryClient.invalidateQueries({ queryKey: queryKeys.balance }),
        queryClient.invalidateQueries({ queryKey: queryKeys.latestTransactions }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      ]);
      Alert.alert('Top-up berhasil', 'Saldo TapPay kamu sudah diperbarui.');
      setInput('');
      router.replace('/(app)/(tabs)');
    },
    onError: (error) => {
      Alert.alert('Top-up gagal', getErrorMessage(error));
    },
  });

  function confirmTopup() {
    if (!isValid || mutation.isPending) return;

    if (Platform.OS === 'web') {
      if (window.confirm(`Top-up ${formatCurrency(amount)}?`)) {
        mutation.mutate(amount);
      }
      return;
    }

    Alert.alert('Konfirmasi top-up', `Top-up ${formatCurrency(amount)}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Konfirmasi', onPress: () => mutation.mutate(amount) },
    ]);
  }

  return (
    <Screen scroll keyboard>
      <View style={styles.header}>
        <Text style={styles.title}>Top-up saldo</Text>
        <Text style={styles.subtitle}>Tambah saldo virtual untuk mencoba pembayaran TapPay.</Text>
      </View>

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo saat ini</Text>
        <Text style={styles.balance}>{formatCurrency(currentBalance)}</Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pilih nominal</Text>
        <View style={styles.presets}>
          {TOPUP_PRESETS.map((preset) => {
            const selected = amount === preset;
            return (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={`Pilih ${formatCurrency(preset)}`}
                accessibilityState={{ selected }}
                key={preset}
                onPress={() => setInput(formatInputCurrency(String(preset)))}
                style={[styles.preset, selected && styles.presetSelected]}
              >
                <Text style={[styles.presetText, selected && styles.presetTextSelected]}>
                  {formatCurrency(preset)}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atau masukkan nominal</Text>
        <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
          <Text style={styles.prefix}>Rp</Text>
          <TextInput
            accessibilityLabel="Nominal top-up"
            keyboardType="number-pad"
            value={input}
            onChangeText={(value) => setInput(formatInputCurrency(value))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="50.000"
            placeholderTextColor={colors.textSoft}
            style={styles.input}
          />
        </View>
        {amount > 0 && !isValid ? (
          <Text style={styles.error}>
            Nominal harus {formatCurrency(TOPUP_MIN)} sampai {formatCurrency(TOPUP_MAX)}.
          </Text>
        ) : null}
      </View>

      {amount > 0 ? (
        <Card style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Top-up</Text>
            <Text style={styles.summaryValue}>{formatCurrency(amount)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Saldo setelah top-up</Text>
            <AnimatedNumber
              value={nextBalance}
              format={formatCurrency}
              duration={500}
              style={[styles.summaryValue, styles.success]}
            />
          </View>
        </Card>
      ) : null}

      <Button
        title="Konfirmasi top-up"
        loading={mutation.isPending}
        disabled={!isValid}
        onPress={confirmTopup}
        icon={<Ionicons name="wallet-outline" size={18} color={colors.onPrimary} />}
      />

      <Text style={styles.footer}>Saldo virtual untuk prototype TapPay.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
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
  balanceCard: {
    backgroundColor: colors.surfaceAlt,
    gap: spacing.xs,
  },
  balanceLabel: {
    ...text.label,
    color: colors.textMuted,
  },
  balance: {
    ...text.h2,
    ...tabularNums,
    color: colors.text,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...text.h3,
    color: colors.text,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  preset: {
    width: '47.5%',
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    ...shadow.sm,
  },
  presetText: {
    ...text.bodyMed,
    ...tabularNums,
    fontFamily: font.bold,
    color: colors.text,
  },
  presetTextSelected: {
    color: colors.primary,
  },
  inputWrap: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
    paddingHorizontal: spacing.lg,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  prefix: {
    ...text.h3,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...text.h3,
    ...tabularNums,
    fontFamily: font.bold,
    color: colors.text,
  },
  error: {
    ...text.bodySmall,
    color: colors.danger,
  },
  summary: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  summaryLabel: {
    ...text.body,
    color: colors.textMuted,
  },
  summaryValue: {
    ...text.bodyMed,
    ...tabularNums,
    fontFamily: font.bold,
    color: colors.text,
  },
  success: {
    color: colors.success,
  },
  footer: {
    ...text.caption,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
