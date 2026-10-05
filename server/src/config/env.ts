import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').default('mongodb://localhost:27017/telegram_rewards'),
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters'),
  FRONTEND_URL: z.string().min(1, 'FRONTEND_URL is required').default('http://localhost:3000'),
  AUTH_RATE_LIMIT: z.coerce.number().default(10),
  SESSION_MAX_AGE_DAYS: z.coerce.number().default(7),
  // Telegram auth_date expiration limit (default 24 hours = 86400 seconds)
  AUTH_DATE_MAX_AGE_SECONDS: z.coerce.number().default(86400),
  COOKIE_SAME_SITE: z.enum(['lax', 'none', 'strict']).default('lax'),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parseEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(`\n❌ Configuration Error: Missing or invalid environment variables:\n${errorDetails}\n`);
    throw new Error('Invalid environment configuration');
  }
  return result.data;
};

export const env = parseEnv();
