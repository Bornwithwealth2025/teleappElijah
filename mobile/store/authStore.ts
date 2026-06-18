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

function normalizeUser(
  user: Partial<AuthUser> & Record<string, any>,
): AuthUser {
  const normalizedId = String(
    user.id ?? user.user_id ?? user._id ?? user.email ?? "",
  );

  return {
    ...(user as AuthUser),
    id: normalizedId,
    user_id: user.user_id ?? normalizedId,
  };
}

function findValueByKeys(source: any, keys: string[]): any {
  if (!source || typeof source !== "object") return null;

  for (const key of keys) {
    if (source[key]) return source[key];
  }

  for (const value of Object.values(source)) {
    if (value && typeof value === "object") {
      const found = findValueByKeys(value, keys);
      if (found) return found;
    }
  }

  return null;
}

function getAuthPayload(res: any, email?: string) {
  const token = findValueByKeys(res, [
    "accessToken",
    "access_token",
    "token",
    "authToken",
    "jwt",
  ]);

  const user = findValueByKeys(res, ["user", "authUser", "profile", "account"]);

  return {
    token: token ?? `local-session-${Date.now()}`,
    user:
      user ??
      ({
        id: email ?? "local-user",
        user_id: email ?? "local-user",
        email: email ?? "",
      } as AuthUser),
  };
}

async function persistAuthSession(token: string, user: AuthUser) {
  await authStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  await authStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

async function clearAuthSession() {
  await authStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
  await authStorage.deleteItem(STORAGE_KEYS.USER);
}

async function getRegisteredProfiles() {
  const raw = await authStorage.getItem(STORAGE_KEYS.REGISTERED_PROFILES);
  return raw ? JSON.parse(raw) : {};
}

async function saveRegisteredProfile(email: string, profile: any) {
  const profiles = await getRegisteredProfiles();

  profiles[email.toLowerCase()] = {
    ...(profiles[email.toLowerCase()] ?? {}),
    ...profile,
    email: email.toLowerCase(),
  };

  await authStorage.setItem(
    STORAGE_KEYS.REGISTERED_PROFILES,
    JSON.stringify(profiles),
  );
}

async function getRegisteredProfile(email?: string | null) {
  if (!email) return null;

  const profiles = await getRegisteredProfiles();

  return profiles[email.toLowerCase()] ?? null;
}

const useAuthStore = create<AuthState>((set) => {
  authEventEmitter.on("logout", () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingEmail: null,
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

        if (!token || !userRaw) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const user = normalizeUser(JSON.parse(userRaw));

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch {
        await clearAuthSession();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },

    register: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const res = await AuthService.register(payload);

        if (res?.success === false) {
          throw new Error(res.message || "Registration failed.");
        }

        await saveRegisteredProfile(payload.email, {
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          phone_number: payload.phone_number,
          country_code: payload.country_code,
          country: payload.country,
          state: payload.state,
          city: payload.city,
          date_of_birth: payload.date_of_birth,
        });

        set({
          pendingEmail: payload.email,
          isLoading: false,
          error: null,
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

        if (res?.success === false) {
          throw new Error(res.message || "Login failed.");
        }

        const { token, user: rawUser } = getAuthPayload(res, payload.email);
        const savedProfile = await getRegisteredProfile(payload.email);

        const user = normalizeUser({
          ...(savedProfile ?? {}),
          ...(rawUser ?? {}),
          email: rawUser?.email ?? savedProfile?.email ?? payload.email,
        });

        await persistAuthSession(token, user);

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          pendingEmail: null,
        });
      } catch (err: any) {
        await clearAuthSession();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
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

        if (res?.success === false) {
          throw new Error(res.message || "Email verification failed.");
        }

        set({
          isLoading: false,
          pendingEmail: null,
          error: null,
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

        if (res?.success === false) {
          throw new Error(res.message || "Unable to resend OTP.");
        }

        set({
          isLoading: false,
          error: null,
        });
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

        if (res?.success === false) {
          throw new Error(res.message || "Unable to request password reset.");
        }

        set({
          isLoading: false,
          pendingEmail: payload.email,
          error: null,
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

        if (res?.success === false) {
          throw new Error(res.message || "Unable to reset password.");
        }

        set({
          isLoading: false,
          pendingEmail: null,
          error: null,
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

        if (res?.success === false) {
          throw new Error(res.message || "Social login failed.");
        }

        const { token, user: rawUser } = getAuthPayload(res);
        const user = normalizeUser(rawUser);

        await persistAuthSession(token, user);

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          pendingEmail: null,
        });
      } catch (err: any) {
        await clearAuthSession();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
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
        await clearAuthSession();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          pendingEmail: null,
        });
      }
    },

    clearError: () => set({ error: null }),
  };
});

export default useAuthStore;
