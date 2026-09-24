// Minimal in-process TTL cache. Fine for a single instance / low traffic;
// swap for Redis (see cache/redisCache.example.js) once you run more than
// one server process, since this cache is NOT shared across instances.
const store = new Map();

export const memoryCache = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  },

  set(key, value, ttlSeconds = 60) {
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  del(key) {
    store.delete(key);
  },

  clear() {
    store.clear();
  },
};

// Wraps an async function with a cached result, keyed by `key`.
export const withCache = (key, ttlSeconds, fn) => async (...args) => {
  const cached = memoryCache.get(key);
  if (cached !== undefined) return cached;
  const result = await fn(...args);
  memoryCache.set(key, result, ttlSeconds);
  return result;
};
