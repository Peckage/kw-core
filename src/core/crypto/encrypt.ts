/**
 * Encryption Module
 *
 * Client-side file encryption using AES-256-GCM.
 * Encrypted format: [12 bytes IV][ciphertext with auth tag]
 */

import { ENCRYPTION_CONFIG, importKey, generateIV } from "./key-derivation";

/**
 * Result of encryption operation.
 */
export interface EncryptResult {
  /** Encrypted data including IV prefix */
  encryptedData: ArrayBuffer;
  /** Size of encrypted data in bytes */
  encryptedSize: number;
}

/**
 * Progress callback for encryption.
 *
 * @param bytesProcessed - Bytes encrypted so far
 * @param totalBytes - Total bytes to encrypt
 */
export type EncryptProgressCallback = (
  bytesProcessed: number,
  totalBytes: number
) => void;

/**
 * Encrypts a file using AES-256-GCM.
 *
 * The encrypted format is: [12 bytes IV][ciphertext][16 bytes auth tag]
 * This allows the decryption side to extract the IV from the start.
 *
 * @param file - File to encrypt
 * @param keyString - Base64url-encoded encryption key
 * @param onProgress - Optional progress callback
 * @returns Encrypted data and size
 */
export async function encryptFile(
  file: File,
  keyString: string,
  onProgress?: EncryptProgressCallback
): Promise<EncryptResult> {
  // Read file contents
  const fileBuffer = await readFileAsArrayBuffer(file, onProgress);

  // Import the key
  const cryptoKey = await importKey(keyString);

  // Generate random IV
  const iv = generateIV();

  // Encrypt the data
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: iv as Uint8Array<ArrayBuffer>,
      tagLength: ENCRYPTION_CONFIG.tagLength,
    },
    cryptoKey,
    fileBuffer
  );

  // Combine IV + encrypted content
  const encryptedData = new ArrayBuffer(
    iv.length + encryptedContent.byteLength
  );
  const encryptedView = new Uint8Array(encryptedData);

  // Write IV at the start
  encryptedView.set(iv, 0);

  // Write encrypted content after IV
  encryptedView.set(new Uint8Array(encryptedContent), iv.length);

  return {
    encryptedData,
    encryptedSize: encryptedData.byteLength,
  };
}

/**
 * Encrypts arbitrary data (not from a File object).
 *
 * @param data - Data to encrypt
 * @param keyString - Base64url-encoded encryption key
 * @returns Encrypted data and size
 */
export async function encryptData(
  data: ArrayBuffer | Uint8Array,
  keyString: string
): Promise<EncryptResult> {
  const cryptoKey = await importKey(keyString);
  const iv = generateIV();

  // Normalize to ArrayBuffer for consistent handling
  const dataBuffer: ArrayBuffer =
    data instanceof Uint8Array ? (data.buffer as ArrayBuffer) : data;

  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: iv as Uint8Array<ArrayBuffer>,
      tagLength: ENCRYPTION_CONFIG.tagLength,
    },
    cryptoKey,
    dataBuffer
  );

  // Combine IV + encrypted content
  const encryptedData = new ArrayBuffer(
    iv.length + encryptedContent.byteLength
  );
  const encryptedView = new Uint8Array(encryptedData);
  encryptedView.set(iv, 0);
  encryptedView.set(new Uint8Array(encryptedContent), iv.length);

  return {
    encryptedData,
    encryptedSize: encryptedData.byteLength,
  };
}

/**
 * Reads a file as ArrayBuffer with progress reporting.
 *
 * @param file - File to read
 * @param onProgress - Optional progress callback
 * @returns File contents as ArrayBuffer
 */
async function readFileAsArrayBuffer(
  file: File,
  onProgress?: EncryptProgressCallback
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(event.loaded, event.total);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Creates a Blob from encrypted data for upload.
 *
 * @param encryptedData - Encrypted data
 * @returns Blob suitable for upload
 */
export function createEncryptedBlob(encryptedData: ArrayBuffer): Blob {
  return new Blob([encryptedData], { type: "application/octet-stream" });
}
