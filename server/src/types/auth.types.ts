export interface TelegramUserPayload {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  allows_write_to_pm?: boolean;
}

export interface VerifiedTelegramData {
  user: TelegramUserPayload;
  authDate: number;
  queryId?: string;
  hash: string;
  rawParams: Record<string, string>;
}

export interface AuthUserResponse {
  id: string;
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'SUSPENDED';
}
