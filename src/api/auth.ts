import { api, unwrap } from '@/api/client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/api/types';

export function login(payload: LoginPayload) {
  return unwrap<AuthResponse>(api.post('/auth/login', payload));
}

export function register(payload: RegisterPayload) {
  return unwrap<AuthResponse>(api.post('/auth/register', payload));
}

export async function logout() {
  await api.post('/auth/logout');
}
