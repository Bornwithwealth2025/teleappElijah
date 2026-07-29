import { create } from "zustand";

import AuthService from "@/api/auth.service";
import UserService from "@/api/user.service";
import { authStorage, STORAGE_KEYS } from "@/api/client";
import { authEventEmitter } from "@/events/authEventEmitter";
import useUserStore from "@/store/userStore";
import {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  RequestPasswordResetRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  SocialLoginRequest,
  VerifyEmailRequest,
} from "@/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  pendingEmail: string | null;

  register: (payload: RegisterRequest) => Promise<void>;
  login: (payload: LoginRequest) => Promise<void>;
  verifyEmail: (payload: VerifyEmailRequest) => Promise<void>;
  resendOtp: (payload: ResendOtpRequest) => Promise<void>;
  requestPasswordReset: (
    payload: RequestPasswordResetRequest,
  ) => Promise<void>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (payload: SocialLoginRequest) => Promise<void>;
  loadSession: () => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(error: any, fallback: string): string {
  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message;

  return typeof message === "string" && message.trim() ? message : fallback;
}

function normalizeUser(
  user: Partial<AuthUser> & Record<string, any>,
  fallbackEmail = "",
): AuthUser {
  const rawId = user.id ?? user.user_id ?? user._id;
  const email = String(user.email ?? fallbackEmail ?? "").trim();
  const id = String(rawId ?? "").trim() || email;

  return {
    ...(user as AuthUser),
    id,
    user_id: id,
    email,
  };
}

function getResponseData(response: any) {
  return response?.data?.user ?? response?.data ?? response?.user ?? response;
}

function getLoginToken(response: any): string | null {
  return (
    response?.accessToken ??
    response?.access_token ??
    response?.token ??
    response?.data?.accessToken ??
    response?.data?.access_token ??
    response?.data?.token ??
    response?.data?.data?.accessToken ??
    null
  );
}

function getLoginUser(response: any, email: string): AuthUser {
  const data = getResponseData(response);

  const fullName = String(data?.name ?? response?.name ?? "").trim();
  const [firstName = "", ...lastNameParts] = fullName.split(/\s+/);

  return normalizeUser(
    {
      id: data?.id ?? response?.id,
      user_id: data?.user_id ?? response?.user_id ?? response?.id,
      email: data?.email ?? response?.email ?? email,
      first_name: data?.first_name ?? response?.first_name ?? firstName,
      last_name:
        data?.last_name ?? response?.last_name ?? lastNameParts.join(" "),
    },
    email,
  );
}

function getProfileUser(response: any, fallbackUser: AuthUser): AuthUser {
  const profile = getResponseData(response);

  return normalizeUser(
    {
      ...fallbackUser,
      ...(profile && typeof profile === "object" ? profile : {}),
    },
    fallbackUser.email,
  );
}

async function persistAuthSession(token: string, user: AuthUser) {
  await authStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  await authStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

async function clearAuthSession() {
  await authStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
  await authStorage.deleteItem(STORAGE_KEYS.USER);
}

async function getRegisteredProfiles(): Promise<Record<string, any>> {
  const raw = await authStorage.getItem(STORAGE_KEYS.REGISTERED_PROFILES);

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveRegisteredProfile(email: string, profile: Record<string, any>) {
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

const useAuthStore = create<AuthState>((set) => {
  authEventEmitter.on("logout", () => {
    useUserStore.getState().clearProfile();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: true,
      error: null,
      pendingEmail: null,
    });
  });

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isHydrated: false,
    error: null,
    pendingEmail: null,

    loadSession: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const token = await authStorage.getItem(
          STORAGE_KEYS.ACCESS_TOKEN,
        );

        const userRaw = await authStorage.getItem(
          STORAGE_KEYS.USER,
        );

        if (!token || !userRaw) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isHydrated: true,
          });

          return;
        }

        const parsedUser = JSON.parse(userRaw);

        set({
          token,
          user: normalizeUser(parsedUser),
          isAuthenticated: true,
          isLoading: false,
          isHydrated: true,
          error: null,
        });
      } catch {
        await clearAuthSession();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
          error: null,
        });
      }
    },

    register: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const response = await AuthService.register(payload);

        if (response?.success === false) {
          throw new Error(response.message || "Registration failed.");
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
      } catch (error) {
        set({
          isLoading: false,
          error: getErrorMessage(error, "Registration failed."),
        });

        throw error;
      }
    },

    login: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const response = await AuthService.login(payload);

        if (response?.success === false) {
          throw new Error(response.message || "Login failed.");
        }

        const token = getLoginToken(response);

        if (!token) {
          throw new Error("The server did not return an access token.");
        }

        const fallbackUser = getLoginUser(response, payload.email);

        // Save the token before requesting /user/profile because that route
        // requires Authorization: Bearer <accessToken>.
        await persistAuthSession(token, fallbackUser);

        let user = fallbackUser;

        try {
          const profileResponse = await UserService.getProfile();
          user = getProfileUser(profileResponse, fallbackUser);
          await persistAuthSession(token, user);
        } catch {
          // Login remains valid if profile loading fails temporarily.
          // The app can retry profile loading on the profile screen.
        }

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          pendingEmail: null,
        });
      } catch (error) {
        await clearAuthSession();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: getErrorMessage(error, "Login failed."),
        });

        throw error;
      }
    },

    verifyEmail: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const response = await AuthService.verifyEmail(payload);

        if (response?.success === false) {
          throw new Error(response.message || "Email verification failed.");
        }

        set({
          isLoading: false,
          pendingEmail: null,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: getErrorMessage(error, "Email verification failed."),
        });

        throw error;
      }
    },

    resendOtp: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const response = await AuthService.resendOtp(payload);

        if (response?.success === false) {
          throw new Error(response.message || "Unable to resend OTP.");
        }

        set({ isLoading: false, error: null });
      } catch (error) {
        set({
          isLoading: false,
          error: getErrorMessage(error, "Unable to resend OTP."),
        });

        throw error;
      }
    },

    requestPasswordReset: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const response = await AuthService.requestPasswordReset(payload);

        if (response?.success === false) {
          throw new Error(response.message || "Unable to request password reset.");
        }

        set({
          isLoading: false,
          pendingEmail: payload.email,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: getErrorMessage(error, "Unable to request password reset."),
        });

        throw error;
      }
    },

    resetPassword: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        const response = await AuthService.resetPassword(payload);

        if (response?.success === false) {
          throw new Error(response.message || "Unable to reset password.");
        }

        set({
          isLoading: false,
          pendingEmail: null,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: getErrorMessage(error, "Unable to reset password."),
        });

        throw error;
      }
    },

    socialLogin: async (payload) => {
      set({ isLoading: true, error: null });

      try {
        await AuthService.socialLogin(payload);
      } catch (error) {
        set({
          isLoading: false,
          error: getErrorMessage(
            error,
            "Google and Apple sign-in are not available yet.",
          ),
        });

        throw error;
      }
    },

    logout: async () => {
      set({ isLoading: true, error: null });

      try {
        await AuthService.logout();
      } catch {
        // Clear the local session even if the network request fails.
      } finally {
        await clearAuthSession();
        useUserStore.getState().clearProfile();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
          error: null,
          pendingEmail: null,
        });
      }
    },

    clearError: () => set({ error: null }),
  };
});

export default useAuthStore;