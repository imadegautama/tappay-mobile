import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { queryClient } from '@/api/queryClient';
import { getProfile, updateProfile } from '@/api/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/ui/StateViews';
import { colors, spacing, text } from '@/constants/design';
import { queryKeys } from '@/constants/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import { getApiError, getErrorMessage } from '@/utils/errors';

const editProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().max(20, 'Nomor HP maksimal 20 karakter').optional(),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export default function EditProfileScreen() {
  const setUser = useAuthStore((state) => state.setUser);
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });
  const form = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      form.reset({
        name: profileQuery.data.name,
        phone: profileQuery.data.phone ?? '',
      });
    }
  }, [form, profileQuery.data]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (profile) => {
      setUser(profile);
      queryClient.setQueryData(queryKeys.profile, profile);
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      Alert.alert('Profil tersimpan', 'Perubahan profil berhasil disimpan.');
      router.back();
    },
    onError: (error) => {
      const apiError = getApiError(error);

      if (apiError?.errors) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          form.setError(field as keyof EditProfileForm, {
            message: messages[0],
          });
        });
        return;
      }

      Alert.alert('Gagal menyimpan profil', getErrorMessage(error));
    },
  });

  if (profileQuery.isPending) {
    return <LoadingState message="Memuat profil..." />;
  }

  return (
    <Screen scroll keyboard>
      <View style={styles.header}>
        <Text style={styles.title}>Edit profil</Text>
        <Text style={styles.subtitle}>Email tidak bisa diubah dari aplikasi mobile v1.</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              label="Nama"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Input label="Email" value={profileQuery.data?.email ?? ''} editable={false} />
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <Input
              label="Nomor HP"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="phone-pad"
              error={fieldState.error?.message}
              placeholder="081234567890"
            />
          )}
        />

        <Button
          title="Simpan perubahan"
          loading={mutation.isPending}
          onPress={form.handleSubmit((values) => {
            mutation.mutate({
              name: values.name,
              phone: values.phone?.trim() ? values.phone.trim() : null,
            });
          })}
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
