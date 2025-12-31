/**
 * Privacy Policy
 *
 * Zero-knowledge focused privacy policy.
 * Written in plain language, not legal jargon.
 * Honest about what we store and what we don't.
 */

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/ui/layouts/page-layout";
import { Button } from "@/ui/shadcn/button";

export const metadata = {
  title: "Privacy Policy - Kwik",
  description: "How Kwik handles your data. Short answer: we can't read it.",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: December 2024
          </p>
        </header>

        {/* Content */}
        <div className="prose-invert max-w-none space-y-10">
          {/* Overview */}
          <Section title="Overview">
            <p>
              Kwik is a zero-knowledge file sharing service. We designed it so
              that we cannot read your files, even if we wanted to.
            </p>
            <p>
              This privacy policy explains what data we handle, what we don't,
              and why.
            </p>
          </Section>

          {/* What we don't do */}
          <Section title="What we don't do">
            <ul>
              <li>We do not track you across the web</li>
              <li>We do not use analytics or tracking scripts</li>
              <li>We do not serve advertisements</li>
              <li>We do not require accounts or registration</li>
              <li>We do not sell or share data with third parties</li>
              <li>We do not profile users</li>
            </ul>
          </Section>

          {/* What we store */}
          <Section title="What we store">
            <p>When you upload a file, we store:</p>
            <ul>
              <li>
                <strong>Encrypted file blob</strong> — The encrypted version of
                your file. We cannot decrypt it.
              </li>
              <li>
                <strong>File size</strong> — The size of the encrypted data.
              </li>
              <li>
                <strong>Expiry timestamp</strong> — When the file should be
                deleted.
              </li>
              <li>
                <strong>Claim status</strong> — Whether the file has been
                downloaded (for single-use files).
              </li>
            </ul>
            <p>
              This metadata is necessary to operate the service. It does not
              identify you or reveal the contents of your files.
            </p>
          </Section>

          {/* What we never see */}
          <Section title="What we never see">
            <p>By design, we never have access to:</p>
            <ul>
              <li>
                <strong>Encryption keys</strong> — Keys are generated in your
                browser and embedded in the shareable link. They never reach our
                servers.
              </li>
              <li>
                <strong>File contents</strong> — Files are encrypted before
                upload. We store only ciphertext.
              </li>
              <li>
                <strong>Original filenames</strong> — Encrypted along with the
                file content.
              </li>
              <li>
                <strong>Your identity</strong> — No accounts, no login, no
                persistent identifiers.
              </li>
            </ul>
          </Section>

          {/* Automatic deletion */}
          <Section title="Automatic deletion">
            <p>All files on Kwik are temporary by design.</p>
            <ul>
              <li>Files are deleted automatically when they expire.</li>
              <li>
                Single-use files are deleted immediately after the first
                download.
              </li>
              <li>
                Deletion is irreversible. We do not keep backups of user files.
              </li>
            </ul>
            <p>
              Once a file is deleted, the encrypted data is permanently removed
              from our systems.
            </p>
          </Section>

          {/* Server logs */}
          <Section title="Server logs">
            <p>
              Our servers may generate standard access logs for security and
              debugging purposes. These logs may include:
            </p>
            <ul>
              <li>IP addresses (not linked to file content)</li>
              <li>Timestamps</li>
              <li>HTTP request metadata</li>
            </ul>
            <p>
              Logs are retained for a limited period and are not used for
              tracking or profiling. They do not contain encryption keys or file
              contents.
            </p>
          </Section>

          {/* GDPR */}
          <Section title="EU privacy compliance">
            <p>
              Kwik is operated from the Netherlands and designed with EU privacy
              principles in mind.
            </p>
            <p>
              Because we don't collect personal data or require accounts, most
              GDPR concepts (like data subject requests) don't apply in the
              traditional sense. There's no account to delete, no profile to
              export, and no personal data to correct.
            </p>
            <p>
              If you have questions about your data, contact us at{" "}
              <a
                href="mailto:contact@kwik.gg"
                className="text-primary hover:underline"
              >
                contact@kwik.gg
              </a>
              .
            </p>
          </Section>

          {/* Changes */}
          <Section title="Changes to this policy">
            <p>
              If we make significant changes to this policy, we will update the
              date at the top of this page. The nature of our service means
              changes are unlikely—there's not much we can change about "we
              can't read your files."
            </p>
          </Section>

          {/* Contact */}
          <Section title="Contact">
            <p>
              For privacy-related questions:{" "}
              <a
                href="mailto:contact@kwik.gg"
                className="text-primary hover:underline"
              >
                contact@kwik.gg
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
      <div className="space-y-3 text-muted-foreground [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&_strong]:text-foreground [&_strong]:font-medium">
        {children}
      </div>
    </section>
  );
}
