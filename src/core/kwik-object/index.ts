/**
 * KwikObject Module - Client-Safe Exports
 *
 * This file only exports types and pure functions that are safe
 * for use in client components. Server-only code (repository, service)
 * should be imported from './service' or './repository' directly
 * in server components or API routes.
 */

// Types (all are client-safe)
export type {
  KwikObjectStatus,
  KwikObjectMeta,
  KwikObjectPublicMeta,
  CreateKwikObjectRequest,
  CreateKwikObjectResponse,
  ClaimKwikObjectResponse,
  ClaimErrorCode,
  ExpiryOption,
} from "./types";

export { EXPIRY_OPTIONS, MAX_FILE_SIZE, MAX_EXPIRY_SECONDS } from "./types";

// Model functions (all are pure, client-safe)
export {
  isClaimable,
  getEffectiveStatus,
  getRemainingTime,
  toPublicMeta,
  isValidExpiry,
  isValidFileSize,
  generateStorageKey,
} from "./model";

// NOTE: Service functions are NOT exported here to prevent
// client-side bundling of server-only dependencies (Redis, S3).
// Import from '@/core/kwik-object/service' directly in server contexts.
