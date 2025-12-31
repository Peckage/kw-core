/**
 * Key Derivation Module
 *
 * Generates and handles encryption keys using Web Crypto API.
 * Keys are generated client-side and never sent to the server.
 *
 * Security Model:
 * - AES-256-GCM for symmetric encryption
 * - Random 256-bit keys generated using crypto.getRandomValues
 * - Keys are base64url encoded for URL-safe transmission
 * - Keys are stored only in URL fragments (not sent to server in HTTP requests)
 */

/**
 * Encryption algorithm configuration.
 */
export const ENCRYPTION_CONFIG = {
  algorithm: "AES-GCM",
  keyLength: 256,
  ivLength: 12, // 96 bits for GCM
  tagLength: 128, // 128-bit auth tag
} as const;

/**
 * Generates a new random encryption key.
 *
 * @returns Base64url-encoded encryption key
 */
export async function generateKey(): Promise<string> {
  // Generate random key bytes
  const keyBytes = new Uint8Array(ENCRYPTION_CONFIG.keyLength / 8);
  crypto.getRandomValues(keyBytes);

  // Convert to base64url for URL-safe encoding
  return bytesToBase64Url(keyBytes);
}

/**
 * Imports a base64url-encoded key for use with Web Crypto.
 *
 * @param keyString - Base64url-encoded key
 * @returns CryptoKey for encryption/decryption
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyBytes = base64UrlToBytes(keyString);

  return crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: ENCRYPTION_CONFIG.algorithm },
    false, // not extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Generates a random initialization vector.
 *
 * @returns Random IV bytes
 */
export function generateIV(): Uint8Array {
  const iv = new Uint8Array(ENCRYPTION_CONFIG.ivLength);
  crypto.getRandomValues(iv);
  return iv;
}

/**
 * Converts bytes to base64url encoding.
 * URL-safe: uses - and _ instead of + and /, no padding.
 *
 * @param bytes - Byte array to encode
 * @returns Base64url-encoded string
 */
export function bytesToBase64Url(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join("");

  const base64 = btoa(binString);

  // Convert to base64url
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Converts base64url string to bytes.
 *
 * @param base64url - Base64url-encoded string
 * @returns Decoded byte array
 */
export function base64UrlToBytes(base64url: string): Uint8Array {
  // Convert from base64url to base64
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }

  const binString = atob(base64);
  const bytes = new Uint8Array(binString.length);

  for (let i = 0; i < binString.length; i++) {
    bytes[i] = binString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Validates that a key string is properly formatted.
 *
 * @param keyString - Key to validate
 * @returns true if valid base64url key of correct length
 */
export function isValidKey(keyString: string): boolean {
  try {
    const bytes = base64UrlToBytes(keyString);
    return bytes.length === ENCRYPTION_CONFIG.keyLength / 8;
  } catch {
    return false;
  }
}
