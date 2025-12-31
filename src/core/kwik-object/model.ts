/**
 * KwikObject Model
 *
 * Pure domain logic for KwikObject entities.
 * No side effects, no I/O - just business rules.
 */

import type {
  KwikObjectMeta,
  KwikObjectStatus,
  KwikObjectPublicMeta,
} from "./types";

/**
 * Determines if a KwikObject is currently claimable.
 *
 * @param meta - The object metadata
 * @param now - Current timestamp in ms (defaults to Date.now())
 * @returns true if the object can be claimed
 */
export function isClaimable(
  meta: KwikObjectMeta,
  now: number = Date.now()
): boolean {
  // Must be active status
  if (meta.status !== "active") {
    return false;
  }

  // Check expiry
  if (meta.expiresAt !== null && meta.expiresAt < now) {
    return false;
  }

  return true;
}

/**
 * Determines the effective status of a KwikObject, accounting for expiry.
 *
 * @param meta - The object metadata
 * @param now - Current timestamp in ms
 * @returns The effective status
 */
export function getEffectiveStatus(
  meta: KwikObjectMeta,
  now: number = Date.now()
): KwikObjectStatus {
  // If already terminal, return as-is
  if (meta.status === "claimed" || meta.status === "deleted") {
    return meta.status;
  }

  // Check if expired
  if (meta.expiresAt !== null && meta.expiresAt < now) {
    return "expired";
  }

  return meta.status;
}

/**
 * Calculates remaining time until expiry in milliseconds.
 *
 * @param meta - The object metadata
 * @param now - Current timestamp in ms
 * @returns Remaining time in ms, or null if no expiry
 */
export function getRemainingTime(
  meta: KwikObjectMeta,
  now: number = Date.now()
): number | null {
  if (meta.expiresAt === null) {
    return null;
  }

  const remaining = meta.expiresAt - now;
  return remaining > 0 ? remaining : 0;
}

/**
 * Converts internal metadata to public-facing metadata.
 * Strips sensitive fields like storageKey.
 *
 * @param meta - Internal object metadata
 * @param now - Current timestamp for claimability check
 * @returns Public metadata safe for client consumption
 */
export function toPublicMeta(
  meta: KwikObjectMeta,
  now: number = Date.now()
): KwikObjectPublicMeta {
  return {
    id: meta.id,
    fileName: meta.fileName,
    mimeType: meta.mimeType,
    originalSize: meta.originalSize,
    singleUse: meta.singleUse,
    expiresAt: meta.expiresAt,
    isClaimable: isClaimable(meta, now),
  };
}

/**
 * Validates expiry seconds value.
 *
 * @param expirySeconds - Expiry in seconds or null
 * @param maxExpiry - Maximum allowed expiry in seconds
 * @returns true if valid
 */
export function isValidExpiry(
  expirySeconds: number | null,
  maxExpiry: number
): boolean {
  if (expirySeconds === null) {
    return true; // No expiry is valid
  }

  return expirySeconds > 0 && expirySeconds <= maxExpiry;
}

/**
 * Validates file size.
 *
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns true if valid
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Generates the storage key for a KwikObject.
 *
 * @param id - Object ID
 * @returns Storage key path
 */
export function generateStorageKey(id: string): string {
  // Use date-based partitioning for easier cleanup
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `objects/${year}/${month}/${day}/${id}`;
}
