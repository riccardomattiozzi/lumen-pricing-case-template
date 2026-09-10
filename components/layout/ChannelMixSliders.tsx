"use client";

import { useScenarioStore } from "@/lib/store";
import type { SalesChannel } from "@/lib/types";

const CHANNELS: SalesChannel[] = ["DTC Online", "Retail/Grocery", "Gym & Office"];

// Dragging one channel to a new share redistributes the remainder across
// the other two, proportional to their current ratio (equal split if both
// are at zero) — so the three always keep summing to 100% as you drag,
// instead of silently normalizing after the fact.
function redistribute(
  mix: Record<SalesChannel, number>,
  changed: SalesChannel,
  newValue: number
): Record<SalesChannel, number> {
  const clamped = Math.min(1, Math.max(0, newValue));
  const others = CHANNELS.filter((c) => c !== changed);
  const othersTotal = others.reduce((s, c) => s + mix[c], 0);
  const remainder = 1 - clamped;

  const next = { ...mix, [changed]: clamped } as Record<SalesChannel, number>;
  if (othersTotal <= 0) {
    others.forEach((c) => (next[c] = remainder / others.length));
  } else {
    others.forEach((c) => (next[c] = remainder * (mix[c] / othersTotal)));
  }
  return next;
}

export function ChannelMixSliders() {
  const salesChannelMix = useScenarioStore((s) => s.inputs.salesChannelMix);
  const setSalesChannelMix = useScenarioStore((s) => s.setSalesChannelMix);

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">Sales channel mix</p>
      {CHANNELS.map((channel) => {
        const pct = salesChannelMix[channel];
        return (
          <div key={channel}>
            <div className="flex items-baseline justify-between">
              <label htmlFor={`mix-${channel}`} className="text-xs text-foreground-soft">
                {channel}
              </label>
              <span className="font-mono text-xs tabular-nums">
                {Math.round(pct * 100)}%
              </span>
            </div>
            <input
              id={`mix-${channel}`}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={pct}
              onChange={(e) =>
                setSalesChannelMix(
                  redistribute(salesChannelMix, channel, Number(e.target.value))
                )
              }
              aria-valuetext={`${channel}: ${Math.round(pct * 100)} percent`}
              className="mt-1"
            />
          </div>
        );
      })}
    </div>
  );
}
