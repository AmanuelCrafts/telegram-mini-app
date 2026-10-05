import http from 'http';
import { app } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';

let server: http.Server;

async function bootstrap() {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Start HTTP server
    server = app.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Telegram Rewards Server running on port ${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🔒 Allowed Frontend: ${env.FRONTEND_URL}`);
      console.log(`✨ Health Check: http://localhost:${env.PORT}/api/health`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('🔌 HTTP server closed');
      await disconnectDatabase();
      console.log('👋 Process terminated cleanly');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
