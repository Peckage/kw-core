/**
 * Landing Page - Narrative Scroll Experience
 *
 * This page tells Kwik's story through calm, technical explanation
 * as the user scrolls. Each section reveals one aspect of how
 * the system works, building understanding through simplicity.
 *
 * Design philosophy:
 * - Explanation, not marketing
 * - Restraint over flash
 * - Trust through transparency
 * - Infrastructure-grade aesthetic
 *
 * Animation approach:
 * - CSS-based scroll reveals (no heavy JS)
 * - Subtle translateY (8px) + opacity transitions
 * - 250ms duration, ease-out
 * - Staggered delays for grouped elements
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import { PageLayout } from "@/ui/layouts/page-layout";
import { GlobalStats } from "@/ui/components/global-stats";

/**
 * Intersection Observer hook for scroll-based reveals.
 * Lightweight, CSS-driven approach - just toggles a class.
 */
function useScrollReveal() {
  React.useEffect(() => {
    const elements = document.querySelectorAll(".scroll-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function HomePage() {
  useScrollReveal();

  return (
    <PageLayout wide className="py-16 md:py-24">
      <div className="space-y-32">
        {/* ─────────────────────────────────────────────────────────────
            HERO
            Immediate clarity. No hype. Just state what it is.
        ───────────────────────────────────────────────────────────── */}
        <header className="animate-in space-y-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Kwik
          </h1>
          <div className="space-y-3">
            <p className="mx-auto max-w-lg text-lg text-muted-foreground">
              Encrypted file sharing with expiring, single-use links.
            </p>
            <p className="text-sm text-muted-foreground/60">
              No accounts. No tracking. The key never leaves your browser.
            </p>
          </div>
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/upload">
                Share a File
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="pt-12 opacity-40">
            <ArrowDown className="mx-auto h-4 w-4 animate-pulse" />
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            NARRATIVE SECTION 1: What happens when you upload
            Overview of the process in plain language.
        ───────────────────────────────────────────────────────────── */}
        <NarrativeSection>
          <SectionLabel>What happens</SectionLabel>
          <h2 className="scroll-reveal text-2xl font-semibold tracking-tight md:text-3xl">
            When you upload a file
          </h2>
          <p className="scroll-reveal scroll-reveal-delay-1 mx-auto max-w-xl text-muted-foreground">
            Your file is encrypted in your browser before it ever leaves your
            device. We store only the encrypted data. Without your link, it's
            unreadable.
          </p>

          {/* Simple flow diagram */}
          <div className="scroll-reveal scroll-reveal-delay-2 flex flex-wrap items-center justify-center gap-3 pt-4">
            <DiagramBox>Your file</DiagramBox>
            <DiagramArrow />
            <DiagramBox highlight>Encrypted locally</DiagramBox>
            <DiagramArrow />
            <DiagramBox>Stored as cipher</DiagramBox>
          </div>
        </NarrativeSection>

        {/* ─────────────────────────────────────────────────────────────
            NARRATIVE SECTION 2: Client-side encryption
            Technical explanation of the security model.
        ───────────────────────────────────────────────────────────── */}
        <NarrativeSection>
          <SectionLabel>Security</SectionLabel>
          <h2 className="scroll-reveal text-2xl font-semibold tracking-tight md:text-3xl">
            Encrypted before upload
          </h2>
          <p className="scroll-reveal scroll-reveal-delay-1 mx-auto max-w-xl text-muted-foreground">
            Encryption happens entirely in your browser using AES-256-GCM. A
            unique 256-bit key is generated for each file. This key is embedded
            in your shareable link—we never see it.
          </p>

          {/* Technical detail */}
          <div className="scroll-reveal scroll-reveal-delay-2 mx-auto max-w-md rounded-lg border border-border/30 bg-card/20 p-4">
            <div className="space-y-2 font-mono text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground/60">Algorithm</span>
                <span>AES-256-GCM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/60">Key size</span>
                <span>256 bits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/60">Key location</span>
                <span>URL fragment only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/60">Server access</span>
                <span>None</span>
              </div>
            </div>
          </div>
        </NarrativeSection>

        {/* ─────────────────────────────────────────────────────────────
            NARRATIVE SECTION 3: Zero-knowledge storage
            Explain what we store and why we can't read it.
            
            INTERACTIVE: Toggleable tabs for "We store" vs "We never see"
            Provides cause→effect satisfaction through direct manipulation.
        ───────────────────────────────────────────────────────────── */}
        <NarrativeSection>
          <SectionLabel>Storage</SectionLabel>
          <h2 className="scroll-reveal text-2xl font-semibold tracking-tight md:text-3xl">
            Stored as unreadable data
          </h2>
          <p className="scroll-reveal scroll-reveal-delay-1 mx-auto max-w-xl text-muted-foreground">
            What reaches our servers is already encrypted. We store encrypted
            bytes and minimal metadata. Without the key from your link, the data
            is meaningless.
          </p>

          {/* Interactive storage toggle */}
          <div className="scroll-reveal scroll-reveal-delay-2">
            <StorageToggle />
          </div>
        </NarrativeSection>

        {/* ─────────────────────────────────────────────────────────────
            NARRATIVE SECTION 4: The link
            How the shareable link works.
        ───────────────────────────────────────────────────────────── */}
        <NarrativeSection>
          <SectionLabel>Sharing</SectionLabel>
          <h2 className="scroll-reveal text-2xl font-semibold tracking-tight md:text-3xl">
            One link, one key
          </h2>
          <p className="scroll-reveal scroll-reveal-delay-1 mx-auto max-w-xl text-muted-foreground">
            The link you share contains everything needed to decrypt the file.
            The decryption key lives in the URL fragment—the part after the #.
            Browsers don't send fragments to servers. We never receive the key.
          </p>

          {/* Link anatomy */}
          <div className="scroll-reveal scroll-reveal-delay-2 mx-auto max-w-lg overflow-hidden rounded-lg border border-border/30 bg-card/20 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              Link anatomy
            </p>
            <div className="overflow-x-auto font-mono text-xs">
              <span className="text-muted-foreground/60">kwik.zip/claim/</span>
              <span className="text-muted-foreground">abc123</span>
              <span className="text-primary">#</span>
              <span className="text-emerald-400/80">your-secret-key</span>
            </div>
            <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground/50">
              <span>↑ Sent to server</span>
              <span className="text-emerald-400/50">↑ Never sent</span>
            </div>
          </div>
        </NarrativeSection>

        {/* ─────────────────────────────────────────────────────────────
            NARRATIVE SECTION 5: Expiry and single-use
            How files disappear.
        ───────────────────────────────────────────────────────────── */}
        <NarrativeSection>
          <SectionLabel>Lifecycle</SectionLabel>
          <h2 className="scroll-reveal text-2xl font-semibold tracking-tight md:text-3xl">
            Automatically destroyed
          </h2>
          <p className="scroll-reveal scroll-reveal-delay-1 mx-auto max-w-xl text-muted-foreground">
            Every file has an expiry. When time runs out, it's deleted.
            Single-use files delete immediately after the first download.
            There's no recovery, no archive, no trace.
          </p>

          {/* Expiry options */}
          <div className="scroll-reveal scroll-reveal-delay-2 flex flex-wrap justify-center gap-2 pt-2">
            {["1 hour", "24 hours", "7 days"].map((time) => (
              <span
                key={time}
                className="rounded-full border border-border/30 bg-card/20 px-3 py-1 text-xs text-muted-foreground"
              >
                {time}
              </span>
            ))}
            <span className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary/80">
              Single-use
            </span>
          </div>
        </NarrativeSection>

        {/* ─────────────────────────────────────────────────────────────
            NARRATIVE SECTION 6: The process summary
            Interactive lifecycle visualization.
            
            INTERACTIVE: Hover/click steps to reveal explanations.
            Creates cause→effect satisfaction through exploration.
        ───────────────────────────────────────────────────────────── */}
        <NarrativeSection>
          <SectionLabel>Process</SectionLabel>
          <h2 className="scroll-reveal text-2xl font-semibold tracking-tight md:text-3xl">
            How it works
          </h2>

          <div className="scroll-reveal scroll-reveal-delay-1 mx-auto max-w-2xl pt-4">
            <LifecycleExplorer />
          </div>
        </NarrativeSection>

        {/* ─────────────────────────────────────────────────────────────
            PLATFORM STATS
            Shows the system is alive and used. No hype, just numbers.
        ───────────────────────────────────────────────────────────── */}
        <div className="scroll-reveal text-center">
          <GlobalStats />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CLOSING
            Minimal. Confident. No call-to-action hype.
        ───────────────────────────────────────────────────────────── */}
        <section className="scroll-reveal space-y-8 text-center">
          <div className="mx-auto max-w-md space-y-3">
            <p className="text-lg text-muted-foreground">
              Simple by design. Secure by default.
            </p>
            <p className="text-sm text-muted-foreground/60">
              No accounts, no tracking, no complexity.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 px-6 transition-colors duration-200"
          >
            <Link href="/upload">
              Share a File
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            FOOTER
            Minimal attribution + legal links.
        ───────────────────────────────────────────────────────────── */}
        <footer className="scroll-reveal border-t border-border/20 pt-8 text-center text-xs text-muted-foreground/40">
          <div className="space-y-3">
            <p>
              Built by{" "}
              <a
                href="https://x.com/kwiklabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/60 transition-colors duration-200 hover:text-foreground"
              >
                @kwiklabs
              </a>
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/security"
                className="text-muted-foreground/50 transition-colors duration-200 hover:text-foreground"
              >
                Security
              </Link>
              <span className="text-muted-foreground/20">·</span>
              <Link
                href="/privacy"
                className="text-muted-foreground/50 transition-colors duration-200 hover:text-foreground"
              >
                Privacy
              </Link>
              <span className="text-muted-foreground/20">·</span>
              <Link
                href="/terms"
                className="text-muted-foreground/50 transition-colors duration-200 hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </PageLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   Small, focused components for the narrative layout.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Container for narrative sections.
 * Provides consistent spacing and centering.
 */
function NarrativeSection({ children }: { children: React.ReactNode }) {
  return <section className="space-y-6 text-center">{children}</section>;
}

/**
 * Small uppercase label above section headings.
 * Creates hierarchy and scanning landmarks.
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="scroll-reveal text-xs font-medium uppercase tracking-widest text-muted-foreground/50">
      {children}
    </p>
  );
}

/**
 * Box element for flow diagrams.
 * Minimal, technical aesthetic.
 */
function DiagramBox({
  children,
  highlight = false,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <span
      className={`rounded border px-3 py-1.5 font-mono text-xs ${
        highlight
          ? "border-primary/40 bg-primary/5 text-primary/90"
          : "border-border/40 bg-card/30 text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

/**
 * Arrow for connecting diagram boxes.
 */
function DiagramArrow() {
  return (
    <ArrowRight
      className="h-3 w-3 text-muted-foreground/30"
      aria-hidden="true"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTERACTIVE COMPONENTS
   
   These components add engagement through intentional interaction.
   The dopamine comes from cause→effect, not from spectacle.
   
   Design rules:
   - Immediate response (120-200ms)
   - Subtle visual feedback
   - Clear state changes
   - No looping animations
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * StorageToggle - Interactive "What we store / What we never see" component
 *
 * Interaction model:
 * - Two tabs that toggle content
 * - Active tab has accent styling
 * - Content crossfades smoothly (150ms)
 * - Satisfying click feedback through immediate state change
 */
function StorageToggle() {
  const [view, setView] = React.useState<"store" | "never">("store");

  const content = {
    store: {
      items: [
        "Encrypted file blob",
        "File size and expiry time",
        "Claim status (used/unused)",
      ],
      note: "Metadata only. No readable content.",
    },
    never: {
      items: ["Decryption key", "Original filename", "File contents"],
      note: "The key stays in your link. We can't read it.",
    },
  };

  return (
    <div className="mx-auto max-w-sm pt-2">
      {/* Toggle tabs */}
      <div className="mb-4 flex justify-center gap-1 rounded-lg bg-muted/30 p-1">
        <button
          onClick={() => setView("store")}
          className={`
            rounded-md px-4 py-2 text-xs font-medium transition-all duration-150
            ${
              view === "store"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground/80"
            }
          `}
          aria-pressed={view === "store"}
        >
          We store
        </button>
        <button
          onClick={() => setView("never")}
          className={`
            rounded-md px-4 py-2 text-xs font-medium transition-all duration-150
            ${
              view === "never"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground/80"
            }
          `}
          aria-pressed={view === "never"}
        >
          We never see
        </button>
      </div>

      {/* Content area with crossfade */}
      <div className="relative min-h-[120px]">
        {/* "We store" content */}
        <div
          className={`
            absolute inset-0 rounded-lg border border-border/30 bg-card/20 p-4 text-left
            transition-all duration-150 ease-out
            ${
              view === "store"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1 pointer-events-none"
            }
          `}
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            {content.store.items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground/50">
            {content.store.note}
          </p>
        </div>

        {/* "We never see" content */}
        <div
          className={`
            absolute inset-0 rounded-lg border border-border/30 bg-card/20 p-4 text-left
            transition-all duration-150 ease-out
            ${
              view === "never"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1 pointer-events-none"
            }
          `}
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            {content.never.items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400/60" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-emerald-400/50">
            {content.never.note}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * LifecycleExplorer - Interactive process visualization
 *
 * Interaction model:
 * - 6 steps representing the full object lifecycle
 * - Hover or click to select a step
 * - Selected step shows detailed explanation
 * - Connector line highlights active position
 * - Mobile: tap to select (no hover)
 *
 * Animation approach:
 * - 150ms transitions for immediate feedback
 * - Subtle scale (1.05) on active step
 * - Opacity changes for inactive states
 */

interface LifecycleStep {
  id: string;
  label: string;
  description: string;
  detail: string;
}

const lifecycleSteps: LifecycleStep[] = [
  {
    id: "select",
    label: "Select",
    description: "Choose your file",
    detail: "Pick any file up to 100MB. No account needed.",
  },
  {
    id: "encrypt",
    label: "Encrypt",
    description: "Secured locally",
    detail: "AES-256-GCM encryption happens entirely in your browser.",
  },
  {
    id: "upload",
    label: "Upload",
    description: "Cipher sent",
    detail:
      "Only encrypted bytes leave your device. We never see the original.",
  },
  {
    id: "share",
    label: "Share",
    description: "Link created",
    detail: "The key is embedded in the URL fragment—never sent to servers.",
  },
  {
    id: "claim",
    label: "Claim",
    description: "Downloaded",
    detail: "Recipient decrypts in their browser using the key from your link.",
  },
  {
    id: "destroy",
    label: "Destroy",
    description: "Auto-deleted",
    detail: "After claim or expiry, the encrypted data is permanently deleted.",
  },
];

function LifecycleExplorer() {
  // Default to middle step for visual balance
  const [activeStep, setActiveStep] = React.useState<string>("upload");

  const activeData =
    lifecycleSteps.find((s) => s.id === activeStep) ?? lifecycleSteps[2]!;

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="relative">
        {/* Connector line (behind steps) */}
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border/30" />

        {/* Progress indicator */}
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-primary/40 transition-all duration-200 ease-out"
          style={{
            left: 0,
            width: `${
              (lifecycleSteps.findIndex((s) => s.id === activeStep) /
                (lifecycleSteps.length - 1)) *
              100
            }%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {lifecycleSteps.map((step, index) => {
            const isActive = step.id === activeStep;
            const isPast =
              index < lifecycleSteps.findIndex((s) => s.id === activeStep);

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                onMouseEnter={() => setActiveStep(step.id)}
                className={`
                  group relative flex flex-col items-center
                  transition-all duration-150 ease-out
                  ${isActive ? "scale-105" : "scale-100 hover:scale-102"}
                `}
                aria-pressed={isActive}
              >
                {/* Step circle */}
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full border-2
                    transition-all duration-150 ease-out
                    ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isPast
                        ? "border-primary/40 bg-primary/10 text-primary/60"
                        : "border-border/50 bg-card/50 text-muted-foreground group-hover:border-primary/30"
                    }
                  `}
                >
                  <span className="text-xs font-semibold">{index + 1}</span>
                </div>

                {/* Step label (hidden on mobile, shown on sm+) */}
                <span
                  className={`
                    mt-2 hidden text-xs font-medium sm:block
                    transition-colors duration-150
                    ${isActive ? "text-foreground" : "text-muted-foreground/60"}
                  `}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active step detail */}
      <div className="rounded-lg border border-border/30 bg-card/20 p-4 text-center">
        {/* Step title with subtle entrance animation */}
        <p key={activeData.id} className="animate-in text-sm font-medium">
          {activeData.description}
        </p>
        <p
          key={`${activeData.id}-detail`}
          className="animate-in mt-2 text-xs text-muted-foreground"
          style={{ animationDelay: "50ms" }}
        >
          {activeData.detail}
        </p>
      </div>
    </div>
  );
}
