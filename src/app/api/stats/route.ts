/**
 * Stats API Route
 *
 * GET /api/stats
 *
 * Returns global, anonymous usage statistics.
 *
 * PRIVACY DESIGN:
 * - No authentication required (public data)
 * - No user-identifiable information returned
 * - All stats are aggregate counters only
 * - No timestamps, IPs, or session data tracked
 *
 * Response:
 * {
 *   "uploads": number,
 *   "claims": number,
 *   "expired": number
 * }
 */

import { NextResponse } from "next/server";
import { getGlobalStats } from "@/core/stats/service";
import type { StatsResponse } from "@/core/stats";

/**
 * GET handler for stats endpoint.
 *
 * Returns current global statistics.
 * Response is cached for 60 seconds to reduce Redis load.
 */
export async function GET(): Promise<NextResponse<StatsResponse>> {
  try {
    const stats = await getGlobalStats();

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        // Cache for 60 seconds - stats don't need real-time updates
        // This reduces Redis load while keeping data reasonably fresh
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[Stats API] Error fetching stats:", error);

    // Return zeros on error - stats should never break the UI
    return NextResponse.json(
      {
        uploads: 0,
        claims: 0,
        expired: 0,
      },
      {
        status: 200,
        headers: {
          // Shorter cache on error
          "Cache-Control": "public, s-maxage=10",
        },
      }
    );
  }
}
