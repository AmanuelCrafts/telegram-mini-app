import { CookieOptions } from 'express';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { ISession, Session } from '../models/session.model';
import { generateSessionToken } from '../utils/crypto';

export const SESSION_COOKIE_NAME = 'tg_session_id';

export class SessionService {
  /**
   * Create and persist a new authenticated session in MongoDB.
   */
  public async createSession(
    userId: Types.ObjectId,
    userAgent?: string,
    ipAddress?: string
  ): Promise<ISession> {
    const sessionId = generateSessionToken(32);
    const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

    const session = await Session.create({
      sessionId,
      userId,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return session;
  }

  /**
   * Find a valid, non-expired session by its sessionId.
   * If found but expired, it is deleted and null is returned.
   */
  public async findValidSession(sessionId: string): Promise<ISession | null> {
    if (!sessionId || typeof sessionId !== 'string') {
      return null;
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return null;
    }

    // Check expiration explicitly (in addition to MongoDB TTL)
    if (session.expiresAt.getTime() <= Date.now()) {
      await Session.deleteOne({ _id: session._id });
      return null;
    }

    return session;
  }

  /**
   * Invalidate a session by sessionId (logout).
   */
  public async invalidateSession(sessionId: string): Promise<boolean> {
    if (!sessionId) return false;
    const result = await Session.deleteOne({ sessionId });
    return result.deletedCount > 0;
  }

  /**
   * Invalidate all active sessions for a user (e.g. security reset).
   */
  public async invalidateAllUserSessions(userId: Types.ObjectId): Promise<number> {
    const result = await Session.deleteMany({ userId });
    return result.deletedCount;
  }

  /**
   * Returns secure HTTP-only cookie configuration based on current environment.
   */
  public getCookieOptions(): CookieOptions {
    const isProduction = env.NODE_ENV === 'production';
    const maxAgeMs = env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    return {
      httpOnly: true,
      secure: isProduction,
      // For Telegram Mini App iframes in production, 'none' SameSite is required with Secure.
      // In local development, 'lax' is used.
      sameSite: isProduction ? 'none' : env.COOKIE_SAME_SITE,
      signed: true,
      maxAge: maxAgeMs,
      path: '/',
    };
  }
}

export const sessionService = new SessionService();
