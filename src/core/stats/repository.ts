/**
 * Global Stats Repository
 *
 * Handles persistence of global statistics in Redis.
 * Uses atomic operations for concurrency safety.
 *
 * DESIGN DECISIONS:
 * - Single Redis hash key for all stats (atomic reads)
 * - HINCRBY for atomic increments (no race conditions)
 * - Stats persist across restarts (Redis persistence)
 * - Stats never reset automatically (privacy by design)
 */

import "server-only";

import type { GlobalStats } from "./types";
import { getRedis } from "@/lib/redis";

/** Redis key for global stats hash */
const STATS_KEY = "kwik:stats";

/** Field names in the Redis hash */
const FIELDS = {
  totalUploads: "totalUploads",
  totalClaims: "totalClaims",
  totalExpired: "totalExpired",
} as const;

/**
 * Retrieves current global statistics.
 *
 * Returns zeros for any missing fields (handles fresh installs).
 */
export async function getStats(): Promise<GlobalStats> {
  const redis = getRedis();
  const data = await redis.hgetall(STATS_KEY);

  // Parse with defaults for missing fields
  // This gracefully handles fresh installs or partial data
  return {
    totalUploads: parseInt(data[FIELDS.totalUploads] || "0", 10),
    totalClaims: parseInt(data[FIELDS.totalClaims] || "0", 10),
    totalExpired: parseInt(data[FIELDS.totalExpired] || "0", 10),
  };
}

/**
 * Atomically increments the upload counter.
 *
 * Called when a Kwik Object is successfully created.
 */
export async function incrementUploads(): Promise<void> {
  const redis = getRedis();
  await redis.hincrby(STATS_KEY, FIELDS.totalUploads, 1);
}

/**
 * Atomically increments the claims counter.
 *
 * Called when a Kwik Object is successfully claimed/downloaded.
 */
export async function incrementClaims(): Promise<void> {
  const redis = getRedis();
  await redis.hincrby(STATS_KEY, FIELDS.totalClaims, 1);
}

/**
 * Atomically increments the expired counter.
 *
 * Called when a Kwik Object is auto-expired and deleted.
 * Note: Currently not called because we don't have a background
 * expiry job - Redis TTL handles expiry, and we increment this
 * when we detect an expired object during claim attempts.
 */
export async function incrementExpired(): Promise<void> {
  const redis = getRedis();
  await redis.hincrby(STATS_KEY, FIELDS.totalExpired, 1);
}
