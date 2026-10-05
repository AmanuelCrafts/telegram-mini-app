import { Request, Response, Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'telegram-rewards-api',
  });
});

// Authentication routes
router.use('/auth', authRoutes);

export default router;
