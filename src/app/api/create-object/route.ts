/**
 * Create Object API Route
 *
 * POST /api/create-object
 *
 * Creates a new KwikObject and returns upload URL.
 * The client uploads the encrypted blob directly to storage.
 *
 * Request Body:
 * - fileName: string - Original filename
 * - mimeType: string - MIME type
 * - originalSize: number - Original file size in bytes
 * - encryptedSize: number - Encrypted blob size in bytes
 * - expirySeconds: number | null - Expiry duration (null = never)
 * - singleUse: boolean - Whether single-use
 *
 * Response:
 * - id: string - Object ID
 * - uploadUrl: string - Pre-signed upload URL
 * - storageKey: string - Storage path
 */

import { NextRequest, NextResponse } from "next/server";
import { createObject } from "@/core/kwik-object/service";
import type { CreateKwikObjectRequest } from "@/core/kwik-object";

interface CreateObjectRequestBody {
  fileName: string;
  mimeType: string;
  originalSize: number;
  encryptedSize: number;
  expirySeconds: number | null;
  singleUse: boolean;
}

interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Validates the request body.
 */
function validateBody(body: unknown): body is CreateObjectRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const b = body as Record<string, unknown>;

  return (
    typeof b.fileName === "string" &&
    b.fileName.length > 0 &&
    typeof b.mimeType === "string" &&
    b.mimeType.length > 0 &&
    typeof b.originalSize === "number" &&
    b.originalSize > 0 &&
    typeof b.encryptedSize === "number" &&
    b.encryptedSize > 0 &&
    (b.expirySeconds === null || typeof b.expirySeconds === "number") &&
    typeof b.singleUse === "boolean"
  );
}

export async function POST(
  request: NextRequest
): Promise<
  NextResponse<
    { id: string; uploadUrl: string; storageKey: string } | ErrorResponse
  >
> {
  try {
    const body = await request.json();

    if (!validateBody(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    const createRequest: CreateKwikObjectRequest = {
      fileName: body.fileName,
      mimeType: body.mimeType,
      originalSize: body.originalSize,
      encryptedSize: body.encryptedSize,
      expirySeconds: body.expirySeconds,
      singleUse: body.singleUse,
    };

    const result = await createObject(createRequest);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[create-object] Error:", error);

    if (error instanceof Error) {
      // Handle validation errors
      if (
        error.message.includes("File size") ||
        error.message.includes("Expiry")
      ) {
        return NextResponse.json(
          {
            error: error.message,
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
