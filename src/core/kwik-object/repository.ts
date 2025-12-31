/**
 * KwikObject Repository
 *
 * Handles persistence of KwikObject metadata.
 * Uses Redis for fast access and automatic expiry.
 */

import "server-only";

import type { KwikObjectMeta } from "./types";
import { redis } from "@/lib/redis";

/** Redis key prefix for object metadata */
const META_PREFIX = "kwik:meta:";

/** Redis key prefix for claim locks */
const LOCK_PREFIX = "kwik:lock:";

/**
 * Saves KwikObject metadata to Redis.
 *
 * @param meta - Object metadata to save
 * @returns Promise resolving when saved
 */
export async function saveMeta(meta: KwikObjectMeta): Promise<void> {
  const key = `${META_PREFIX}${meta.id}`;
  const serialized = JSON.stringify(meta);

  if (meta.expiresAt !== null) {
    // Set with expiry - add 1 hour buffer for cleanup grace period
    const ttlMs = meta.expiresAt - Date.now() + 3600000;
    const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
    await redis.setex(key, ttlSeconds, serialized);
  } else {
    // No expiry
    await redis.set(key, serialized);
  }
}

/**
 * Retrieves KwikObject metadata from Redis.
 *
 * @param id - Object ID
 * @returns Object metadata or null if not found
 */
export async function getMeta(id: string): Promise<KwikObjectMeta | null> {
  const key = `${META_PREFIX}${id}`;
  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  return JSON.parse(data) as KwikObjectMeta;
}

/**
 * Deletes KwikObject metadata from Redis.
 *
 * @param id - Object ID
 * @returns Promise resolving when deleted
 */
export async function deleteMeta(id: string): Promise<void> {
  const key = `${META_PREFIX}${id}`;
  await redis.del(key);
}

/**
 * Updates KwikObject metadata in Redis.
 * Performs a full replacement.
 *
 * @param meta - Updated metadata
 * @returns Promise resolving when updated
 */
export async function updateMeta(meta: KwikObjectMeta): Promise<void> {
  // Reuse saveMeta as it handles TTL correctly
  await saveMeta(meta);
}

/**
 * Attempts to acquire a claim lock for atomic claim operations.
 * Uses Redis SET NX with expiry for distributed locking.
 *
 * @param id - Object ID
 * @param lockDurationMs - Lock duration in milliseconds (default: 30 seconds)
 * @returns true if lock acquired, false if already locked
 */
export async function acquireClaimLock(
  id: string,
  lockDurationMs: number = 30000
): Promise<boolean> {
  const key = `${LOCK_PREFIX}${id}`;
  const lockValue = Date.now().toString();
  const ttlSeconds = Math.ceil(lockDurationMs / 1000);

  // SET key value NX EX seconds
  const client = await import("@/lib/redis").then((m) => m.getRedis());
  const result = await client.set(key, lockValue, "EX", ttlSeconds, "NX");

  return result === "OK";
}

/**
 * Releases a claim lock.
 *
 * @param id - Object ID
 * @returns Promise resolving when released
 */
export async function releaseClaimLock(id: string): Promise<void> {
  const key = `${LOCK_PREFIX}${id}`;
  await redis.del(key);
}

/**
 * Checks if an object exists without fetching full metadata.
 *
 * @param id - Object ID
 * @returns true if exists
 */
export async function exists(id: string): Promise<boolean> {
  const key = `${META_PREFIX}${id}`;
  const result = await redis.exists(key);
  return result === 1;
}
