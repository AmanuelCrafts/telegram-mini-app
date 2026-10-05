import type { IncomingMessage, ServerResponse } from 'http';
import app from '../src/app';
import { connectDatabase } from '../src/config/database';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await connectDatabase();
  app(req, res);
}
