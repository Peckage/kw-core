/**
 * Redis Client Module
 *
 * Provides a configured Redis client for metadata storage and caching.
 * Uses ioredis for reliable Redis connections with automatic reconnection.
 */

import "server-only";

import Redis from "ioredis";

/**
 * Redis client configuration.
 */
interface RedisConfig {
  url: string;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
}

/**
 * Gets Redis configuration from environment.
 */
function getConfig(): RedisConfig {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error("REDIS_URL environment variable is required");
  }

  return {
    url,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
  };
}

/**
 * Creates a new Redis client instance.
 */
function createClient(): Redis {
  const config = getConfig();

  const client = new Redis(config.url, {
    maxRetriesPerRequest: config.maxRetriesPerRequest,
    enableReadyCheck: config.enableReadyCheck,
    retryStrategy: (times) => {
      // Exponential backoff with max delay of 30 seconds
      const delay = Math.min(times * 100, 30000);
      return delay;
    },
    reconnectOnError: (err) => {
      // Reconnect on READONLY errors (Redis failover)
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

  // Error handling
  client.on("error", (error) => {
    console.error("[Redis] Connection error:", error.message);
  });

  client.on("connect", () => {
    console.log("[Redis] Connected");
  });

  client.on("ready", () => {
    console.log("[Redis] Ready");
  });

  client.on("close", () => {
    console.log("[Redis] Connection closed");
  });

  return client;
}

/**
 * Singleton Redis client instance.
 * Uses lazy initialization to avoid connection during module load.
 */
let redisInstance: Redis | null = null;

/**
 * Gets the Redis client instance.
 * Creates a new connection if one doesn't exist.
 */
export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = createClient();
  }
  return redisInstance;
}

/**
 * Closes the Redis connection.
 * Call during graceful shutdown.
 */
export async function closeRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
    console.log("[Redis] Disconnected");
  }
}

/**
 * Default export for convenience.
 */
export const redis = {
  get instance() {
    return getRedis();
  },

  async get(key: string): Promise<string | null> {
    return getRedis().get(key);
  },

  async set(key: string, value: string): Promise<"OK"> {
    return getRedis().set(key, value);
  },

  async setex(key: string, seconds: number, value: string): Promise<"OK"> {
    return getRedis().setex(key, seconds, value);
  },

  async del(key: string): Promise<number> {
    return getRedis().del(key);
  },

  async exists(key: string): Promise<number> {
    return getRedis().exists(key);
  },

  async expire(key: string, seconds: number): Promise<number> {
    return getRedis().expire(key, seconds);
  },

  async ttl(key: string): Promise<number> {
    return getRedis().ttl(key);
  },
};

export default redis;
