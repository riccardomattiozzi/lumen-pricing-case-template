function LumenMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
      <circle cx="15" cy="15" r="15" fill="var(--accent)" />
      <path
        d="M15 6 C 19 11, 21 14.5, 21 18 A 6 6 0 0 1 9 18 C 9 14.5, 11 11, 15 6 Z"
        fill="var(--surface)"
        opacity="0.92"
      />
    </svg>
  );
}

export function Navbar() {
  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <LumenMark />
          <div>
            <p className="font-data text-[11px] uppercase tracking-[0.14em] text-accent-ink">
              LUMEN &middot; Germany launch
            </p>
            <h1 className="text-xl font-semibold text-foreground">
              Pricing &amp; Go-to-Market Simulator
            </h1>
          </div>
        </div>
        <p className="hidden max-w-xs text-right text-xs text-foreground-faint sm:block">
          Move the sliders to explore the price, channel and timing
          trade-off — every number updates live.
        </p>
      </div>
    </header>
  );
}
