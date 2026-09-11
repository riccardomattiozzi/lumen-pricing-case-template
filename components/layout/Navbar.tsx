"use client";

import { useEffect, useRef, useState } from "react";

function LumenMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden>
      <rect width="30" height="30" rx="8" fill="var(--accent)" />
      <path
        d="M15 6.5 C 19 11.5, 21 14.8, 21 18 A 6 6 0 0 1 9 18 C 9 14.8, 11 11.5, 15 6.5 Z"
        fill="#fff"
        opacity="0.94"
      />
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
          <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">
            LUMEN
          </span>
          <span
            className="toolbar-title min-w-0 truncate border-l border-line pl-2.5 text-sm text-foreground-soft"
            aria-hidden={!condensed}
          >
            Pricing &amp; Go-to-Market Simulator
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        <p className="text-footnote font-semibold uppercase tracking-[0.02em] text-accent-ink">
          Germany &middot; Year 1 &middot; Interactive decision simulator
        </p>
        <h1
          ref={titleRef}
          className="mt-1.5 text-3xl font-bold text-foreground sm:text-4xl"
        >
          LUMEN Germany Launch Simulator
        </h1>
        <p className="mt-2.5 max-w-2xl text-base text-foreground-soft text-pretty sm:text-lg">
          Evaluate pricing, channel strategy, market-share assumptions,
          customer economics and launch timing for LUMEN&apos;s German
          market entry — every number updates live as you move a control.
        </p>
      </div>
    </>
  );
}
