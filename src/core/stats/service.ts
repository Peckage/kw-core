/**
 * Global Stats Service
 *
 * Provides the service-layer API for stats operations.
 * This is the ONLY place where stats mutations should occur.
 *
 * ARCHITECTURE NOTE:
 * API routes should only call getGlobalStats() for reads.
 * Stat increments are called internally from the kwik-object service.
 */

import "server-only";

import type { StatsResponse } from "./types";
import { toStatsResponse } from "./types";
import * as repository from "./repository";

/**
 * Retrieves current global statistics.
 *
 * Safe for public consumption - no sensitive data exposed.
 */
export async function getGlobalStats(): Promise<StatsResponse> {
  const stats = await repository.getStats();
  return toStatsResponse(stats);
}

/**
 * Records a successful upload.
 *
 * MUST be called only when a Kwik Object is successfully created.
 */
export async function recordUpload(): Promise<void> {
  await repository.incrementUploads();
}

/**
 * Records a successful claim.
 *
 * MUST be called only when a Kwik Object is successfully claimed.
 */
export async function recordClaim(): Promise<void> {
  await repository.incrementClaims();
}

/**
 * Records an object expiration.
 *
 * MUST be called only when a Kwik Object expires and is cleaned up.
 */
export async function recordExpiry(): Promise<void> {
  await repository.incrementExpired();
}
