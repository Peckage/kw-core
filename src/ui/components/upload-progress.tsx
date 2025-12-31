/**
 * UploadProgress Component
 *
 * Shows upload progress with stages: encrypting, uploading, finalizing.
 *
 * @example
 * <UploadProgress
 *   stage="uploading"
 *   progress={75}
 *   fileName="document.pdf"
 * />
 */

"use client";

import * as React from "react";
import { Lock, Upload, CheckCircle, Loader2 } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Progress } from "@/ui/shadcn/progress";

export type UploadStage =
  | "encrypting"
  | "uploading"
  | "finalizing"
  | "complete";

export interface UploadProgressProps {
  /** Current upload stage */
  stage: UploadStage;
  /** Progress percentage (0-100) */
  progress: number;
  /** File name being uploaded */
  fileName: string;
  /** File size in bytes */
  fileSize?: number;
  /** Additional CSS classes */
  className?: string;
}

interface StageInfo {
  icon: React.ReactNode;
  label: string;
  description: string;
}

/**
 * Upload progress component with stage indicators.
 */
export function UploadProgress({
  stage,
  progress,
  fileName,
  fileSize,
  className,
}: UploadProgressProps) {
  const stages: Record<UploadStage, StageInfo> = {
    encrypting: {
      icon: <Lock className="h-5 w-5 animate-pulse" />,
      label: "Encrypting",
      description: "Encrypting your file locally...",
    },
    uploading: {
      icon: <Upload className="h-5 w-5" />,
      label: "Uploading",
      description: "Uploading encrypted data...",
    },
    finalizing: {
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
      label: "Finalizing",
      description: "Creating shareable link...",
    },
    complete: {
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
      label: "Complete",
      description: "Your file is ready to share",
    },
  };

  const currentStage = stages[stage];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300",
            stage === "complete" ? "bg-emerald-500/10" : "bg-primary/10"
          )}
        >
          {currentStage.icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{currentStage.label}</p>
          <p className="text-xs text-muted-foreground">
            {currentStage.description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress
          value={progress}
          className="h-2 transition-all duration-300"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[200px]">{fileName}</span>
          <span className="tabular-nums">
            {progress}%{fileSize && ` · ${formatBytes(fileSize)}`}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {(["encrypting", "uploading", "finalizing", "complete"] as const).map(
          (s, i) => (
            <div
              key={s}
              className={cn(
                "h-1.5 w-8 rounded-full transition-all duration-300",
                getStageIndex(stage) >= i ? "bg-primary" : "bg-muted"
              )}
            />
          )
        )}
      </div>
    </div>
  );
}

function getStageIndex(stage: UploadStage): number {
  const stages: UploadStage[] = [
    "encrypting",
    "uploading",
    "finalizing",
    "complete",
  ];
  return stages.indexOf(stage);
}
