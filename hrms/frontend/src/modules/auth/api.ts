import {
  type ForgotPasswordInput,
  type GoogleLoginInput,
  type LoginInput,
  type OtpVerifyInput,
  type RegisterFromInviteInput,
} from '@hrms/shared';
import { http } from '@/services/http';
import type { AuthUser } from '@hrms/shared';

interface LoginResponse {
  requiresTwoFactor: boolean;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
}

interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

export const authApi = {
  login: async (payload: LoginInput): Promise<LoginResponse> => {
    const response = await http.post<ApiEnvelope<LoginResponse>>('/auth/login', payload, {
      headers: {
        'x-org-slug': payload.orgSlug,
      },
    });
    return response.data.data;
  },

  register: async (payload: RegisterFromInviteInput): Promise<AuthUser> => {
    const response = await http.post<ApiEnvelope<AuthUser>>('/auth/register', payload);
    return response.data.data;
  },

  verifyOtp: async (payload: OtpVerifyInput): Promise<VerifyOtpResponse> => {
    const response = await http.post<ApiEnvelope<VerifyOtpResponse>>('/auth/verify-otp', payload);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await http.post('/auth/logout');
  },

  forgotPassword: async (payload: ForgotPasswordInput): Promise<void> => {
    await http.post('/auth/forgot-password', payload, {
      headers: {
        'x-org-slug': payload.orgSlug,
      },
    });
  },

  googleLogin: async (payload: GoogleLoginInput): Promise<LoginResponse> => {
    const response = await http.post<ApiEnvelope<LoginResponse>>('/auth/google', payload, {
      headers: {
        'x-org-slug': payload.orgSlug,
      },
    });
    return response.data.data;
  },
};
