import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

// Zod schema for Telegram authentication request
export const telegramLoginSchema = z.object({
  initData: z
    .string({
      required_error: 'initData is required',
      invalid_type_error: 'initData must be a string',
    })
    .trim()
    .min(1, 'initData cannot be empty'),
});

/**
 * POST /api/auth/telegram
 * Rate limited, validated Telegram Mini App authentication
 */
router.post(
  '/telegram',
  authRateLimiter,
  validateBody(telegramLoginSchema),
  authController.loginWithTelegram
);

/**
 * GET /api/auth/me
 * Protected endpoint returning current user profile
 */
router.get('/me', requireAuth, authController.getMe);

/**
 * POST /api/auth/logout
 * Invalidate session and clear cookie
 */
router.post('/logout', authController.logout);

export default router;
