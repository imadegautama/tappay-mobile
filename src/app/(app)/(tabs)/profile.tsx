import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { logout } from '@/api/auth';
import { getProfile } from '@/api/user';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { ErrorState, LoadingState } from '@/components/ui/StateViews';
import { UserIdCard } from '@/components/user/UserIdCard';
import { APP_VERSION_LABEL } from '@/constants/config';
import { colors, font, radius, spacing, tabularNums, text } from '@/constants/design';
import { queryKeys } from '@/constants/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/utils/format';

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  danger?: boolean;
};

function MenuItem({ icon, title, subtitle, color, onPress, danger }: MenuItemProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      scaleTo={0.98}
      style={styles.menuItem}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuTitle, danger && styles.menuDanger]}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
    </PressableScale>
  );
}

export default function ProfileScreen() {
  const cachedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logoutLocal = useAuthStore((state) => state.logoutLocal);
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });
  const profile = profileQuery.data ?? cachedUser;

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
    }
  }, [profileQuery.data, setUser]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: async () => {
      await logoutLocal();
      router.replace('/(auth)/login');
    },
  });

  function confirmLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm('Yakin ingin keluar dari akun?')) {
        logoutMutation.mutate();
      }
      return;
    }

    Alert.alert('Logout', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logoutMutation.mutate() },
    ]);
  }

  if (profileQuery.isPending && !profile) {
    return <LoadingState message="Memuat profil..." />;
  }

  if (profileQuery.isError && !profile) {
    return (
      <ErrorState
        title="Profil belum bisa dimuat"
        message="Periksa koneksi API TapPay lalu coba lagi."
        actionLabel="Coba lagi"
        onAction={() => profileQuery.refetch()}
      />
    );
  }

  return (
    <Screen scroll>
      <View style={styles.userHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.slice(0, 1).toUpperCase() ?? 'T'}</Text>
        </View>
        <Text style={styles.name}>{profile?.name ?? 'Pengguna TapPay'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <Text style={styles.balance}>{formatCurrency(profile?.balance ?? 0)}</Text>
      </View>

      {profile?.id ? <UserIdCard id={profile.id} /> : null}

      <Card
        style={[
          styles.enrollment,
          profile?.is_enrolled ? styles.enrollmentReady : styles.enrollmentWarning,
        ]}
      >
        <Ionicons
          name={profile?.is_enrolled ? 'checkmark-circle-outline' : 'warning-outline'}
          size={22}
          color={profile?.is_enrolled ? colors.success : colors.warning}
        />
        <View style={styles.enrollmentText}>
          <Text
            style={[
              styles.enrollmentTitle,
              { color: profile?.is_enrolled ? colors.success : colors.warning },
            ]}
          >
            {profile?.is_enrolled ? 'Sidik jari terdaftar' : 'Sidik jari belum terdaftar'}
          </Text>
          <Text style={styles.enrollmentSub}>
            {profile?.is_enrolled
              ? `Fingerprint ID: #${profile.fingerprint_id ?? '-'}`
              : 'Datang ke terminal TapPay untuk enrollment.'}
          </Text>
        </View>
      </Card>

      <Card style={styles.menu}>
        <MenuItem
          icon="person-outline"
          title="Edit profil"
          subtitle="Nama dan nomor HP"
          color={colors.primary}
          onPress={() => router.push('/(app)/profile/edit')}
        />
        <MenuItem
          icon="lock-closed-outline"
          title="Ganti PIN"
          subtitle="Ubah PIN 4 digit pembayaran"
          color={colors.warning}
          onPress={() => router.push('/(app)/profile/change-pin')}
        />
        <MenuItem
          icon="log-out-outline"
          title="Logout"
          subtitle="Keluar dari perangkat ini"
          color={colors.danger}
          danger
          onPress={confirmLogout}
        />
      </Card>

      <Button
        title="Refresh profil"
        variant="secondary"
        onPress={() => profileQuery.refetch()}
      />

      <Text style={styles.version}>{APP_VERSION_LABEL} - Primakara University</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontFamily: font.extrabold,
    color: colors.onPrimary,
    fontSize: 30,
  },
  name: {
    ...text.h2,
    color: colors.text,
    textAlign: 'center',
  },
  email: {
    ...text.bodySmall,
    color: colors.textMuted,
  },
  balance: {
    ...text.h3,
    ...tabularNums,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  enrollment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
  },
  enrollmentReady: {
    backgroundColor: colors.successLight,
    borderColor: colors.successBorder,
  },
  enrollmentWarning: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warningBorder,
  },
  enrollmentText: {
    flex: 1,
  },
  enrollmentTitle: {
    ...text.bodyMed,
    fontFamily: font.bold,
  },
  enrollmentSub: {
    ...text.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  menu: {
    paddingVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    ...text.bodyMed,
    fontFamily: font.semibold,
    color: colors.text,
  },
  menuDanger: {
    color: colors.danger,
  },
  menuSubtitle: {
    ...text.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  version: {
    ...text.caption,
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
