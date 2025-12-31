import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper precedence handling.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @param inputs - Class values to merge (strings, arrays, objects)
 * @returns Merged class string
 *
 * @example
 * cn("px-2 py-1", "px-4") // => "py-1 px-4"
 * cn("text-red-500", { "text-blue-500": isBlue }) // conditional
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a byte count into a human-readable string.
 *
 * @param bytes - Number of bytes
 * @param decimals - Decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = sizes[i];

  if (!size) return `${bytes} Bytes`;

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${size}`;
}

/**
 * Formats a duration in seconds into a human-readable string.
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "2 hours", "3 days")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
  return `${Math.floor(seconds / 86400)} days`;
}

/**
 * Safely parses a URL fragment to extract the encryption key.
 * The key is stored in the fragment to prevent it from being sent to the server.
 *
 * @param hash - URL hash/fragment (including #)
 * @returns Extracted key or null if invalid
 */
export function extractKeyFromFragment(hash: string): string | null {
  if (!hash || hash.length < 2) return null;
  const key = hash.slice(1); // Remove leading #
  return key.length > 0 ? key : null;
}

/**
 * Generates a shareable URL with the encryption key in the fragment.
 *
 * @param baseUrl - Base URL of the claim page
 * @param objectId - KwikObject ID
 * @param key - Base64-encoded encryption key
 * @returns Full shareable URL
 */
export function generateShareUrl(
  baseUrl: string,
  objectId: string,
  key: string
): string {
  return `${baseUrl}/claim/${objectId}#${key}`;
}

/**
 * Type-safe assertion that a value is not null/undefined.
 *
 * @param value - Value to check
 * @param message - Error message if assertion fails
 * @throws Error if value is null/undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = "Value is not defined"
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Creates a delay promise for async operations.
 *
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
