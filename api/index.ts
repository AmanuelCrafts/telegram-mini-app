import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server/src/app';
import { connectDatabase } from '../server/src/config/database';

/**
 * Vercel Serverless Function entrypoint.
 * Automatically handles /api/* routes via Express.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await connectDatabase();
  app(req, res);
}
