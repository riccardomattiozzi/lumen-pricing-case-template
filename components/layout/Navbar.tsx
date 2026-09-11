"use client";

import { useEffect, useRef, useState } from "react";

// The LUMEN mark: a luminous point inside a halo ring, not a literal leaf,
// bolt, or badge. The offset highlight reads as a light source rather than
// a flat dot — the one recurring shape the rest of the brand motif system
// (BrandHalo, chart accents) echoes at larger scale.
function LumenMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14.25" stroke="var(--accent)" strokeWidth="1.25" opacity="0.4" />
      <circle cx="16" cy="16" r="7.5" fill="var(--accent)" />
      <circle cx="12.75" cy="12.5" r="2.35" fill="var(--surface)" opacity="0.92" />
    </svg>
  );
}

// A large title that hands off to the toolbar: the page opens on the big
// heading, and once it scrolls under the translucent bar the compact title
// fades in there (with a hairline), so the page never loses its name.
export function Navbar() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const barHeight = parseFloat(getComputedStyle(document.documentElement).fontSize) * 3.25;
    const observer = new IntersectionObserver(
      ([entry]) => setCondensed(!entry.isIntersecting),
      { rootMargin: `-${Math.round(barHeight)}px 0px 0px 0px` }
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className="toolbar sticky top-0 z-40"
        data-condensed={condensed ? "true" : "false"}
      >
        <div className="mx-auto flex h-[var(--nav-h)] max-w-7xl items-center gap-2.5 px-4 sm:px-6 lg:px-8">
          <LumenMark />
          <span className="text-[0.9375rem] font-bold uppercase tracking-[0.04em] text-foreground">
            Lumen
          </span>
          <span
            className="toolbar-title min-w-0 truncate border-l border-line pl-2.5 text-sm text-foreground-soft"
            aria-hidden={!condensed}
          >
            Pricing &amp; Go-to-Market Simulator
          </span>
        </div>
      </header>

      <div className="relative overflow-hidden">
        <BrandHalo />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-6 pt-7 sm:px-6 sm:pt-10 lg:px-8">
          <p className="text-footnote font-semibold uppercase tracking-[0.08em] text-accent-ink">
            Germany &middot; Year 1 &middot; Interactive decision tool
          </p>
          <h1
            ref={titleRef}
            className="mt-2 text-5xl font-extrabold uppercase leading-none tracking-[0.01em] text-foreground sm:text-6xl"
          >
            Lumen
          </h1>
          <p className="mt-2 text-xl font-medium text-foreground-soft sm:text-2xl">
            Pricing &amp; Go-to-Market Simulator
          </p>
          <p className="mt-3 text-sm font-semibold italic text-accent-ink">
            Bright energy. Clear decisions.
          </p>
          <p className="mt-2.5 max-w-2xl text-base text-foreground-soft text-pretty sm:text-lg">
            Evaluate pricing, channel strategy, market-share assumptions,
            customer economics and launch timing for LUMEN&apos;s German
            market entry — every number updates live as you move a control.
          </p>
        </div>
      </div>
    </>
  );
}

// A single soft radial glow behind the hero, low enough in opacity to read
// as daylight rather than decoration — the one place the brand halo motif
// appears at full scale. Purely decorative: aria-hidden, never behind text
// contrast, and static (no motion to respect prefers-reduced-motion by
// simply not needing an exception).
function BrandHalo() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -left-24 -top-40 h-96 w-96 rounded-full opacity-60"
      style={{
        background:
          "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 16%, transparent), transparent 72%)",
      }}
    />
  );
}
