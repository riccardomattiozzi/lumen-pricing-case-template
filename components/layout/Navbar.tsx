export function Navbar() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-mono uppercase tracking-wide text-accent">
            LUMEN &middot; Germany launch
          </p>
          <h1 className="text-xl font-semibold text-foreground">
            Pricing &amp; Go-to-Market Simulator
          </h1>
        </div>
        <p className="hidden max-w-xs text-right text-xs text-foreground-faint sm:block">
          Move the sliders to explore the price, channel and timing
          trade-off — every number updates live.
        </p>
      </div>
    </header>
  );
}
