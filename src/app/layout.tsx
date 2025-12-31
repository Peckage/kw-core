/**
 * Root Layout
 *
 * Provides global styles, fonts, and toast notifications.
 *
 * THEME: Kwik is dark-mode-first by design (v0.1).
 * The dark class is statically applied - no theme switching,
 * no system detection, no user preferences. This is intentional
 * to keep the experience focused and consistent. Light mode
 * may be added in a future version.
 */

import * as React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/ui/shadcn/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Kwik - Encrypted File Sharing",
  description:
    "Share files securely with client-side encryption, expiry, and single-use links.",
  keywords: [
    "file sharing",
    "encryption",
    "secure",
    "ephemeral",
    "self-destructing",
  ],
  authors: [{ name: "Kwik Labs" }],
  openGraph: {
    title: "Kwik - Encrypted File Sharing",
    description: "Share files securely with client-side encryption.",
    url: "https://kwik.zip",
    siteName: "Kwik",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kwik - Encrypted File Sharing",
    description: "Share files securely with client-side encryption.",
    creator: "@kwiklabs",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // dark class is applied statically - Kwik is dark-mode-only in v0.1
    // suppressHydrationWarning is for Next.js font loading, not theme switching
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
