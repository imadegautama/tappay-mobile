import { Platform } from "react-native";

const DEFAULT_WEB_API_URL = "https://tappay.imadegautama.com/api/v1";
const DEFAULT_NATIVE_API_URL = "https://tappay.imadegautama.com/api/v1";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "web" ? DEFAULT_WEB_API_URL : DEFAULT_NATIVE_API_URL);

export const TOPUP_PRESETS = [10000, 25000, 50000, 100000] as const;
export const TOPUP_MIN = 1000;
export const TOPUP_MAX = 1000000;
export const TRANSACTIONS_PER_PAGE = 15;
export const APP_VERSION_LABEL = "TapPay v1.0.0";
