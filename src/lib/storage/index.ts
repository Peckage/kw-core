/**
 * S3-Compatible Storage Module
 *
 * Provides a storage driver for S3-compatible services.
 * Works with AWS S3, MinIO, Cloudflare R2, Backblaze B2, etc.
 */

import "server-only";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Storage configuration.
 */
interface StorageConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Pre-signed URL expiry in seconds */
  urlExpirySeconds: number;
}

/**
 * Gets storage configuration from environment.
 */
function getConfig(): StorageConfig {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? "us-east-1";
  const bucket = process.env.S3_BUCKET_NAME;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing required S3 environment variables: S3_ENDPOINT, S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY"
    );
  }

  return {
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    urlExpirySeconds: 3600, // 1 hour
  };
}

/**
 * Creates an S3 client instance.
 */
function createClient(): S3Client {
  const config = getConfig();

  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true, // Required for MinIO and other S3-compatible services
  });
}

/**
 * Singleton S3 client instance.
 */
let s3Instance: S3Client | null = null;

/**
 * Gets the S3 client instance.
 */
function getS3(): S3Client {
  if (!s3Instance) {
    s3Instance = createClient();
  }
  return s3Instance;
}

/**
 * Storage interface for blob operations.
 */
export interface Storage {
  /**
   * Gets a pre-signed URL for uploading a blob.
   *
   * @param key - Storage key/path
   * @param contentLength - Expected content length in bytes
   * @returns Pre-signed upload URL
   */
  getUploadUrl(key: string, contentLength: number): Promise<string>;

  /**
   * Gets a pre-signed URL for downloading a blob.
   *
   * @param key - Storage key/path
   * @returns Pre-signed download URL
   */
  getDownloadUrl(key: string): Promise<string>;

  /**
   * Deletes a blob from storage.
   *
   * @param key - Storage key/path
   */
  deleteObject(key: string): Promise<void>;

  /**
   * Checks if a blob exists.
   *
   * @param key - Storage key/path
   * @returns true if exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Gets the size of a blob.
   *
   * @param key - Storage key/path
   * @returns Size in bytes, or null if not found
   */
  getSize(key: string): Promise<number | null>;
}

/**
 * S3-compatible storage implementation.
 */
class S3Storage implements Storage {
  async getUploadUrl(key: string, contentLength: number): Promise<string> {
    const config = getConfig();
    const client = getS3();

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentLength: contentLength,
      ContentType: "application/octet-stream",
    });

    return getSignedUrl(client, command, {
      expiresIn: config.urlExpirySeconds,
    });
  }

  async getDownloadUrl(key: string): Promise<string> {
    const config = getConfig();
    const client = getS3();

    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    return getSignedUrl(client, command, {
      expiresIn: config.urlExpirySeconds,
    });
  }

  async deleteObject(key: string): Promise<void> {
    const config = getConfig();
    const client = getS3();

    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    await client.send(command);
  }

  async exists(key: string): Promise<boolean> {
    try {
      const config = getConfig();
      const client = getS3();

      const command = new HeadObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      await client.send(command);
      return true;
    } catch (error) {
      // HeadObject throws NotFound if object doesn't exist
      if (error instanceof Error && error.name === "NotFound") {
        return false;
      }
      throw error;
    }
  }

  async getSize(key: string): Promise<number | null> {
    try {
      const config = getConfig();
      const client = getS3();

      const command = new HeadObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      const response = await client.send(command);
      return response.ContentLength ?? null;
    } catch (error) {
      if (error instanceof Error && error.name === "NotFound") {
        return null;
      }
      throw error;
    }
  }
}

/**
 * Default storage instance.
 */
export const storage: Storage = new S3Storage();

export default storage;
