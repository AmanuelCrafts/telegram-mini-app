import { apiClient } from '../lib/api';
import { User } from '../types/auth';

interface AuthResponse {
  user: User;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

export const authApiService = {
  /**
   * Send Telegram WebApp initData to backend for HMAC verification and session creation.
   */
  async loginWithTelegram(initData: string): Promise<AuthResponse> {
    return apiClient<AuthResponse>('api/auth/telegram', {
      method: 'POST',
      data: { initData },
    });
  },

  /**
   * Fetch currently authenticated user using session cookie.
   */
  async getMe(): Promise<AuthResponse> {
    return apiClient<AuthResponse>('api/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Invalidate session on backend and clear session cookie.
   */
  async logout(): Promise<LogoutResponse> {
    return apiClient<LogoutResponse>('api/auth/logout', {
      method: 'POST',
    });
  },
};
