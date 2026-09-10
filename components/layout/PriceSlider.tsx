"use client";

import { useScenarioStore } from "@/lib/store";

const PRICE_MIN = 1.29;
const PRICE_MAX = 3.29;
const TESTED_MIN = 1.79;
const TESTED_MAX = 2.59;

export function PriceSlider() {
  const priceEur = useScenarioStore((s) => s.inputs.priceEur);
  const setPriceEur = useScenarioStore((s) => s.setPriceEur);
  const extrapolated = priceEur < TESTED_MIN || priceEur > TESTED_MAX;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor="price-slider" className="text-sm font-medium text-foreground">
          Price
        </label>
        <span className="font-data text-sm">
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
        className="mt-2"
      />
      <div className="mt-1 flex justify-between text-xs text-foreground-faint">
        <span>{`€${PRICE_MIN.toFixed(2)}`}</span>
        <span>{`€${PRICE_MAX.toFixed(2)}`}</span>
      </div>
      {extrapolated && (
        <p className="mt-1.5 text-xs text-cmo">
          Outside the tested range (€{TESTED_MIN.toFixed(2)}–€
          {TESTED_MAX.toFixed(2)}) — acceptance and margin here are
          extrapolated, not directly measured.
        </p>
      )}
    </div>
  );
}
