/**
 * Decryption Module
 *
 * Client-side file decryption using AES-256-GCM.
 * Expects format: [12 bytes IV][ciphertext with auth tag]
 */

import { ENCRYPTION_CONFIG, importKey } from "./key-derivation";

/**
 * Result of decryption operation.
 */
export interface DecryptResult {
  /** Decrypted data */
  decryptedData: ArrayBuffer;
  /** Size of decrypted data in bytes */
  decryptedSize: number;
}

/**
 * Progress callback for decryption/download.
 *
 * @param bytesProcessed - Bytes processed so far
 * @param totalBytes - Total bytes to process
 */
export type DecryptProgressCallback = (
  bytesProcessed: number,
  totalBytes: number
) => void;

/**
 * Decrypts data encrypted with encryptFile/encryptData.
 *
 * The encrypted format is: [12 bytes IV][ciphertext][16 bytes auth tag]
 *
 * @param encryptedData - Encrypted data including IV prefix
 * @param keyString - Base64url-encoded encryption key
 * @returns Decrypted data
 * @throws Error if decryption fails (wrong key, tampered data)
 */
export async function decryptData(
  encryptedData: ArrayBuffer,
  keyString: string
): Promise<DecryptResult> {
  const encryptedView = new Uint8Array(encryptedData);

  // Extract IV from the start
  const iv = encryptedView.slice(0, ENCRYPTION_CONFIG.ivLength);

  // Extract ciphertext (rest of the data)
  const ciphertext = encryptedView.slice(ENCRYPTION_CONFIG.ivLength);

  // Import the key
  const cryptoKey = await importKey(keyString);

  // Decrypt
  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv,
      tagLength: ENCRYPTION_CONFIG.tagLength,
    },
    cryptoKey,
    ciphertext
  );

  return {
    decryptedData: decryptedContent,
    decryptedSize: decryptedContent.byteLength,
  };
}

/**
 * Downloads and decrypts a file from a URL.
 *
 * @param downloadUrl - URL to download encrypted data from
 * @param keyString - Base64url-encoded encryption key
 * @param onProgress - Optional progress callback
 * @returns Decrypted data
 */
export async function downloadAndDecrypt(
  downloadUrl: string,
  keyString: string,
  onProgress?: DecryptProgressCallback
): Promise<DecryptResult> {
  // Fetch the encrypted data
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`
    );
  }

  // Get content length for progress
  const contentLength = response.headers.get("Content-Length");
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

  // Read the response body with progress
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const chunks: Uint8Array[] = [];
  let bytesReceived = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    bytesReceived += value.length;

    if (onProgress && totalBytes > 0) {
      onProgress(bytesReceived, totalBytes);
    }
  }

  // Combine chunks
  const encryptedData = new Uint8Array(bytesReceived);
  let offset = 0;

  for (const chunk of chunks) {
    encryptedData.set(chunk, offset);
    offset += chunk.length;
  }

  // Decrypt
  return decryptData(encryptedData.buffer, keyString);
}

/**
 * Creates a downloadable file from decrypted data.
 *
 * @param decryptedData - Decrypted file data
 * @param mimeType - MIME type of the file
 * @returns Blob URL for download
 */
export function createDownloadUrl(
  decryptedData: ArrayBuffer,
  mimeType: string
): string {
  const blob = new Blob([decryptedData], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Triggers a file download in the browser.
 *
 * @param blobUrl - Blob URL to download
 * @param fileName - Filename for the download
 */
export function triggerDownload(blobUrl: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke the blob URL after a delay to allow download to start
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 10000);
}

/**
 * Convenience function to download, decrypt, and save a file.
 *
 * @param downloadUrl - URL to download encrypted data from
 * @param keyString - Base64url-encoded encryption key
 * @param fileName - Original filename
 * @param mimeType - MIME type of the file
 * @param onProgress - Optional progress callback
 */
export async function downloadDecryptAndSave(
  downloadUrl: string,
  keyString: string,
  fileName: string,
  mimeType: string,
  onProgress?: DecryptProgressCallback
): Promise<void> {
  const { decryptedData } = await downloadAndDecrypt(
    downloadUrl,
    keyString,
    onProgress
  );
  const blobUrl = createDownloadUrl(decryptedData, mimeType);
  triggerDownload(blobUrl, fileName);
}
