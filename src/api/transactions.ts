import { api, unwrap } from '@/api/client';
import { TRANSACTIONS_PER_PAGE } from '@/constants/config';
import type {
  ApiSuccess,
  TransactionDetail,
  TransactionListItem,
  TransactionPage,
  TransactionType,
} from '@/api/types';

export async function getTransactions(params: {
  page?: number;
  per_page?: number;
  type?: TransactionType;
}): Promise<TransactionPage> {
  const response = await api.get<ApiSuccess<TransactionListItem[]>>('/transactions', {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? TRANSACTIONS_PER_PAGE,
      type: params.type,
    },
  });

  return {
    data: response.data.data ?? [],
    meta: response.data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: params.per_page ?? TRANSACTIONS_PER_PAGE,
      total: 0,
    },
  };
}

export function getTransactionDetail(id: string) {
  return unwrap<TransactionDetail>(api.get(`/transactions/${id}`));
}
