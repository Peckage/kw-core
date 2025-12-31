/**
 * Claim Page
 *
 * Displays file info and handles decryption + download.
 * Extracts encryption key from URL fragment.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { PageLayout } from "@/ui/layouts/page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/shadcn/card";
import { Button } from "@/ui/shadcn/button";
import { Progress } from "@/ui/shadcn/progress";
import { FileInfo } from "@/ui/components/file-info";
import { StatusBadge, type ObjectStatus } from "@/ui/components/status-badge";
import { useToast } from "@/lib/hooks/use-toast";
import { downloadDecryptAndSave, isValidKey } from "@/core/crypto";
import { extractKeyFromFragment } from "@/lib/utils";
import type { KwikObjectPublicMeta } from "@/core/kwik-object";

type PageState = "loading" | "ready" | "downloading" | "complete" | "error";

interface ClaimError {
  code: string;
  message: string;
}

export default function ClaimPage() {
  const params = useParams();
  const { toast } = useToast();
  const objectId = params.id as string;

  // State
  const [pageState, setPageState] = React.useState<PageState>("loading");
  const [meta, setMeta] = React.useState<KwikObjectPublicMeta | null>(null);
  const [encryptionKey, setEncryptionKey] = React.useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = React.useState(0);
  const [error, setError] = React.useState<ClaimError | null>(null);

  // Load metadata and extract key on mount
  React.useEffect(() => {
    async function loadMeta(): Promise<void> {
      try {
        // Extract key from URL fragment
        const key = extractKeyFromFragment(window.location.hash);

        if (!key || !isValidKey(key)) {
          setError({
            code: "INVALID_KEY",
            message: "Invalid or missing decryption key in URL",
          });
          setPageState("error");
          return;
        }

        setEncryptionKey(key);

        // Fetch metadata
        const response = await fetch(`/api/fetch-meta?id=${objectId}`);

        if (!response.ok) {
          const data = await response.json();
          setError({
            code: data.code || "UNKNOWN",
            message: data.error || "Failed to load file info",
          });
          setPageState("error");
          return;
        }

        const data: KwikObjectPublicMeta = await response.json();
        setMeta(data);

        if (!data.isClaimable) {
          setError({
            code: "NOT_CLAIMABLE",
            message: "This file is no longer available",
          });
          setPageState("error");
          return;
        }

        setPageState("ready");
      } catch (err) {
        console.error("Load error:", err);
        setError({
          code: "LOAD_ERROR",
          message: "Failed to load file information",
        });
        setPageState("error");
      }
    }

    loadMeta();
  }, [objectId]);

  const handleDownload = React.useCallback(async () => {
    if (!meta || !encryptionKey) return;

    setPageState("downloading");
    setDownloadProgress(0);

    try {
      // Claim the object
      const claimResponse = await fetch("/api/claim-object", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: objectId }),
      });

      if (!claimResponse.ok) {
        const data = await claimResponse.json();
        throw new Error(data.error || "Failed to claim file");
      }

      const { downloadUrl } = await claimResponse.json();
      setDownloadProgress(10);

      // Download, decrypt, and save
      await downloadDecryptAndSave(
        downloadUrl,
        encryptionKey,
        meta.fileName,
        meta.mimeType,
        (processed, total) => {
          const percent = Math.round((processed / total) * 80) + 10;
          setDownloadProgress(Math.min(percent, 90));
        }
      );

      setDownloadProgress(100);
      setPageState("complete");

      toast({
        title: "Download complete",
        description: "Your file has been decrypted and saved",
      });
    } catch (err) {
      console.error("Download error:", err);
      const message = err instanceof Error ? err.message : "Download failed";

      setError({
        code: "DOWNLOAD_ERROR",
        message,
      });
      setPageState("error");

      toast({
        title: "Download failed",
        description: message,
        variant: "destructive",
      });
    }
  }, [meta, encryptionKey, objectId, toast]);

  const getObjectStatus = (): ObjectStatus => {
    if (!error) return "active";

    switch (error.code) {
      case "NOT_FOUND":
      case "DELETED":
        return "not-found";
      case "ALREADY_CLAIMED":
        return "claimed";
      case "EXPIRED":
        return "expired";
      default:
        return "not-found";
    }
  };

  return (
    <PageLayout>
      <div className="animate-in space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="transition-colors duration-200"
          >
            <Link href="/" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Download File
            </h1>
            <p className="text-sm text-muted-foreground">
              Encrypted file transfer
            </p>
          </div>
        </div>

        {/* Loading State */}
        {pageState === "loading" && (
          <Card className="animate-in">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {/* Ready State */}
        {pageState === "ready" && meta && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>File Ready</CardTitle>
              <CardDescription>
                Review the file details and download when ready
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileInfo
                fileName={meta.fileName}
                fileSize={meta.originalSize}
                mimeType={meta.mimeType}
              />

              <StatusBadge
                status="active"
                expiresAt={meta.expiresAt}
                singleUse={meta.singleUse}
              />

              <Button
                onClick={handleDownload}
                className="w-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download className="mr-2 h-4 w-4" />
                Decrypt & Download
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                File will be decrypted in your browser
              </p>
            </CardContent>
          </Card>
        )}

        {/* Downloading State */}
        {pageState === "downloading" && meta && (
          <Card className="animate-in">
            <CardContent className="space-y-6 py-8">
              <div className="text-center">
                <p className="font-medium">Downloading & Decrypting</p>
                <p className="text-sm text-muted-foreground">{meta.fileName}</p>
              </div>

              <div className="space-y-2">
                <Progress
                  value={downloadProgress}
                  className="transition-all duration-300"
                />
                <p className="text-center text-xs text-muted-foreground tabular-nums">
                  {downloadProgress}%
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete State */}
        {pageState === "complete" && (
          <Card className="animate-success border-emerald-500/20">
            <CardContent className="space-y-6 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Download className="h-6 w-6 text-emerald-400" />
              </div>

              <div>
                <p className="font-medium text-emerald-400">
                  Download Complete
                </p>
                <p className="text-sm text-muted-foreground">
                  Your file has been decrypted and saved
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                className="transition-colors duration-200"
              >
                <Link href="/">Share a File</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {pageState === "error" && (
          <Card className="animate-in border-destructive/30">
            <CardContent className="space-y-6 py-8">
              <StatusBadge status={getObjectStatus()} />

              <p className="text-center text-sm text-muted-foreground">
                {error?.message || "An error occurred"}
              </p>

              <div className="flex justify-center">
                <Button
                  asChild
                  variant="outline"
                  className="transition-colors duration-200"
                >
                  <Link href="/">Go Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
