import mongoose from 'mongoose';
import { env } from './env';

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!cachedPromise) {
    // Hide credentials when logging connection target
    const sanitizedUri = env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`⏳ Connecting to MongoDB at: ${sanitizedUri}...`);

    cachedPromise = mongoose
      .connect(env.MONGODB_URI, {
        autoIndex: env.NODE_ENV !== 'production',
        serverSelectionTimeoutMS: 5000,
      })
      .then((conn) => {
        console.log(`✅ MongoDB connected successfully: [${conn.connection.name}]`);
        return conn;
      })
      .catch((error) => {
        cachedPromise = null;
        console.error('❌ MongoDB connection error:', error instanceof Error ? error.message : error);
        throw error;
      });
  }

  return cachedPromise;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting reconnection...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err);
});
