/**
 * Global Stats Display Component
 *
 * Displays anonymous, aggregate usage statistics.
 * Fetches data client-side to allow for caching benefits.
 *
 * DESIGN DECISIONS:
 * - No charts or graphs (intentionally simple)
 * - No animations (observability, not marketing)
 * - No live updates (stats don't need real-time)
 * - Graceful fallback on error (shows nothing)
 */

"use client";

import * as React from "react";

interface StatsData {
  uploads: number;
  claims: number;
  expired: number;
}

/**
 * Fetches stats from the API.
 * Returns null on any error to allow graceful degradation.
 */
async function fetchStats(): Promise<StatsData | null> {
  try {
    // Simple fetch with cache-busting to get fresh stats
    // The API itself handles caching via Cache-Control headers
    const response = await fetch("/api/stats", {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    // Silently fail - stats are informational only
    return null;
  }
}

/**
 * Formats a number for display.
 * Uses locale formatting for readability (e.g., 1,234).
 */
function formatNumber(n: number): string {
  return n.toLocaleString();
}

/**
 * Individual stat item display.
 */
function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-semibold tabular-nums tracking-tight">
        {formatNumber(value)}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/**
 * Global stats display section for the landing page.
 *
 * Renders nothing if stats fail to load (graceful degradation).
 * This ensures the landing page works even if Redis is down.
 */
export function GlobalStats() {
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    fetchStats().then((data) => {
      setStats(data);
      setLoaded(true);
    });
  }, []);

  // Don't render anything until we've attempted to load
  // and don't render if stats failed to load
  if (!loaded || !stats) {
    return null;
  }

  // Don't show stats section if there's no activity yet
  // This avoids showing "0 uploads" on fresh installs
  const hasActivity = stats.uploads > 0 || stats.claims > 0;
  if (!hasActivity) {
    return null;
  }

  return (
    <section className="space-y-6 text-center">
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Platform Stats
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
        <StatItem value={stats.uploads} label="files shared" />
        <StatItem value={stats.claims} label="files claimed" />
        <StatItem value={stats.expired} label="auto-expired" />
      </div>
    </section>
  );
}
