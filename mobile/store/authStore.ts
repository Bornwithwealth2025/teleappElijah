import { create } from "zustand";

import AuthService from "@/api/auth.service";
import { authStorage, STORAGE_KEYS } from "@/api/client";
import { authEventEmitter } from "@/events/authEventEmitter";
import {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  RequestPasswordResetRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "@/types/auth.types";
import { SocialLoginRequest } from "@/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingEmail: string | null;

  register: (payload: RegisterRequest) => Promise<void>;
  login: (payload: LoginRequest) => Promise<void>;
  verifyEmail: (payload: VerifyEmailRequest) => Promise<void>;
  resendOtp: (payload: ResendOtpRequest) => Promise<void>;
  requestPasswordReset: (payload: RequestPasswordResetRequest) => Promise<void>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (payload: SocialLoginRequest) => Promise<void>;
  loadSession: () => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    fallback
  );
}

function normalizeUser(user: AuthUser): AuthUser {
  const normalizedId = String(user.id ?? user.user_id ?? "");

  return {
    ...user,
    id: normalizedId,
    user_id: user.user_id ?? normalizedId,
  };
}

const useAuthStore = create<AuthState>((set) => {
  authEventEmitter.on("logout", () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    pendingEmail: null,

    loadSession: async () => {
      try {
        const token = await authStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const userRaw = await authStorage.getItem(STORAGE_KEYS.USER);

        if (!token || !userRaw) return;

        const user = normalizeUser(JSON.parse(userRaw) as AuthUser);

        set({
          token,
          user,
          isAuthenticated: true,
        });
      } catch {
        await authStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
        await authStorage.deleteItem(STORAGE_KEYS.USER);

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
    },

    register: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const res = await AuthService.register(payload);

        if (!res.success) {
          throw new Error(res.message || "Registration failed.");
        }

        set({
          pendingEmail: payload.email,
          isLoading: false,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          error: getErrorMessage(err, "Registration failed."),
        });

        throw err;
      }
    },

    login: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const res = await AuthService.login(payload);

        if (!res.success || !res.data?.accessToken || !res.data?.user) {
          throw new Error(res.message || "Login failed.");
        }

        const user = normalizeUser(res.data.user);
        const token = res.data.accessToken;

        await authStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        await authStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          error: getErrorMessage(err, "Login failed."),
        });

        throw err;
      }
    },

    verifyEmail: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const res = await AuthService.verifyEmail(payload);

        if (!res.success) {
          throw new Error(res.message || "Email verification failed.");
        }

        set({
          isLoading: false,
          pendingEmail: null,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          error: getErrorMessage(err, "Email verification failed."),
        });

        throw err;
      }
    },

    resendOtp: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const res = await AuthService.resendOtp(payload);

        if (!res.success) {
          throw new Error(res.message || "Unable to resend OTP.");
        }

        set({ isLoading: false });
      } catch (err: any) {
        set({
          isLoading: false,
          error: getErrorMessage(err, "Unable to resend OTP."),
        });

        throw err;
      }
    },

    requestPasswordReset: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const res = await AuthService.requestPasswordReset(payload);

        if (!res.success) {
          throw new Error(res.message || "Unable to request password reset.");
        }

        set({
          isLoading: false,
          pendingEmail: payload.email,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          error: getErrorMessage(err, "Unable to request password reset."),
        });

        throw err;
      }
    },

    resetPassword: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const res = await AuthService.resetPassword(payload);

        if (!res.success) {
          throw new Error(res.message || "Unable to reset password.");
        }

        set({
          isLoading: false,
          pendingEmail: null,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          error: getErrorMessage(err, "Unable to reset password."),
        });

        throw err;
      }
    },

    socialLogin: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const res = await AuthService.socialLogin(payload);

        if (!res.success || !res.data?.accessToken || !res.data?.user) {
          throw new Error(res.message || "Social login failed.");
        }

        const user = normalizeUser(res.data.user);
        const token = res.data.accessToken;

        await authStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        await authStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          error: getErrorMessage(err, "Social login failed."),
        });

        throw err;
      }
    },

    logout: async () => {
      set({ isLoading: true, error: null });

      try {
        await AuthService.logout();
      } catch {
      } finally {
        await authStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
        await authStorage.deleteItem(STORAGE_KEYS.USER);

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          pendingEmail: null,
        });
      }
    },

    clearError: () => set({ error: null }),
  };
});

export default useAuthStore;
