export type ApiSuccess<T> = {
  status: 'success';
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};

export type ApiError = {
  status: 'error';
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  data?: Record<string, unknown>;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  balance: number;
  is_enrolled: boolean;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  balance: number;
  is_enrolled: boolean;
  fingerprint_id: number | null;
  created_at: string | null;
};

export type TransactionType = 'payment' | 'topup';
export type TransactionStatus = 'success' | 'failed';

export type TransactionListItem = {
  id: number;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  status: TransactionStatus;
  created_at: string | null;
};

export type TransactionDetail = TransactionListItem & {
  terminal: null | {
    terminal_code: string;
    name: string;
  };
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  pin: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string | null;
};

export type ChangePinPayload = {
  current_pin: string;
  new_pin: string;
  new_pin_confirmation: string;
};

export type BalanceResponse = {
  balance: number;
  formatted: string;
};

export type TopupResponse = {
  amount: number;
  balance_before: number;
  balance_after: number;
  transaction_id: number;
};

export type TransactionPage = {
  data: TransactionListItem[];
  meta: PaginationMeta;
};
