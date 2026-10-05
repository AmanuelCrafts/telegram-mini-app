import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { TooManyRequestsError } from '../utils/errors';

/**
 * Rate limiter middleware for authentication endpoints.
 * Protects against brute-force or replay attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: env.AUTH_RATE_LIMIT, // Configurable limit per window per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError(`Too many authentication attempts. Please wait a minute and try again.`));
  },
});
