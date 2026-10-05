import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { SESSION_COOKIE_NAME, sessionService } from '../services/session.service';
import { UnauthorizedError } from '../utils/errors';

export class AuthController {
  /**
   * POST /api/auth/telegram
   * Authenticate user with Telegram initData, establish session, and set HTTP-only cookie.
   */
  public async loginWithTelegram(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { initData } = req.body as { initData: string };

      // 1. Authenticate user from verified Telegram initData
      const user = await authService.authenticateTelegram(initData);

      // 2. Create authenticated session in database
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;
      const session = await sessionService.createSession(user._id, userAgent, ipAddress);

      // 3. Set secure HTTP-only signed session cookie
      const cookieOptions = sessionService.getCookieOptions();
      res.cookie(SESSION_COOKIE_NAME, session.sessionId, cookieOptions);

      // 4. Return sanitized user data
      res.status(200).json({
        user: authService.formatUserResponse(user),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Return currently authenticated user profile.
   */
  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      res.status(200).json({
        user: authService.formatUserResponse(req.user),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Destroy session from database and clear HTTP-only cookie.
   */
  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId =
        req.signedCookies?.[SESSION_COOKIE_NAME] ||
        req.cookies?.[SESSION_COOKIE_NAME];

      if (sessionId) {
        await sessionService.invalidateSession(sessionId);
      }

      // Clear cookie with matching options
      const cookieOptions = sessionService.getCookieOptions();
      res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        path: cookieOptions.path,
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
