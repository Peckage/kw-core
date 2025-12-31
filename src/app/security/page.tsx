/**
 * Zero-Knowledge Architecture
 *
 * Technical explanation of how Kwik's security model works.
 * Explanatory, factual, confident. Infrastructure documentation tone.
 */

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/ui/layouts/page-layout";
import { Button } from "@/ui/shadcn/button";

export const metadata = {
  title: "Security - Kwik",
  description:
    "How Kwik's zero-knowledge architecture works. Technical details on client-side encryption.",
};

export default function SecurityPage() {
  return (
    <PageLayout className="py-12 md:py-16">
      <div className="space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Zero-Knowledge Architecture
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Kwik is designed so that we cannot read your files. This page
            explains how that works.
          </p>
        </header>

        {/* Content */}
        <div className="prose-invert max-w-none space-y-10">
          {/* What zero-knowledge means */}
          <Section title="What zero-knowledge means in practice">
            <p>
              "Zero-knowledge" means the server operates without knowledge of
              the plaintext content it stores. Kwik never sees your files in
              readable form—only encrypted bytes.
            </p>
            <p>
              This is not a policy choice. It's an architectural constraint.
            </p>
            <p>
              Even if compelled by law, we cannot produce readable file contents
              because we don't have the decryption keys. They exist only in the
              links you share.
            </p>
          </Section>

          {/* Client-side encryption */}
          <Section title="Where encryption happens">
            <p>
              Encryption happens entirely in your browser before any data is
              transmitted. The process:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>You select a file.</li>
              <li>
                Your browser generates a random 256-bit encryption key using the
                Web Crypto API.
              </li>
              <li>The file is encrypted with AES-256-GCM using that key.</li>
              <li>Only the encrypted data is uploaded to our servers.</li>
              <li>
                The key is embedded in the shareable link as a URL fragment.
              </li>
            </ol>
            <p>
              At no point does the encryption key leave your browser through a
              server request.
            </p>
          </Section>

          {/* Technical specs */}
          <Section title="Cryptographic details">
            <div className="rounded-lg border border-border/30 bg-card/20 p-4 not-prose">
              <div className="space-y-2 font-mono text-sm text-muted-foreground">
                <Row label="Algorithm" value="AES-256-GCM" />
                <Row label="Key size" value="256 bits" />
                <Row label="IV size" value="96 bits (random per file)" />
                <Row label="Key derivation" value="None (direct random key)" />
                <Row
                  label="Implementation"
                  value="Web Crypto API (browser-native)"
                />
              </div>
            </div>
            <p>
              AES-256-GCM is an authenticated encryption mode. It provides both
              confidentiality and integrity—tampering with the ciphertext will
              cause decryption to fail.
            </p>
          </Section>

          {/* URL fragments */}
          <Section title="Why URL fragments matter">
            <p>The shareable link looks like this:</p>
            <div className="rounded-lg border border-border/30 bg-card/20 p-4 not-prose">
              <code className="text-sm">
                <span className="text-muted-foreground/60">
                  kwik.zip/claim/
                </span>
                <span className="text-muted-foreground">abc123</span>
                <span className="text-primary">#</span>
                <span className="text-emerald-400/80">encryption-key</span>
              </code>
            </div>
            <p>
              The part after the <code className="text-primary">#</code> is
              called a URL fragment. By design, browsers do not send fragments
              to servers. This is defined in RFC 3986 and is consistent across
              all modern browsers.
            </p>
            <p>
              When someone opens your link, their browser loads the page from{" "}
              <code>kwik.zip/claim/abc123</code>. The encryption key (everything
              after #) stays in the browser and is used locally to decrypt the
              file.
            </p>
            <p>Our server never receives the key.</p>
          </Section>

          {/* What the server sees */}
          <Section title="What the server can and cannot do">
            <div className="grid gap-4 sm:grid-cols-2 not-prose">
              <div className="rounded-lg border border-border/30 bg-card/20 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                  Server can
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Store encrypted blobs</li>
                  <li>• Delete files on schedule</li>
                  <li>• Track claim status</li>
                  <li>• Serve encrypted data</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border/30 bg-card/20 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                  Server cannot
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Decrypt file contents</li>
                  <li>• Recover lost keys</li>
                  <li>• Identify file types</li>
                  <li>• Read original filenames</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Threat model */}
          <Section title="Threat model">
            <p>Kwik's design protects against:</p>
            <ul>
              <li>
                <strong>Server compromise</strong> — An attacker who gains
                access to our servers sees only encrypted data. Without keys
                (which we don't have), the data is unusable.
              </li>
              <li>
                <strong>Legal requests</strong> — We can only provide what we
                have: encrypted blobs and metadata. We cannot provide readable
                content or decryption keys.
              </li>
              <li>
                <strong>Insider threat</strong> — Our own team cannot read user
                files. The architecture prevents it.
              </li>
            </ul>
            <p>Kwik does not protect against:</p>
            <ul>
              <li>
                <strong>Compromised endpoints</strong> — If your device or the
                recipient's device is compromised, the file can be intercepted
                after decryption.
              </li>
              <li>
                <strong>Link interception</strong> — If someone intercepts the
                full link (including the fragment), they can download and
                decrypt the file. Share links through secure channels.
              </li>
              <li>
                <strong>Browser vulnerabilities</strong> — We rely on the
                browser's Web Crypto API. Browser security is outside our
                control.
              </li>
            </ul>
            <p>
              No system provides absolute security. Kwik provides a strong
              baseline for casual and semi-sensitive file sharing. For
              high-stakes scenarios, consider additional layers of protection.
            </p>
          </Section>

          {/* Open design */}
          <Section title="Open design">
            <p>
              Kwik's security does not rely on obscurity. The encryption happens
              in client-side JavaScript that you can inspect in your browser's
              developer tools.
            </p>
            <p>
              We use standard, well-audited cryptographic primitives (AES-GCM
              via Web Crypto API) rather than custom implementations.
            </p>
          </Section>

          {/* Questions */}
          <Section title="Questions">
            <p>
              For security-related questions or to report a vulnerability:{" "}
              <a
                href="mailto:support@kwik.gg"
                className="text-primary hover:underline"
              >
                support@kwik.gg
              </a>
            </p>
          </Section>
        </div>
      </div>
    </PageLayout>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-muted-foreground [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ol]:space-y-2 [&_strong]:text-foreground [&_strong]:font-medium [&_code]:text-sm [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground/60">{label}</span>
      <span>{value}</span>
    </div>
  );
}
