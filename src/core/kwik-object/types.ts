/**
 * KwikObject Type Definitions
 *
 * A KwikObject is an encrypted, expiring, optionally single-use file bundle.
 * The encryption key is never stored on the server - it's only present in the
 * shareable URL fragment.
 */

/**
 * Status of a KwikObject in its lifecycle.
 */
export type KwikObjectStatus =
  | "active" // Available for claim
  | "claimed" // Successfully claimed (if single-use)
  | "expired" // Past expiry time
  | "deleted"; // Manually or automatically deleted

/**
 * Metadata stored alongside encrypted blob.
 * This is the server-side representation of a KwikObject.
 * Note: The encryption key is NOT stored here.
 */
export interface KwikObjectMeta {
  /** Unique identifier for the object */
  id: string;

  /** Original filename (encrypted on client, stored as-is for display) */
  fileName: string;

  /** MIME type of the original file */
  mimeType: string;

  /** Size of the encrypted blob in bytes */
  encryptedSize: number;

  /** Size of the original file in bytes */
  originalSize: number;

  /** Unix timestamp (ms) when the object was created */
  createdAt: number;

  /** Unix timestamp (ms) when the object expires (null = never) */
  expiresAt: number | null;

  /** If true, object is deleted after first successful claim */
  singleUse: boolean;

  /** Current status of the object */
  status: KwikObjectStatus;

  /** Unix timestamp (ms) when claimed (null if not claimed) */
  claimedAt: number | null;

  /** Storage key/path for the encrypted blob */
  storageKey: string;
}

/**
 * Request payload for creating a new KwikObject.
 */
export interface CreateKwikObjectRequest {
  /** Original filename */
  fileName: string;

  /** MIME type of the file */
  mimeType: string;

  /** Size of the original file in bytes */
  originalSize: number;

  /** Size of the encrypted blob in bytes */
  encryptedSize: number;

  /** Expiry duration in seconds (null = never expires) */
  expirySeconds: number | null;

  /** Whether the object should be single-use */
  singleUse: boolean;
}

/**
 * Response from creating a KwikObject.
 */
export interface CreateKwikObjectResponse {
  /** Unique identifier for the object */
  id: string;

  /** Pre-signed URL for uploading the encrypted blob */
  uploadUrl: string;

  /** Storage key where the blob will be stored */
  storageKey: string;
}

/**
 * Public metadata returned when fetching object info.
 * Excludes internal fields like storageKey.
 */
export interface KwikObjectPublicMeta {
  /** Unique identifier */
  id: string;

  /** Original filename */
  fileName: string;

  /** MIME type */
  mimeType: string;

  /** Original file size in bytes */
  originalSize: number;

  /** Whether the object is single-use */
  singleUse: boolean;

  /** Unix timestamp (ms) when expires (null = never) */
  expiresAt: number | null;

  /** Whether the object can still be claimed */
  isClaimable: boolean;
}

/**
 * Response from attempting to claim an object.
 */
export interface ClaimKwikObjectResponse {
  /** Whether the claim was successful */
  success: boolean;

  /** Pre-signed URL for downloading the encrypted blob (if successful) */
  downloadUrl: string | null;

  /** Error code if claim failed */
  errorCode: ClaimErrorCode | null;
}

/**
 * Error codes for claim failures.
 */
export type ClaimErrorCode =
  | "NOT_FOUND" // Object doesn't exist
  | "ALREADY_CLAIMED" // Single-use object already claimed
  | "EXPIRED" // Object has expired
  | "DELETED"; // Object was deleted

/**
 * Configuration for object expiry options.
 */
export interface ExpiryOption {
  /** Display label */
  label: string;

  /** Value in seconds (null = never) */
  value: number | null;
}

/**
 * Predefined expiry options for the upload form.
 */
export const EXPIRY_OPTIONS: ExpiryOption[] = [
  { label: "1 hour", value: 3600 },
  { label: "6 hours", value: 21600 },
  { label: "24 hours", value: 86400 },
  { label: "3 days", value: 259200 },
  { label: "7 days", value: 604800 },
  { label: "Never", value: null },
];

/**
 * Maximum file size allowed (100MB).
 */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Maximum expiry time allowed (7 days in seconds).
 */
export const MAX_EXPIRY_SECONDS = 604800;
