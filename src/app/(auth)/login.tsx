import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { login } from '@/api/auth';
import { queryClient } from '@/api/queryClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors, font, radius, shadow, spacing, text } from '@/constants/design';
import { useAuthStore } from '@/stores/authStore';
import { getApiError, getErrorMessage } from '@/utils/errors';

const loginSchema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [securePassword, setSecurePassword] = useState(true);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (auth) => {
      await setSession(auth);
      await queryClient.invalidateQueries();
      router.replace('/(app)/(tabs)');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      setFormMessage(
        apiError?.code === 'INVALID_CREDENTIALS'
          ? 'Email atau password salah.'
          : getErrorMessage(error),
      );
    },
  });

  return (
    <Screen scroll keyboard contentStyle={styles.content}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>TP</Text>
        </View>
        <Text style={styles.title}>TapPay</Text>
        <Text style={styles.subtitle}>Smart fingerprint payment</Text>
      </View>

      <View style={styles.form}>
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
              placeholder="nama@email.com"
              leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSoft} />}
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
              textContentType="password"
              error={fieldState.error?.message}
              placeholder="Password"
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

        {formMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{formMessage}</Text>
          </View>
        ) : null}

        <Button
          title="Login"
          loading={mutation.isPending}
          onPress={form.handleSubmit((values) => {
            setFormMessage(null);
            mutation.mutate(values);
          })}
        />

        <Button
          title="Daftar akun baru"
          variant="secondary"
          onPress={() => router.push('/(auth)/register')}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lupa password"
          onPress={() =>
            Alert.alert('Fitur belum tersedia', 'Reset password belum masuk scope mobile v1.')
          }
          style={styles.centerLink}
        >
          <Text style={styles.mutedLink}>Lupa password?</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xxxl,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
  },
  logoText: {
    fontFamily: font.extrabold,
    color: colors.onPrimary,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  title: {
    ...text.display,
    color: colors.text,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...text.body,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  errorText: {
    ...text.bodySmall,
    flex: 1,
    color: colors.danger,
  },
  centerLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  mutedLink: {
    ...text.label,
    color: colors.textMuted,
  },
});
