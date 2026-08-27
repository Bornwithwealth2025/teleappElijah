import { authEventEmitter } from "@/events/authEventEmitter";
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  "http://10.0.2.2:5000/api/v2"
).replace(/\/+$/, "");

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "telefya_access_token",
  USER: "telefya_user",
  REGISTERED_PROFILES: "telefya_registered_profiles",
} as const;

export const authStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return typeof localStorage === "undefined"
        ? null
        : localStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async deleteItem(key: string) {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

type UnauthorizedRequestConfig = InternalAxiosRequestConfig & {
  _handledUnauthorized?: boolean;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  withCredentials: Platform.OS === "web",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await authStorage.getItem(
      STORAGE_KEYS.ACCESS_TOKEN,
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

function isPublicAuthRequest(url?: string) {
  return Boolean(
    url &&
      [
        "/auth/login",
        "/auth/register",
        "/auth/verify-email",
        "/auth/resend-otp",
        "/auth/request-password-reset",
        "/auth/reset-password",
      ].some((route) => url.includes(route)),
  );
}

let sessionClearPromise: Promise<void> | null = null;

function clearExpiredSession() {
  if (sessionClearPromise) {
    return sessionClearPromise;
  }

  sessionClearPromise = (async () => {
    await authStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await authStorage.deleteItem(STORAGE_KEYS.USER);
    authEventEmitter.emit("logout");
  })().finally(() => {
    sessionClearPromise = null;
  });

  return sessionClearPromise;
}

function isExpiredTokenResponse(error: any) {
  const status = error?.response?.status;

  if (status === 401) {
    return true;
  }

  if (status !== 403) {
    return false;
  }

  const message = String(
    error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      "",
  ).toLowerCase();

  return (
    message.includes("invalid token") ||
    message.includes("expired token") ||
    message.includes("invalid or expired token")
  );
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as
      | UnauthorizedRequestConfig
      | undefined;

    if (
      isExpiredTokenResponse(error) &&
      originalRequest &&
      !originalRequest._handledUnauthorized &&
      !isPublicAuthRequest(originalRequest.url)
    ) {
      originalRequest._handledUnauthorized = true;
      await clearExpiredSession();
    }

    return Promise.reject(error);
  },
);

export default apiClient;