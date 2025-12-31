/**
 * Global Stats Types
 *
 * Defines the shape of privacy-preserving global statistics.
 *
 * PRIVACY NOTE:
 * These stats are intentionally aggregate-only. They track WHAT happens
 * to the system, not WHO does it. No user identifiers, IPs, timestamps,
 * or per-session data is ever recorded.
 */

/**
 * Global system statistics.
 *
 * All counters are monotonically increasing and never reset.
 * This prevents any attempt to infer per-session activity.
 */
export interface GlobalStats {
  /** Total number of Kwik Objects successfully created */
  totalUploads: number;

  /** Total number of successful object claims/downloads */
  totalClaims: number;

  /** Total number of objects auto-expired and deleted */
  totalExpired: number;
}

/**
 * Public-facing stats response.
 *
 * Uses friendlier field names for the API response.
 * Intentionally a subset of internal stats to allow
 * future internal-only metrics if needed.
 */
export interface StatsResponse {
  uploads: number;
  claims: number;
  expired: number;
}

/**
 * Converts internal stats to public response format.
 */
export function toStatsResponse(stats: GlobalStats): StatsResponse {
  return {
    uploads: stats.totalUploads,
    claims: stats.totalClaims,
    expired: stats.totalExpired,
  };
}
