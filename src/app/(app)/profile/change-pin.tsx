import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { changePin } from '@/api/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing, text } from '@/constants/design';
import { getApiError, getErrorMessage } from '@/utils/errors';

const changePinSchema = z.object({
  current_pin: z.string().regex(/^\d{4}$/, 'PIN lama harus 4 digit angka'),
  new_pin: z.string().regex(/^\d{4}$/, 'PIN baru harus 4 digit angka'),
  new_pin_confirmation: z.string().regex(/^\d{4}$/, 'Konfirmasi PIN harus 4 digit angka'),
}).refine((data) => data.new_pin === data.new_pin_confirmation, {
  message: 'Konfirmasi PIN tidak cocok',
  path: ['new_pin_confirmation'],
}).refine((data) => data.current_pin !== data.new_pin, {
  message: 'PIN baru tidak boleh sama dengan PIN lama',
  path: ['new_pin'],
});

type ChangePinForm = z.infer<typeof changePinSchema>;

export default function ChangePinScreen() {
  const form = useForm<ChangePinForm>({
    resolver: zodResolver(changePinSchema),
    defaultValues: {
      current_pin: '',
      new_pin: '',
      new_pin_confirmation: '',
    },
  });

  const mutation = useMutation({
    mutationFn: changePin,
    onSuccess: () => {
      Alert.alert('PIN berhasil diubah', 'Gunakan PIN baru saat membayar di terminal TapPay.');
      router.back();
    },
    onError: (error) => {
      const apiError = getApiError(error);

      if (apiError?.code === 'INVALID_CURRENT_PIN') {
        form.setError('current_pin', { message: 'PIN lama salah.' });
        return;
      }

      if (apiError?.errors) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          form.setError(field as keyof ChangePinForm, {
            message: messages[0],
          });
        });
        return;
      }

      Alert.alert('Gagal mengubah PIN', getErrorMessage(error));
    },
  });

  function pinChange(value: string) {
    return value.replace(/\D/g, '').slice(0, 4);
  }

  return (
    <Screen scroll keyboard>
      <View style={styles.header}>
        <Text style={styles.title}>Ganti PIN</Text>
        <Text style={styles.subtitle}>PIN 4 digit digunakan saat pembayaran di terminal TapPay.</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={form.control}
          name="current_pin"
          render={({ field, fieldState }) => (
            <Input
              label="PIN lama"
              value={field.value}
              onChangeText={(value) => field.onChange(pinChange(value))}
              onBlur={field.onBlur}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="new_pin"
          render={({ field, fieldState }) => (
            <Input
              label="PIN baru"
              value={field.value}
              onChangeText={(value) => field.onChange(pinChange(value))}
              onBlur={field.onBlur}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="new_pin_confirmation"
          render={({ field, fieldState }) => (
            <Input
              label="Konfirmasi PIN baru"
              value={field.value}
              onChangeText={(value) => field.onChange(pinChange(value))}
              onBlur={field.onBlur}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              error={fieldState.error?.message}
            />
          )}
        />

        <Button
          title="Ubah PIN"
          loading={mutation.isPending}
          onPress={form.handleSubmit((values) => mutation.mutate(values))}
        />
        <Button title="Batal" variant="ghost" onPress={() => router.back()} />
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
    ...text.bodySmall,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.lg,
  },
});
