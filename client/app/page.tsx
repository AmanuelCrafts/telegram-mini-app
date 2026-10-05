'use client';

import React from 'react';
import { AuthError } from '../components/AuthError';
import { AuthLoading } from '../components/AuthLoading';
import { NonTelegramAccess } from '../components/NonTelegramAccess';
import { UserProfile } from '../components/UserProfile';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, status, error, logout, retry } = useAuth();

  switch (status) {
    case 'loading':
      return <AuthLoading />;

    case 'non_telegram':
      return <NonTelegramAccess />;

    case 'error':
      return <AuthError error={error} onRetry={retry} />;

    case 'unauthenticated':
      // When unauthenticated, show error with option to re-authenticate
      return (
        <AuthError
          error="You have been signed out. Please authenticate via Telegram."
          onRetry={retry}
        />
      );

    case 'authenticated':
      if (!user) {
        return <AuthLoading />;
      }
      return <UserProfile user={user} onLogout={logout} />;

    default:
      return <AuthLoading />;
  }
}
