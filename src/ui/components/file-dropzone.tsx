/**
 * FileDropzone Component
 *
 * A drag-and-drop file upload zone with click-to-browse fallback.
 * Shows file preview after selection.
 *
 * @example
 * <FileDropzone
 *   onFileSelect={handleFile}
 *   disabled={isUploading}
 *   maxSize={100 * 1024 * 1024}
 * />
 */

"use client";

import * as React from "react";
import { Upload, File, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/ui/shadcn/button";

export interface FileDropzoneProps {
  /** Callback when a file is selected */
  onFileSelect: (file: File | null) => void;
  /** Currently selected file */
  selectedFile?: File | null;
  /** Whether the dropzone is disabled */
  disabled?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Accepted file types (MIME patterns) */
  accept?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * File dropzone component with drag-and-drop support.
 */
export function FileDropzone({
  onFileSelect,
  selectedFile,
  disabled = false,
  maxSize,
  accept,
  className,
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = React.useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragActive(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = React.useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = React.useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File too large. Maximum size is ${formatBytes(maxSize)}`;
      }
      return null;
    },
    [maxSize]
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file) {
          const validationError = validateFile(file);
          if (validationError) {
            setError(validationError);
            return;
          }
          setError(null);
          onFileSelect(file);
        }
      }
    },
    [disabled, onFileSelect, validateFile]
  );

  const handleClick = React.useCallback((): void => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file) {
          const validationError = validateFile(file);
          if (validationError) {
            setError(validationError);
            return;
          }
          setError(null);
          onFileSelect(file);
        }
      }
    },
    [onFileSelect, validateFile]
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent): void => {
      e.stopPropagation();
      setError(null);
      onFileSelect(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onFileSelect]
  );

  return (
    <div className={cn("w-full", className)}>
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload dropzone"
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200",
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
          disabled && "cursor-not-allowed opacity-50",
          selectedFile && "border-primary/50 bg-primary/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
          accept={accept}
          aria-hidden="true"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <File className="h-10 w-10 text-primary" />
            <div className="space-y-1">
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(selectedFile.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="mt-2"
              disabled={disabled}
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <Upload
              className={cn(
                "h-10 w-10",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {isDragActive ? "Drop file here" : "Drag and drop a file"}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse
              </p>
            </div>
            {maxSize && (
              <p className="text-xs text-muted-foreground">
                Maximum file size: {formatBytes(maxSize)}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
