import { NextFunction, Request, Response } from 'express';
import { ISession } from '../models/session.model';
import { IUser, User } from '../models/user.model';
import { SESSION_COOKIE_NAME, sessionService } from '../services/session.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

// Extend Express Request interface to include authenticated user and session
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      session?: ISession;
    }
  }
}

/**
 * Authentication middleware that verifies session cookie,
 * loads the active session and user from MongoDB, and attaches them to req.
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Read session ID from signed cookie, fallback to unsigned cookie
    const sessionId =
      req.signedCookies?.[SESSION_COOKIE_NAME] ||
      req.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionId || typeof sessionId !== 'string') {
      throw new UnauthorizedError('Authentication required');
    }

    // Lookup session in MongoDB
    const session = await sessionService.findValidSession(sessionId);
    if (!session) {
      throw new UnauthorizedError('Session expired or invalid. Please sign in again.');
    }

    // Lookup user in MongoDB
    const user = await User.findById(session.userId);
    if (!user) {
      // Invalidate orphaned session
      await sessionService.invalidateSession(sessionId);
      throw new UnauthorizedError('User account not found');
    }

    // Verify user is not suspended
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Your account has been suspended');
    }

    // Attach to request object
    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    next(error);
  }
};
