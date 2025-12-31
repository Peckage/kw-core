/**
 * Upload Page
 *
 * Handles file upload, encryption, and link generation.
 * Client component for encryption and upload state management.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { PageLayout } from "@/ui/layouts/page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/shadcn/card";
import { Button } from "@/ui/shadcn/button";
import { Label } from "@/ui/shadcn/label";
import { Switch } from "@/ui/shadcn/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import { FileDropzone } from "@/ui/components/file-dropzone";
import {
  UploadProgress,
  type UploadStage,
} from "@/ui/components/upload-progress";
import { ShareLink } from "@/ui/components/share-link";
import { useToast } from "@/lib/hooks/use-toast";
import { generateKey, encryptFile, createEncryptedBlob } from "@/core/crypto";
import { EXPIRY_OPTIONS, MAX_FILE_SIZE } from "@/core/kwik-object";
import { generateShareUrl } from "@/lib/utils";

type PageState = "form" | "uploading" | "success" | "error";

interface UploadState {
  stage: UploadStage;
  progress: number;
}

interface UploadResult {
  shareUrl: string;
  objectId: string;
}

export default function UploadPage() {
  const { toast } = useToast();

  // Form state
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [expirySeconds, setExpirySeconds] = React.useState<string>("86400"); // 24 hours default
  const [singleUse, setSingleUse] = React.useState(true);

  // Page state
  const [pageState, setPageState] = React.useState<PageState>("form");
  const [uploadState, setUploadState] = React.useState<UploadState>({
    stage: "encrypting",
    progress: 0,
  });
  const [result, setResult] = React.useState<UploadResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleUpload = React.useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setPageState("uploading");
    setError(null);

    try {
      // Stage 1: Generate encryption key
      setUploadState({ stage: "encrypting", progress: 0 });
      const encryptionKey = await generateKey();

      // Stage 2: Encrypt file
      setUploadState({ stage: "encrypting", progress: 25 });
      const { encryptedData, encryptedSize } = await encryptFile(
        selectedFile,
        encryptionKey,
        (processed, total) => {
          const percent = Math.round((processed / total) * 50) + 25;
          setUploadState({
            stage: "encrypting",
            progress: Math.min(percent, 75),
          });
        }
      );
      setUploadState({ stage: "encrypting", progress: 75 });

      // Stage 3: Create object on server
      setUploadState({ stage: "uploading", progress: 0 });
      const createResponse = await fetch("/api/create-object", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          mimeType: selectedFile.type || "application/octet-stream",
          originalSize: selectedFile.size,
          encryptedSize,
          expirySeconds:
            expirySeconds === "null" ? null : parseInt(expirySeconds, 10),
          singleUse,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Failed to create object");
      }

      const { id, uploadUrl } = await createResponse.json();
      setUploadState({ stage: "uploading", progress: 25 });

      // Stage 4: Upload encrypted blob to storage
      const blob = createEncryptedBlob(encryptedData);
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": encryptedSize.toString(),
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload encrypted file");
      }

      setUploadState({ stage: "finalizing", progress: 75 });

      // Stage 5: Generate share URL with key in fragment
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const shareUrl = generateShareUrl(appUrl, id, encryptionKey);

      setUploadState({ stage: "complete", progress: 100 });
      setResult({ shareUrl, objectId: id });
      setPageState("success");

      toast({
        title: "Upload complete",
        description: "Your file is ready to share",
      });
    } catch (err) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setPageState("error");

      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    }
  }, [selectedFile, expirySeconds, singleUse, toast]);

  const handleReset = React.useCallback(() => {
    setSelectedFile(null);
    setExpirySeconds("86400");
    setSingleUse(true);
    setPageState("form");
    setUploadState({ stage: "encrypting", progress: 0 });
    setResult(null);
    setError(null);
  }, []);

  const isFormValid = selectedFile !== null;

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
              Upload File
            </h1>
            <p className="text-sm text-muted-foreground">
              Encrypt and share securely
            </p>
          </div>
        </div>

        {/* Form State */}
        {pageState === "form" && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Select a File</CardTitle>
              <CardDescription>
                Your file will be encrypted before upload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileDropzone
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                maxSize={MAX_FILE_SIZE}
              />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expires After</Label>
                  <Select
                    value={expirySeconds}
                    onValueChange={setExpirySeconds}
                  >
                    <SelectTrigger id="expiry">
                      <SelectValue placeholder="Select expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value ?? "null"}
                          value={option.value?.toString() ?? "null"}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="single-use">Single Use</Label>
                    <p className="text-xs text-muted-foreground">
                      File deletes after first download
                    </p>
                  </div>
                  <Switch
                    id="single-use"
                    checked={singleUse}
                    onCheckedChange={setSingleUse}
                  />
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!isFormValid}
                className="w-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Upload className="mr-2 h-4 w-4" />
                Encrypt & Upload
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Uploading State */}
        {pageState === "uploading" && selectedFile && (
          <Card className="animate-in">
            <CardContent className="py-8">
              <UploadProgress
                stage={uploadState.stage}
                progress={uploadState.progress}
                fileName={selectedFile.name}
                fileSize={selectedFile.size}
              />
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {pageState === "success" && result && (
          <Card className="animate-success border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-emerald-400">Ready to Share</CardTitle>
              <CardDescription>
                Copy the link below and share it with the recipient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ShareLink url={result.shareUrl} />

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 transition-colors duration-200"
                >
                  Upload Another
                </Button>
                <Button
                  asChild
                  className="flex-1 transition-colors duration-200"
                >
                  <Link href="/">Done</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {pageState === "error" && (
          <Card className="animate-in border-destructive/30">
            <CardContent className="py-8 text-center">
              <div className="space-y-4">
                <p className="text-destructive">
                  {error || "An error occurred"}
                </p>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="transition-colors duration-200"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
