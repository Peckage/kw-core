/**
 * ShareLink Component
 *
 * Displays a shareable link with copy-to-clipboard functionality.
 * Used on the upload result screen.
 *
 * @example
 * <ShareLink url="https://kwik.zip/claim/abc123#key" />
 */

"use client";

import * as React from "react";
import { Check, Copy, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/shadcn/button";
import { Input } from "@/ui/shadcn/input";

export interface ShareLinkProps {
  /** The URL to share */
  url: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Share link component with copy functionality.
 */
export function ShareLink({ url, className }: ShareLinkProps) {
  const [copied, setCopied] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleCopy = React.useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      if (inputRef.current) {
        inputRef.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [url]);

  const handleFocus = React.useCallback((): void => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Link className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Shareable Link</span>
      </div>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={url}
          readOnly
          onFocus={handleFocus}
          className="font-mono text-sm"
          aria-label="Shareable link"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          className="transition-all duration-200"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        The encryption key is part of the link. Anyone with this link can
        download and decrypt the file.
      </p>
    </div>
  );
}
