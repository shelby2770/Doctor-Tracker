import mongoose from 'mongoose';
import { env } from './env';

/**
 * Connect to MongoDB. Mongoose maintains an internal connection pool,
 * so we connect once at startup and reuse it across requests.
 */
export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected');
  });
  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection error:', err.message);
  });

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
