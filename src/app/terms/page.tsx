/**
 * Terms of Service
 *
 * Minimal, honest terms. No aggressive language.
 * Clear about what the service does and doesn't guarantee.
 */

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/ui/layouts/page-layout";
import { Button } from "@/ui/shadcn/button";

export const metadata = {
  title: "Terms of Service - Kwik",
  description: "Terms of service for using Kwik file sharing.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: December 2024
          </p>
        </header>

        {/* Content */}
        <div className="prose-invert max-w-none space-y-10">
          {/* The basics */}
          <Section title="The basics">
            <p>
              Kwik is a file sharing service that lets you share encrypted,
              expiring files. By using Kwik, you agree to these terms.
            </p>
            <p>
              We've tried to keep this document short and readable. If something
              is unclear, feel free to ask.
            </p>
          </Section>

          {/* What the service does */}
          <Section title="What the service does">
            <p>Kwik provides:</p>
            <ul>
              <li>Client-side encryption of files in your browser</li>
              <li>Temporary storage of encrypted data</li>
              <li>Shareable links that expire automatically</li>
              <li>Single-use download options</li>
            </ul>
            <p>
              Kwik is designed for sharing files that don't need to exist
              forever. It is not a backup service, archive, or permanent storage
              solution.
            </p>
          </Section>

          {/* No guarantees */}
          <Section title="Service provided as-is">
            <p>
              Kwik is provided "as is" without warranties of any kind, express
              or implied.
            </p>
            <p>We do not guarantee:</p>
            <ul>
              <li>Continuous, uninterrupted availability</li>
              <li>That files will be accessible until their expiry time</li>
              <li>Recovery of deleted or expired files</li>
              <li>Compatibility with all browsers or devices</li>
            </ul>
            <p>
              We operate the service in good faith and aim for reliability, but
              things can go wrong. Do not rely on Kwik as your only copy of
              important files.
            </p>
          </Section>

          {/* Your responsibilities */}
          <Section title="Your responsibilities">
            <p>When using Kwik, you agree to:</p>
            <ul>
              <li>
                <strong>Keep your links safe</strong> — Anyone with the full
                link can download and decrypt your file. Share links through
                secure channels.
              </li>
              <li>
                <strong>Respect expiry</strong> — Files are deleted
                automatically. Download what you need before expiry.
              </li>
              <li>
                <strong>Use the service legally</strong> — Do not upload content
                that violates laws in your jurisdiction or ours
                (Netherlands/EU).
              </li>
            </ul>
          </Section>

          {/* Prohibited content */}
          <Section title="Prohibited content">
            <p>You may not use Kwik to share:</p>
            <ul>
              <li>Child sexual abuse material (CSAM)</li>
              <li>Content that violates intellectual property rights</li>
              <li>Malware or malicious software</li>
              <li>Content used to harass, threaten, or harm others</li>
              <li>Any content illegal under Dutch or EU law</li>
            </ul>
            <p>
              While we cannot inspect encrypted content, we will cooperate with
              law enforcement when legally required and will remove content when
              we receive valid legal requests.
            </p>
          </Section>

          {/* Deletion and loss */}
          <Section title="Deletion is permanent">
            <p>
              When files expire or are claimed (for single-use files), they are
              deleted permanently. There is no recovery process.
            </p>
            <p>We are not responsible for:</p>
            <ul>
              <li>Lost or forgotten links</li>
              <li>Files that expired before download</li>
              <li>Links shared with unintended recipients</li>
              <li>Data loss due to service interruptions</li>
            </ul>
            <p>
              This is by design. Permanent deletion is a feature, not a bug.
            </p>
          </Section>

          {/* Liability */}
          <Section title="Limitation of liability">
            <p>
              To the maximum extent permitted by law, Kwik and its operators are
              not liable for any indirect, incidental, special, consequential,
              or punitive damages resulting from your use of the service.
            </p>
            <p>
              Our total liability for any claim arising from your use of Kwik is
              limited to the amount you paid for the service (which is zero,
              since Kwik is free).
            </p>
            <p>
              This doesn't affect any rights you have under consumer protection
              laws that cannot be waived by contract.
            </p>
          </Section>

          {/* Changes */}
          <Section title="Changes to these terms">
            <p>
              We may update these terms from time to time. Significant changes
              will be noted by updating the date at the top of this page.
            </p>
            <p>
              Continued use of the service after changes constitutes acceptance
              of the new terms.
            </p>
          </Section>

          {/* Termination */}
          <Section title="Termination">
            <p>
              We may suspend or terminate access to Kwik at any time, for any
              reason, without notice. Given that no accounts exist, this
              typically means blocking specific content or IP ranges if abuse is
              detected.
            </p>
            <p>
              You can stop using Kwik at any time. There's nothing to cancel.
            </p>
          </Section>

          {/* Governing law */}
          <Section title="Governing law">
            <p>
              These terms are governed by the laws of the Netherlands. Any
              disputes will be resolved in Dutch courts.
            </p>
          </Section>

          {/* Contact */}
          <Section title="Contact">
            <p>
              For questions about these terms:{" "}
              <a
                href="mailto:legal@kwik.gg"
                className="text-primary hover:underline"
              >
                legal@kwik.gg
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
