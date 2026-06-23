import { default as axios } from 'axios';

import { API_BASE_URL } from '@/constants/config';

type ApiClientConfig = {
  getToken: () => string | null | Promise<string | null>;
  onUnauthorized: () => void | Promise<void>;
};

let getToken: ApiClientConfig['getToken'] = () => null;
let onUnauthorized: ApiClientConfig['onUnauthorized'] = () => undefined;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function configureApiClient(config: ApiClientConfig) {
  getToken = config.getToken;
  onUnauthorized = config.onUnauthorized;
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await onUnauthorized();
    }

    return Promise.reject(error);
  },
);

export async function unwrap<T>(promise: Promise<{ data: { data?: T } }>) {
  const response = await promise;
  return response.data.data as T;
}
