import apiClient from "@/api/client";
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SocialLoginRequest,
  SocialLoginResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "@/types/auth.types";

const AuthService = {
  register: async (
    payload: RegisterRequest,
  ): Promise<RegisterResponse> => {
    const { data } =
      await apiClient.post<RegisterResponse>(
        "/auth/register",
        payload,
      );

    return data;
  },

  login: async (
    payload: LoginRequest,
  ): Promise<LoginResponse> => {
    const { data } =
      await apiClient.post<LoginResponse>(
        "/auth/login",
        payload,
      );

    return data;
  },

  verifyEmail: async (
    payload: VerifyEmailRequest,
  ): Promise<VerifyEmailResponse> => {
    const { data } =
      await apiClient.post<VerifyEmailResponse>(
        "/auth/verify-email",
        payload,
      );

    return data;
  },

  resendOtp: async (
    payload: ResendOtpRequest,
  ): Promise<ResendOtpResponse> => {
    const { data } =
      await apiClient.post<ResendOtpResponse>(
        "/auth/resend-otp",
        payload,
      );

    return data;
  },

  requestPasswordReset: async (
    payload: RequestPasswordResetRequest,
  ): Promise<RequestPasswordResetResponse> => {
    const { data } =
      await apiClient.post<RequestPasswordResetResponse>(
        "/auth/request-password-reset",
        payload,
      );

    return data;
  },

  resetPassword: async (
    payload: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> => {
    const { data } =
      await apiClient.post<ResetPasswordResponse>(
        "/auth/reset-password",
        payload,
      );

    return data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const { data } =
      await apiClient.get<RefreshTokenResponse>(
        "/auth/refresh-token",
      );

    return data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const { data } =
      await apiClient.post<LogoutResponse>("/user/logout");

    return data;
  },

  healthCheck: async (): Promise<{ status: string }> => {
    const { data } = await apiClient.get<{ status: string }>(
      "/health",
    );

    return data;
  },

  socialLogin: async (
    _payload: SocialLoginRequest,
  ): Promise<SocialLoginResponse> => {
    throw new Error(
      "Google and Apple sign-in are not yet enabled on the Telefya backend.",
    );
  },
};

export default AuthService;