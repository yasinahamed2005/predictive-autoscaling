// Drop-in replacement for memoryCache.js once you're running more than one
// server instance and need a cache shared across processes.
//   npm install ioredis
//
// import Redis from 'ioredis';
// const redis = new Redis(process.env.REDIS_URL);
//
// export const cache = {
//   async get(key) {
//     const raw = await redis.get(key);
//     return raw ? JSON.parse(raw) : undefined;
//   },
//   async set(key, value, ttlSeconds = 60) {
//     await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
//   },
//   async del(key) {
//     await redis.del(key);
//   },
// };
