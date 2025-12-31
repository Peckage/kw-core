/**
 * Fetch Meta API Route
 *
 * GET /api/fetch-meta?id=<objectId>
 *
 * Retrieves public metadata for a KwikObject.
 * Used by claim page to display file info before downloading.
 *
 * Query Parameters:
 * - id: string - Object ID
 *
 * Response (200):
 * - id: string
 * - fileName: string
 * - mimeType: string
 * - originalSize: number
 * - singleUse: boolean
 * - expiresAt: number | null
 * - isClaimable: boolean
 *
 * Response (404):
 * - error: string
 * - code: "NOT_FOUND" | "EXPIRED" | "CLAIMED"
 */

import { NextRequest, NextResponse } from "next/server";
import { getPublicMeta } from "@/core/kwik-object/service";
import type { KwikObjectPublicMeta } from "@/core/kwik-object";

interface ErrorResponse {
  error: string;
  code: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<KwikObjectPublicMeta | ErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "Missing required parameter: id",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    // Validate ID format (nanoid is 21 characters)
    if (id.length !== 21) {
      return NextResponse.json(
        {
          error: "Invalid object ID format",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    const meta = await getPublicMeta(id);

    if (!meta) {
      return NextResponse.json(
        {
          error: "Object not found or no longer available",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(meta, { status: 200 });
  } catch (error) {
    console.error("[fetch-meta] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
