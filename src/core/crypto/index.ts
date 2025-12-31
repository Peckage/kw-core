/**
 * Crypto Module Exports
 *
 * Re-exports all cryptographic functions for client-side encryption.
 */

// Key derivation
export {
  ENCRYPTION_CONFIG,
  generateKey,
  importKey,
  generateIV,
  bytesToBase64Url,
  base64UrlToBytes,
  isValidKey,
} from "./key-derivation";

// Encryption
export type { EncryptResult, EncryptProgressCallback } from "./encrypt";
export { encryptFile, encryptData, createEncryptedBlob } from "./encrypt";

// Decryption
export type { DecryptResult, DecryptProgressCallback } from "./decrypt";
export {
  decryptData,
  downloadAndDecrypt,
  createDownloadUrl,
  triggerDownload,
  downloadDecryptAndSave,
} from "./decrypt";
