import apiClient from "@/api/client";
import {
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  LoginResponse,
  RegisterResponse,
  VerifyEmailResponse,
  ResendOtpResponse,
  RequestPasswordResetResponse,
  ResetPasswordResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from "@/types/auth.types";
import { SocialLoginRequest, SocialLoginResponse } from "@/types/auth.types";

const AuthService = {
  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>(
      "/auth/register",
      payload,
    );
    return data;
  },

  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      payload,
    );
    return data;
  },

  verifyEmail: async (
    payload: VerifyEmailRequest,
  ): Promise<VerifyEmailResponse> => {
    const { data } = await apiClient.post<VerifyEmailResponse>(
      "/auth/verify-email",
      payload,
    );
    return data;
  },

  resendOtp: async (payload: ResendOtpRequest): Promise<ResendOtpResponse> => {
    const { data } = await apiClient.post<ResendOtpResponse>(
      "/auth/resend-otp",
      payload,
    );
    return data;
  },

  requestPasswordReset: async (
    payload: RequestPasswordResetRequest,
  ): Promise<RequestPasswordResetResponse> => {
    const { data } = await apiClient.post<RequestPasswordResetResponse>(
      "/auth/request-password-reset",
      payload,
    );
    return data;
  },

  resetPassword: async (
    payload: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> => {
    const { data } = await apiClient.post<ResetPasswordResponse>(
      "/auth/reset-password",
      payload,
    );
    return data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const { data } = await apiClient.get<RefreshTokenResponse>(
      "/auth/refresh-token",
    );
    return data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const { data } = await apiClient.post<LogoutResponse>("/users/logout");
    return data;
  },

  socialLogin: async (
    payload: SocialLoginRequest,
  ): Promise<SocialLoginResponse> => {
    const endpoint =
      payload.provider === "google"
        ? "/auth/social/google"
        : "/auth/social/apple";

    const { data } = await apiClient.post<SocialLoginResponse>(
      endpoint,
      payload,
    );
    return data;
  },
};

export default AuthService;
