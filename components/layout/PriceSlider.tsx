"use client";

import { useScenarioStore } from "@/lib/store";
import { rangeStyle } from "@/components/ui/range";
import { WarningIcon } from "@/components/ui/icons";

const PRICE_MIN = 1.29;
const PRICE_MAX = 3.29;
const TESTED_MIN = 1.79;
const TESTED_MAX = 2.59;

// Where a price sits along the track, matching the thumb's own travel
// (its centre moves from half a knob in to half a knob from the end).
function trackPosition(price: number) {
  const t = (price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN);
  return `calc(var(--knob-size) / 2 + (100% - var(--knob-size)) * ${t})`;
}

export function PriceSlider() {
  const priceEur = useScenarioStore((s) => s.inputs.priceEur);
  const setPriceEur = useScenarioStore((s) => s.setPriceEur);
  const extrapolated = priceEur < TESTED_MIN || priceEur > TESTED_MAX;
  const testedSpan = (TESTED_MAX - TESTED_MIN) / (PRICE_MAX - PRICE_MIN);

  return (
    <section className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="price-slider" className="eyebrow">
          Price per can
        </label>
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {`€${priceEur.toFixed(2)}`}
        </span>
      </div>
      <input
        id="price-slider"
        type="range"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={0.01}
        value={priceEur}
        onChange={(e) => setPriceEur(Number(e.target.value))}
        aria-valuetext={`Price: €${priceEur.toFixed(2)}`}
        aria-describedby="price-tested-range"
        style={rangeStyle(priceEur, PRICE_MIN, PRICE_MAX)}
        className="mt-2"
      />

      {/* The band LUMEN actually tested, drawn to scale under the track —
          so "extrapolated" is visible before it becomes a warning. */}
      <div className="relative mt-1 h-7 text-2xs tabular-nums text-foreground-faint">
        <span
          aria-hidden
          className="absolute top-0 h-[3px] rounded-full bg-fill-strong"
          style={{
            left: trackPosition(TESTED_MIN),
            width: `calc((100% - var(--knob-size)) * ${testedSpan})`,
          }}
        />
        <span className="absolute left-0 top-2">{`€${PRICE_MIN.toFixed(2)}`}</span>
        <span
          id="price-tested-range"
          className="absolute top-2 -translate-x-1/2 whitespace-nowrap"
          style={{ left: trackPosition((TESTED_MIN + TESTED_MAX) / 2) }}
        >
          Tested {`€${TESTED_MIN.toFixed(2)}–€${TESTED_MAX.toFixed(2)}`}
        </span>
        <span className="absolute right-0 top-2">{`€${PRICE_MAX.toFixed(2)}`}</span>
      </div>

      {extrapolated && (
        <p className="mt-2 flex gap-1.5 text-xs text-warning-ink">
          <WarningIcon className="mt-px h-3.5 w-3.5 flex-none text-warning" />
          <span>
            Outside the tested range (€{TESTED_MIN.toFixed(2)}–€
            {TESTED_MAX.toFixed(2)}) — acceptance and margin here are
            extrapolated, not directly measured.
          </span>
        </p>
      )}
    </section>
  );
}
