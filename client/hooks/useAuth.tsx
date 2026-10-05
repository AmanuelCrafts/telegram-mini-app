'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api';
import { getTelegramWebApp, initTelegramWebApp, triggerHaptic } from '../lib/telegram';
import { authApiService } from '../services/auth.service';
import { AuthContextType, AuthStatus, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async () => {
    setStatus('loading');
    setError(null);

    // 1. Initialize Telegram WebApp viewport & theme
    initTelegramWebApp();
    const tg = getTelegramWebApp();

    // 2. Try to restore existing session first
    try {
      const meResponse = await authApiService.getMe();
      setUser(meResponse.user);
      setStatus('authenticated');
      return;
    } catch {
      // No active session or expired cookie; proceed to Telegram authentication
    }

    // 3. Check if running inside Telegram environment with initData
    if (!tg || !tg.initData || tg.initData.trim() === '') {
      setStatus('non_telegram');
      return;
    }

    // 4. Send initData to backend for HMAC verification
    try {
      const response = await authApiService.loginWithTelegram(tg.initData);
      setUser(response.user);
      setStatus('authenticated');
      triggerHaptic('notification', 'success');
    } catch (err) {
      console.error('Telegram authentication error:', err);
      triggerHaptic('notification', 'error');

      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Unable to verify your Telegram account.';
      setError(message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  const logout = useCallback(async () => {
    triggerHaptic('impact', 'medium');
    try {
      await authApiService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const retry = useCallback(async () => {
    triggerHaptic('impact', 'light');
    await authenticate();
  }, [authenticate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        login: authenticate,
        logout,
        retry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
