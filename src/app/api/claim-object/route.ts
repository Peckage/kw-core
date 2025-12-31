/**
 * Claim Object API Route
 *
 * POST /api/claim-object
 *
 * Attempts to claim a KwikObject and returns download URL.
 * For single-use objects, marks as claimed and schedules cleanup.
 *
 * Request Body:
 * - id: string - Object ID
 *
 * Response (200):
 * - success: true
 * - downloadUrl: string
 *
 * Response (4xx):
 * - success: false
 * - errorCode: "NOT_FOUND" | "ALREADY_CLAIMED" | "EXPIRED" | "DELETED"
 */

import { NextRequest, NextResponse } from "next/server";
import { claimObject } from "@/core/kwik-object/service";
import type { ClaimKwikObjectResponse } from "@/core/kwik-object";

interface ClaimRequestBody {
  id: string;
}

interface ErrorResponse {
  success: false;
  errorCode: string;
  error: string;
}

/**
 * Validates the request body.
 */
function validateBody(body: unknown): body is ClaimRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const b = body as Record<string, unknown>;

  return typeof b.id === "string" && b.id.length === 21;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ClaimKwikObjectResponse | ErrorResponse>> {
  try {
    const body = await request.json();

    if (!validateBody(body)) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INVALID_REQUEST",
          error: "Invalid request body or object ID",
        },
        { status: 400 }
      );
    }

    const result = await claimObject(body.id);

    if (!result.success) {
      const statusMap: Record<string, number> = {
        NOT_FOUND: 404,
        ALREADY_CLAIMED: 410,
        EXPIRED: 410,
        DELETED: 410,
      };

      const status = result.errorCode
        ? statusMap[result.errorCode] ?? 400
        : 400;

      return NextResponse.json(
        {
          success: false,
          errorCode: result.errorCode ?? "UNKNOWN_ERROR",
          error: getErrorMessage(result.errorCode),
        },
        { status }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[claim-object] Error:", error);

    return NextResponse.json(
      {
        success: false,
        errorCode: "INTERNAL_ERROR",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Maps error codes to human-readable messages.
 */
function getErrorMessage(code: string | null): string {
  switch (code) {
    case "NOT_FOUND":
      return "This file does not exist or has been deleted";
    case "ALREADY_CLAIMED":
      return "This single-use file has already been downloaded";
    case "EXPIRED":
      return "This file has expired and is no longer available";
    case "DELETED":
      return "This file has been deleted";
    default:
      return "Unable to claim this file";
  }
}
