import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  enableOfflineQueue: false,
  retryStrategy(times) {
    // Increase delay between retries up to 10 seconds to avoid spamming
    return Math.min(times * 1000, 10000);
  },
});

let isFirstError = true;

redis.on('error', (error: Error) => {
  if (isFirstError) {
    console.error('❌ Redis connection error:', error.message);
    console.error('💡 => Please ensure Redis is running locally on port 6379.');
    console.error('💡 => The backend will keep retrying quietly and fallback to DB when needed.');
    isFirstError = false;
  }
});
