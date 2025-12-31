/**
 * StatusBadge Component
 *
 * Displays status information for KwikObjects.
 * Used in claim screens to show object state.
 *
 * Polish: Updated colors for dark mode compatibility.
 * Uses muted backgrounds with colored text for readability.
 *
 * @example
 * <StatusBadge status="active" expiresAt={1735689600000} />
 * <StatusBadge status="expired" />
 * <StatusBadge status="claimed" />
 */

"use client";

import * as React from "react";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ObjectStatus = "active" | "claimed" | "expired" | "not-found";

export interface StatusBadgeProps {
  /** Current status of the object */
  status: ObjectStatus;
  /** Expiry timestamp in ms (for active status) */
  expiresAt?: number | null;
  /** Whether the object is single-use */
  singleUse?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface StatusConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
  colorClass: string;
  bgClass: string;
}

/**
 * Status badge component for KwikObjects.
 */
export function StatusBadge({
  status,
  expiresAt,
  singleUse,
  className,
}: StatusBadgeProps) {
  const getTimeRemaining = (): string => {
    if (!expiresAt) return "Never expires";

    const now = Date.now();
    const remaining = expiresAt - now;

    if (remaining <= 0) return "Expired";

    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
    if (minutes > 0)
      return `${minutes} minute${minutes > 1 ? "s" : ""} remaining`;
    return `${seconds} second${seconds > 1 ? "s" : ""} remaining`;
  };

  // Dark-mode-compatible status colors
  // Using muted backgrounds with subtle colored borders and text
  const configs: Record<ObjectStatus, StatusConfig> = {
    active: {
      icon: <Clock className="h-4 w-4" />,
      label: "Available",
      description: singleUse
        ? `Single-use · ${getTimeRemaining()}`
        : getTimeRemaining(),
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
    },
    claimed: {
      icon: <CheckCircle className="h-4 w-4" />,
      label: "Already Claimed",
      description: "This single-use file has already been downloaded",
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10 border-amber-500/20",
    },
    expired: {
      icon: <XCircle className="h-4 w-4" />,
      label: "Expired",
      description: "This file has expired and is no longer available",
      colorClass: "text-red-400",
      bgClass: "bg-red-500/10 border-red-500/20",
    },
    "not-found": {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Not Found",
      description: "This file does not exist or has been deleted",
      colorClass: "text-muted-foreground",
      bgClass: "bg-muted/50 border-border",
    },
  };

  const config = configs[status];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        config.bgClass,
        className
      )}
      role="status"
      aria-label={config.label}
    >
      <div className={cn("mt-0.5", config.colorClass)}>{config.icon}</div>
      <div className="flex-1">
        <p className={cn("font-medium text-sm", config.colorClass)}>
          {config.label}
        </p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>
    </div>
  );
}
