import { env } from '../config/env';
import { TelegramUserPayload, VerifiedTelegramData } from '../types/auth.types';
import { buildDataCheckString, computeTelegramHash, timingSafeEqualHex } from '../utils/crypto';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

export class TelegramService {
  private botToken: string;
  private maxAgeSeconds: number;

  constructor(botToken: string = env.TELEGRAM_BOT_TOKEN, maxAgeSeconds: number = env.AUTH_DATE_MAX_AGE_SECONDS) {
    this.botToken = botToken;
    this.maxAgeSeconds = maxAgeSeconds;
  }

  /**
   * Parse and cryptographically verify Telegram WebApp initData string.
   *
   * @param initData Raw query string received from Telegram WebApp
   * @returns VerifiedTelegramData containing parsed user data and auth metadata
   */
  public verifyInitData(initData: string): VerifiedTelegramData {
    if (!initData || typeof initData !== 'string' || initData.trim() === '') {
      throw new BadRequestError('initData is required and cannot be empty');
    }

    const searchParams = new URLSearchParams(initData);
    const hash = searchParams.get('hash');

    if (!hash) {
      throw new UnauthorizedError('Invalid initData: missing hash signature');
    }

    // Convert searchParams to Map for processing
    const paramsMap = new Map<string, string>();
    const rawParams: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      paramsMap.set(key, value);
      rawParams[key] = value;
    });

    // 1. Build canonical data check string
    const dataCheckString = buildDataCheckString(paramsMap);

    // 2. Compute expected HMAC-SHA256 signature
    const calculatedHash = computeTelegramHash(dataCheckString, this.botToken);

    // 3. Timing-safe comparison to prevent timing attacks
    const isSignatureValid = timingSafeEqualHex(hash, calculatedHash);
    if (!isSignatureValid) {
      throw new UnauthorizedError('Telegram authentication verification failed: invalid signature');
    }

    // 4. Validate auth_date expiration
    const authDateStr = searchParams.get('auth_date');
    if (!authDateStr) {
      throw new UnauthorizedError('Invalid initData: missing auth_date');
    }

    const authDate = parseInt(authDateStr, 10);
    if (isNaN(authDate)) {
      throw new UnauthorizedError('Invalid initData: auth_date must be a valid unix timestamp');
    }

    const currentUnixTime = Math.floor(Date.now() / 1000);

    // Reject timestamps set in the future beyond 60s clock skew
    if (authDate > currentUnixTime + 60) {
      throw new UnauthorizedError('Invalid initData: auth_date is in the future');
    }

    // Check expiration
    const ageInSeconds = currentUnixTime - authDate;
    if (ageInSeconds > this.maxAgeSeconds) {
      throw new UnauthorizedError(`Telegram authentication has expired (age: ${ageInSeconds}s, max: ${this.maxAgeSeconds}s)`);
    }

    // 5. Extract and parse user payload
    const userJson = searchParams.get('user');
    if (!userJson) {
      throw new UnauthorizedError('Invalid initData: missing user payload');
    }

    let user: TelegramUserPayload;
    try {
      user = JSON.parse(userJson) as TelegramUserPayload;
    } catch {
      throw new BadRequestError('Invalid initData: user payload is not valid JSON');
    }

    if (!user.id) {
      throw new BadRequestError('Invalid initData: user.id is missing');
    }

    if (!user.first_name) {
      throw new BadRequestError('Invalid initData: user.first_name is missing');
    }

    return {
      user,
      authDate,
      queryId: searchParams.get('query_id') || undefined,
      hash,
      rawParams,
    };
  }
}

export const telegramService = new TelegramService();
