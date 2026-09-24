import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

mongoose.set('strictQuery', true);
// Disable Mongoose command buffering when disconnected to prevent timeouts
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  const uri = env.MONGODB_URI;
  if (!uri) {
    logger.info('ℹ️ Running server in Standalone Mode (Set MONGODB_URI in .env to connect to MongoDB Atlas)');
    return;
  }

  const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: isLocal ? 1500 : 5000,
    });
    logger.info(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    mongoose.connection.on('error', (err) => logger.error(`MongoDB error: ${err.message}`));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  } catch (err) {
    if (isLocal) {
      logger.info('ℹ️ Local MongoDB service not detected. Server is running smoothly in Standalone Mode.');
      logger.info('👉 To connect your online MongoDB Atlas cluster, update MONGODB_URI in backend/.env');
    } else {
      logger.warn(`⚠️ MongoDB Atlas Connection Failed: ${err.message}`);
    }
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};
