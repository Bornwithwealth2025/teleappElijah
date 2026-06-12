export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  country: string;
  state: string;
  city: string;
  date_of_birth: string;
  country_code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  status: number;
  error?: string | boolean;
  data?: T;
}

export interface AuthUser {
  id: string;
  user_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string | null;
  phone_number?: string;
  country?: string;
  state?: string;
  city?: string;
  date_of_birth?: string;
  is_verified?: number | boolean;
}

export interface LoginResponseData {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponseData {
  user: {
    id?: string;
    user_id?: string;
    email: string;
  };
}

export type LoginResponse = ApiResponse<LoginResponseData>;
export type RegisterResponse = ApiResponse<RegisterResponseData>;
export type VerifyEmailResponse = ApiResponse;
export type ResendOtpResponse = ApiResponse;
export type RequestPasswordResetResponse = ApiResponse;
export type ResetPasswordResponse = ApiResponse;
export type RefreshTokenResponse = ApiResponse<{ accessToken?: string }> & {
  accessToken?: string;
};
export type LogoutResponse = ApiResponse;

export type SocialAuthProvider = "google" | "apple";

export interface SocialLoginRequest {
  provider: SocialAuthProvider;
  identityToken: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
}

export type SocialLoginResponse = LoginResponse;