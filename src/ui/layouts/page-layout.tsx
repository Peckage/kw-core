/**
 * PageLayout Component
 *
 * Base layout wrapper for all pages.
 * Provides consistent max-width, padding, and centering.
 *
 * @example
 * <PageLayout>
 *   <h1>Upload</h1>
 *   <UploadForm />
 * </PageLayout>
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageLayoutProps {
  /** Page content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Use wider container for landing pages */
  wide?: boolean;
}

/**
 * Page layout wrapper component.
 */
export function PageLayout({
  children,
  className,
  wide = false,
}: PageLayoutProps) {
  return (
    <main
      className={cn(
        "min-h-screen w-full px-4 py-8 md:px-6 md:py-12",
        "flex flex-col items-center",
        className
      )}
    >
      <div className={cn("w-full", wide ? "max-w-2xl" : "max-w-lg")}>
        {children}
      </div>
    </main>
  );
}
