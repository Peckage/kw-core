/**
 * KwikObject Service
 *
 * Orchestrates KwikObject operations, combining model logic,
 * repository persistence, and storage operations.
 */

import "server-only";

import { nanoid } from "nanoid";
import type {
  KwikObjectMeta,
  CreateKwikObjectRequest,
  CreateKwikObjectResponse,
  KwikObjectPublicMeta,
  ClaimKwikObjectResponse,
  ClaimErrorCode,
} from "./types";
import { MAX_FILE_SIZE, MAX_EXPIRY_SECONDS } from "./types";
import {
  isClaimable,
  toPublicMeta,
  getEffectiveStatus,
  isValidExpiry,
  isValidFileSize,
  generateStorageKey,
} from "./model";
import * as repository from "./repository";
import { storage } from "@/lib/storage";
import { recordUpload, recordClaim, recordExpiry } from "@/core/stats/service";

/**
 * Creates a new KwikObject and returns upload URL.
 *
 * @param request - Creation request parameters
 * @returns Object ID and pre-signed upload URL
 * @throws Error if validation fails
 */
export async function createObject(
  request: CreateKwikObjectRequest
): Promise<CreateKwikObjectResponse> {
  // Validate file size
  if (!isValidFileSize(request.originalSize, MAX_FILE_SIZE)) {
    throw new Error(
      `File size must be between 1 byte and ${MAX_FILE_SIZE} bytes`
    );
  }

  // Validate expiry
  if (!isValidExpiry(request.expirySeconds, MAX_EXPIRY_SECONDS)) {
    throw new Error(
      `Expiry must be between 1 and ${MAX_EXPIRY_SECONDS} seconds`
    );
  }

  // Generate unique ID
  const id = nanoid(21);
  const storageKey = generateStorageKey(id);
  const now = Date.now();

  // Calculate expiry timestamp
  const expiresAt =
    request.expirySeconds !== null ? now + request.expirySeconds * 1000 : null;

  // Create metadata
  const meta: KwikObjectMeta = {
    id,
    fileName: request.fileName,
    mimeType: request.mimeType,
    encryptedSize: request.encryptedSize,
    originalSize: request.originalSize,
    createdAt: now,
    expiresAt,
    singleUse: request.singleUse,
    status: "active",
    claimedAt: null,
    storageKey,
  };

  // Save metadata
  await repository.saveMeta(meta);

  // Record upload stat (async, non-blocking)
  // Intentionally fire-and-forget to not affect upload latency
  recordUpload().catch((err) => {
    console.error("[Stats] Failed to record upload:", err);
  });

  // Generate pre-signed upload URL
  const uploadUrl = await storage.getUploadUrl(
    storageKey,
    request.encryptedSize
  );

  return {
    id,
    uploadUrl,
    storageKey,
  };
}

/**
 * Fetches public metadata for a KwikObject.
 *
 * @param id - Object ID
 * @returns Public metadata or null if not found/invalid
 */
export async function getPublicMeta(
  id: string
): Promise<KwikObjectPublicMeta | null> {
  const meta = await repository.getMeta(id);

  if (!meta) {
    return null;
  }

  const now = Date.now();
  const status = getEffectiveStatus(meta, now);

  // If expired or deleted, treat as not found for public purposes
  if (status === "expired" || status === "deleted") {
    return null;
  }

  return toPublicMeta(meta, now);
}

/**
 * Attempts to claim a KwikObject.
 *
 * @param id - Object ID
 * @returns Claim response with download URL or error
 */
export async function claimObject(
  id: string
): Promise<ClaimKwikObjectResponse> {
  // Attempt to acquire claim lock for atomicity
  const lockAcquired = await repository.acquireClaimLock(id);

  if (!lockAcquired) {
    // Another claim in progress, retry after short delay
    return {
      success: false,
      downloadUrl: null,
      errorCode: "ALREADY_CLAIMED",
    };
  }

  try {
    const meta = await repository.getMeta(id);

    if (!meta) {
      return createClaimError("NOT_FOUND");
    }

    const now = Date.now();
    const status = getEffectiveStatus(meta, now);

    // Check various failure conditions
    switch (status) {
      case "claimed":
        return createClaimError("ALREADY_CLAIMED");
      case "expired":
        // Record expiry stat when we detect an expired object
        // This is the only reliable place to count expirations since
        // Redis TTL handles actual deletion and we don't have a cleanup job
        recordExpiry().catch((err) => {
          console.error("[Stats] Failed to record expiry:", err);
        });
        return createClaimError("EXPIRED");
      case "deleted":
        return createClaimError("DELETED");
    }

    // Check if claimable
    if (!isClaimable(meta, now)) {
      // Also record expiry here since isClaimable checks expiry
      recordExpiry().catch((err) => {
        console.error("[Stats] Failed to record expiry:", err);
      });
      return createClaimError("EXPIRED");
    }

    // Generate download URL
    const downloadUrl = await storage.getDownloadUrl(meta.storageKey);

    // If single-use, mark as claimed
    if (meta.singleUse) {
      const updatedMeta: KwikObjectMeta = {
        ...meta,
        status: "claimed",
        claimedAt: now,
      };
      await repository.updateMeta(updatedMeta);

      // Schedule blob deletion (async, don't await)
      scheduleCleanup(meta.storageKey, meta.id);
    }

    // Record claim stat (async, non-blocking)
    // Intentionally fire-and-forget to not affect claim latency
    recordClaim().catch((err) => {
      console.error("[Stats] Failed to record claim:", err);
    });

    return {
      success: true,
      downloadUrl,
      errorCode: null,
    };
  } finally {
    await repository.releaseClaimLock(id);
  }
}

/**
 * Creates a claim error response.
 */
function createClaimError(errorCode: ClaimErrorCode): ClaimKwikObjectResponse {
  return {
    success: false,
    downloadUrl: null,
    errorCode,
  };
}

/**
 * Schedules cleanup of storage blob and metadata.
 * Runs asynchronously to not block the claim response.
 *
 * @param storageKey - Storage key to delete
 * @param id - Object ID
 */
function scheduleCleanup(storageKey: string, id: string): void {
  // Use setImmediate to run after response is sent
  setImmediate(async () => {
    try {
      // Wait a bit for download to complete
      await new Promise((resolve) => setTimeout(resolve, 60000));

      // Delete the blob
      await storage.deleteObject(storageKey);

      // Delete metadata
      await repository.deleteMeta(id);
    } catch (error) {
      // Log but don't throw - cleanup failures are non-critical
      console.error(`Cleanup failed for ${id}:`, error);
    }
  });
}

/**
 * Marks an object as deleted and schedules cleanup.
 *
 * @param id - Object ID
 * @returns true if deleted, false if not found
 */
export async function deleteObject(id: string): Promise<boolean> {
  const meta = await repository.getMeta(id);

  if (!meta) {
    return false;
  }

  // Update status
  const updatedMeta: KwikObjectMeta = {
    ...meta,
    status: "deleted",
  };
  await repository.updateMeta(updatedMeta);

  // Schedule cleanup
  scheduleCleanup(meta.storageKey, id);

  return true;
}
