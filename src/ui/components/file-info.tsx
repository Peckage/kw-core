/**
 * FileInfo Component
 *
 * Displays file information for claim screens.
 *
 * @example
 * <FileInfo
 *   fileName="document.pdf"
 *   fileSize={1024000}
 *   mimeType="application/pdf"
 * />
 */

import * as React from "react";
import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

export interface FileInfoProps {
  /** Original filename */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type */
  mimeType: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Gets the appropriate icon for a MIME type.
 */
function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.startsWith("image/")) {
    return <FileImage className="h-8 w-8" />;
  }
  if (mimeType.startsWith("video/")) {
    return <FileVideo className="h-8 w-8" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <FileAudio className="h-8 w-8" />;
  }
  if (mimeType.startsWith("text/")) {
    return <FileText className="h-8 w-8" />;
  }
  if (
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z")
  ) {
    return <FileArchive className="h-8 w-8" />;
  }
  return <File className="h-8 w-8" />;
}

/**
 * Gets a human-readable file type from MIME type.
 */
function getFileType(mimeType: string): string {
  const typeMap: Record<string, string> = {
    "application/pdf": "PDF Document",
    "application/zip": "ZIP Archive",
    "application/json": "JSON File",
    "text/plain": "Text File",
    "text/html": "HTML Document",
    "text/css": "CSS Stylesheet",
    "text/javascript": "JavaScript File",
  };

  if (typeMap[mimeType]) {
    return typeMap[mimeType];
  }

  if (mimeType.startsWith("image/")) {
    const subtype = mimeType.split("/")[1]?.toUpperCase();
    return subtype ? `${subtype} Image` : "Image";
  }

  if (mimeType.startsWith("video/")) {
    const subtype = mimeType.split("/")[1]?.toUpperCase();
    return subtype ? `${subtype} Video` : "Video";
  }

  if (mimeType.startsWith("audio/")) {
    const subtype = mimeType.split("/")[1]?.toUpperCase();
    return subtype ? `${subtype} Audio` : "Audio";
  }

  return "File";
}

/**
 * File info display component.
 */
export function FileInfo({
  fileName,
  fileSize,
  mimeType,
  className,
}: FileInfoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-muted/50 p-4",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background text-muted-foreground">
        {getFileIcon(mimeType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" title={fileName}>
          {fileName}
        </p>
        <p className="text-xs text-muted-foreground">
          {getFileType(mimeType)} · {formatBytes(fileSize)}
        </p>
      </div>
    </div>
  );
}
