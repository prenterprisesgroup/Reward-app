/**
 * Abstract Cache Service
 * Provides single-flight locking (request coalescing) to prevent cache stampedes.
 * Currently uses an in-memory Map. Can be seamlessly upgraded to Redis.
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.promises = new Map(); // For single-flight request coalescing
  }

  /**
   * Get value from cache or execute the fetcher function.
   * If multiple requests hit while the fetcher is running, they will wait on the same Promise.
   * @param {string} key 
   * @param {number} ttlSeconds 
   * @param {Function} fetcher - Async function that returns the data
   */
  async getOrSet(key, ttlSeconds, fetcher) {
    const now = Date.now();
    const cachedItem = this.cache.get(key);

    // 1. Cache Hit
    if (cachedItem && cachedItem.expiresAt > now) {
      return {
        data: cachedItem.data,
        cached: true,
        cacheAge: Math.floor((now - cachedItem.createdAt) / 1000)
      };
    }

    // 2. Cache Miss & Single-Flight Lock
    if (this.promises.has(key)) {
      // Stampede protection: Wait for the in-flight promise instead of running fetcher again
      try {
        const data = await this.promises.get(key);
        return {
          data,
          cached: true,
          cacheAge: 0
        };
      } catch (err) {
        // If the in-flight promise fails, we fall through and might try again
        // but typically we let it bubble up.
        throw err;
      }
    }

    // 3. Execution
    const promise = fetcher().then((data) => {
      this.cache.set(key, {
        data,
        createdAt: now,
        expiresAt: now + (ttlSeconds * 1000)
      });
      this.promises.delete(key);
      return data;
    }).catch((err) => {
      this.promises.delete(key);
      throw err;
    });

    this.promises.set(key, promise);
    
    const data = await promise;
    return {
      data,
      cached: false,
      cacheAge: 0
    };
  }

  /**
   * Explicitly clear cache keys by prefix or exact match
   */
  invalidate(keyPrefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Helper to invalidate all analytics cache
   */
  invalidateAnalytics() {
    this.invalidate('analytics:');
  }
}

// Export as a singleton
module.exports = new CacheService();
