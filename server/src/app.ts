import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import apiRoutes from './routes';
import { NotFoundError } from './utils/errors';

export const createApp = (): Application => {
  const app: Application = express();

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible embedding in Telegram WebApp iframes
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. Strict CORS Configuration
  const allowedOrigins = [env.FRONTEND_URL];
  // In development, also allow localhost variants if needed
  if (env.NODE_ENV === 'development') {
    if (!allowedOrigins.includes('http://localhost:3000')) {
      allowedOrigins.push('http://localhost:3000');
    }
    if (!allowedOrigins.includes('http://127.0.0.1:3000')) {
      allowedOrigins.push('http://127.0.0.1:3000');
    }
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Body Parsing
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 4. Cookie Parsing with secret for signed cookies
  app.use(cookieParser(env.SESSION_SECRET));

  // 5. Mount API Routes under /api
  app.use('/api', apiRoutes);

  // 6. Handle 404 for unhandled routes
  app.use((req: Request, _res: Response, next) => {
    next(new NotFoundError(`Resource not found: ${req.method} ${req.originalUrl}`));
  });

  // 7. Centralized Error Handling
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
