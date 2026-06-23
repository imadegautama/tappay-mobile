export const queryKeys = {
  profile: ['profile'] as const,
  balance: ['wallet', 'balance'] as const,
  latestTransactions: ['transactions', 'latest'] as const,
  transactions: (type: 'payment' | 'topup' | undefined) =>
    ['transactions', { type }] as const,
  transactionDetail: (id: string) => ['transactions', id] as const,
};
