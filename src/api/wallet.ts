import { api, unwrap } from '@/api/client';
import type { BalanceResponse, TopupResponse } from '@/api/types';

export function getBalance() {
  return unwrap<BalanceResponse>(api.get('/wallet/balance'));
}

export function topup(amount: number) {
  return unwrap<TopupResponse>(api.post('/wallet/topup', { amount }));
}
