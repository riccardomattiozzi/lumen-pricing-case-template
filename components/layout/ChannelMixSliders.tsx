"use client";

import { useScenarioStore } from "@/lib/store";
import { CHANNEL_COLORS } from "@/lib/theme";
import { rangeStyle } from "@/components/ui/range";
import { InfoTip } from "@/components/ui/InfoTip";
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
    <section className="p-5" aria-labelledby="mix-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="mix-heading" className="flex items-center gap-1 eyebrow">
          Sales channel mix
          <InfoTip label="Sales channel mix">
            How Year-1 sales split across DTC Online, Retail/Grocery and
            Gym &amp; Office. Each channel carries a different margin and
            brand weight, so this mix drives both the CFO and CMO scores —
            the three shares always add up to 100%.
          </InfoTip>
        </h2>
        <span className="text-2xs text-foreground-faint">Always totals 100%</span>
      </div>

      {/* The whole mix at a glance; each segment wears its slider's color. */}
      <div aria-hidden className="mt-3 flex h-2 gap-[2px] overflow-hidden rounded-full">
        {CHANNELS.filter((c) => salesChannelMix[c] > 0.001).map((channel) => (
          <span
            key={channel}
            className="h-full"
            style={{
              flexGrow: salesChannelMix[channel],
              flexBasis: 0,
              backgroundColor: CHANNEL_COLORS[channel],
            }}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {CHANNELS.map((channel) => {
          const pct = salesChannelMix[channel];
          return (
            <div key={channel}>
              <div className="flex items-baseline justify-between gap-3">
                <label
                  htmlFor={`mix-${channel}`}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CHANNEL_COLORS[channel] }}
                  />
                  {channel}
                </label>
                <span className="text-sm font-semibold tabular-nums text-foreground">
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
                style={rangeStyle(pct, 0, 1, CHANNEL_COLORS[channel])}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
