import { AxiosError } from 'axios';

import type { ApiError } from '@/api/types';

export function getApiError(error: unknown): ApiError | null {
  if (error instanceof AxiosError && error.response?.data) {
    return error.response.data as ApiError;
  }

  return null;
}

export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan.') {
  const apiError = getApiError(error);
  if (apiError?.message) return apiError.message;

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

export function getFirstFieldError(error: unknown, field: string) {
  const apiError = getApiError(error);
  return apiError?.errors?.[field]?.[0];
}
