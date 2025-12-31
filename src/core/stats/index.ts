/**
 * Global Stats Module Exports
 *
 * Public API for the stats module.
 *
 * NOTE: Only the read function is exported from the barrel.
 * Mutation functions (recordUpload, recordClaim, recordExpiry)
 * should be imported directly from './service' by the kwik-object
 * service to maintain clear dependency boundaries.
 */

// Types (client-safe)
export type { GlobalStats, StatsResponse } from "./types";

// Service (for API routes - read only)
export { getGlobalStats } from "./service";
