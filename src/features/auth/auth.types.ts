// ─── Auth feature types ───────────────────────────────────────────────────────

import type { User } from '@/shared/types/common.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirm_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface MeResponse {
  success: boolean;
  data: User;
}
