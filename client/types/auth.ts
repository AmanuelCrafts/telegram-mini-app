export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error' | 'non_telegram';

export interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  retry: () => Promise<void>;
}
