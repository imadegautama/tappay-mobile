import { api, unwrap } from '@/api/client';
import type { ChangePinPayload, UpdateProfilePayload, UserProfile } from '@/api/types';

export function getProfile() {
  return unwrap<UserProfile>(api.get('/user/profile'));
}

export function updateProfile(payload: UpdateProfilePayload) {
  return unwrap<UserProfile>(api.put('/user/profile', payload));
}

export async function changePin(payload: ChangePinPayload) {
  await api.put('/user/change-pin', payload);
}
