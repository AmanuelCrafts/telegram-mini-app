import crypto from 'crypto';

/**
 * Perform a constant-time comparison of two hex-encoded hash strings
 * to protect against timing side-channel attacks.
 */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  // Ensure both strings are valid hex
  if (!/^[0-9a-fA-F]+$/.test(a) || !/^[0-9a-fA-F]+$/.test(b)) {
    return false;
  }

  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');

  // If buffer lengths differ, crypto.timingSafeEqual will throw an error.
  // Instead of an early return with different execution timing, compare against dummy buffer of equal length.
  if (bufA.length !== bufB.length || bufA.length === 0) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Generate a cryptographically secure random session token.
 */
export function generateSessionToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate official Telegram Mini App data check string.
 * All keys (except 'hash') are sorted alphabetically and joined with newline.
 */
export function buildDataCheckString(params: Map<string, string> | Record<string, string>): string {
  const entries: [string, string][] =
    params instanceof Map
      ? Array.from(params.entries())
      : Object.entries(params);

  return entries
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

/**
 * Compute the HMAC-SHA256 signature for Telegram Mini App data according to Telegram specs:
 * 1. secret_key = HMAC_SHA256("WebAppData", bot_token)
 * 2. calculated_hash = HMAC_SHA256(secret_key, data_check_string).hex()
 */
export function computeTelegramHash(dataCheckString: string, botToken: string): string {
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  return crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
}

/**
 * Utility helper to build and sign Telegram initData string.
 * Used for testing and simulation.
 */
export function generateTestInitData(params: Record<string, string>, botToken: string): string {
  const searchParams = new URLSearchParams();
  const sortedKeys = Object.keys(params).filter((k) => k !== 'hash').sort();

  const dataCheckString = sortedKeys.map((k) => `${k}=${params[k]}`).join('\n');
  const hash = computeTelegramHash(dataCheckString, botToken);

  for (const key of sortedKeys) {
    searchParams.set(key, params[key]);
  }
  searchParams.set('hash', hash);

  return searchParams.toString();
}
