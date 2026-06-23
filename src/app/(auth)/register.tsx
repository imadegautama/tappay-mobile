import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { register } from '@/api/auth';
import { queryClient } from '@/api/queryClient';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors, font, spacing, text } from '@/constants/design';
import { useAuthStore } from '@/stores/authStore';
import { getApiError, getErrorMessage } from '@/utils/errors';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
  pin: z.string().regex(/^\d{4}$/, 'PIN harus 4 digit angka'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [securePassword, setSecurePassword] = useState(true);
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      pin: '',
    },
  });

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: async (auth) => {
      await setSession(auth);
      await queryClient.invalidateQueries();
      Alert.alert(
        'Registrasi berhasil',
        'Datang ke terminal TapPay untuk enroll sidik jari sebelum membayar.',
      );
      router.replace('/(app)/(tabs)');
    },
    onError: (error) => {
      const apiError = getApiError(error);

      if (apiError?.errors) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          form.setError(field as keyof RegisterForm, {
            message: messages[0],
          });
        });
        return;
      }

      Alert.alert('Registrasi gagal', getErrorMessage(error));
    },
  });

  return (
    <Screen scroll keyboard>
      <View style={styles.header}>
        <Text style={styles.title}>Daftar akun baru</Text>
        <Text style={styles.subtitle}>Buat wallet TapPay untuk saldo virtual dan riwayat pembayaran.</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              label="Nama lengkap"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              textContentType="name"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              label="Email"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Input
              label="Password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry={securePassword}
              textContentType="newPassword"
              error={fieldState.error?.message}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSoft} />}
              rightSlot={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={securePassword ? 'Tampilkan password' : 'Sembunyikan password'}
                  hitSlop={10}
                  onPress={() => setSecurePassword((value) => !value)}
                >
                  <Ionicons
                    name={securePassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              }
            />
          )}
        />
        <Controller
          control={form.control}
          name="password_confirmation"
          render={({ field, fieldState }) => (
            <Input
              label="Konfirmasi password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry={securePassword}
              textContentType="newPassword"
              error={fieldState.error?.message}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSoft} />}
            />
          )}
        />
        <Controller
          control={form.control}
          name="pin"
          render={({ field, fieldState }) => (
            <Input
              label="PIN 4 digit"
              value={field.value}
              onChangeText={(value) => field.onChange(value.replace(/\D/g, '').slice(0, 4))}
              onBlur={field.onBlur}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              error={fieldState.error?.message}
            />
          )}
        />

        <Card style={styles.info}>
          <Text style={styles.infoTitle}>Enrollment sidik jari</Text>
          <Text style={styles.infoText}>
            Setelah daftar, datang ke terminal TapPay terdekat untuk scan sidik jari.
          </Text>
        </Card>

        <Button
          title="Daftar"
          loading={mutation.isPending}
          onPress={form.handleSubmit((values) => mutation.mutate(values))}
        />
        <Button title="Sudah punya akun" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    ...text.h1,
    color: colors.text,
  },
  subtitle: {
    ...text.body,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.lg,
  },
  info: {
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  infoTitle: {
    ...text.bodyMed,
    fontFamily: font.bold,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...text.bodySmall,
    color: colors.warning,
  },
});
