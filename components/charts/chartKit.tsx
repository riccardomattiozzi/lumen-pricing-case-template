"use client";

import type { TooltipPayloadEntry } from "recharts";
import { colors } from "@/lib/theme";

// Shared chart chrome, so every chart reads as one system: quiet solid
// hairline grid, no tick marks, 11px muted tick labels, 2px round-capped
// lines, a surface ring on the hover dot. Charts track the sliders 1:1, so
// series animation is off — a 1.5 s tween restarting on every drag step
// would put lag between the hand and the data.

const tick = { fill: colors.inkFaint, fontSize: 11 };

export const xAxisProps = {
  tickLine: false,
  axisLine: { stroke: colors.line },
  tick,
  tickMargin: 8,
} as const;

export const yAxisProps = {
  tickLine: false,
  axisLine: false,
  tick,
  tickMargin: 6,
} as const;

export const gridProps = {
  stroke: colors.grid,
  vertical: false,
} as const;

export const lineSeriesProps = {
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  dot: false,
  activeDot: { r: 4, strokeWidth: 2, stroke: colors.surface },
  isAnimationActive: false,
} as const;

export const cursorLine = { stroke: colors.inkFaint, strokeWidth: 1 };
export const cursorBand = { fill: "var(--fill)" };

// Reference-line labels are text, so they wear ink, never the series color,
// with a halo in the card color so they stay legible where they cross data.
export function refLabel(value: string, position: "top" | "insideTopRight" | "insideTopLeft" = "top") {
  return {
    value,
    position,
    fontSize: 11,
    fontWeight: 600,
    fill: colors.inkSoft,
    stroke: colors.surface,
    strokeWidth: 3,
    paintOrder: "stroke",
  };
}

type Formatted = [value: string, name: string];

// A floating material rather than a bordered box. Values lead (strong),
// series names follow (secondary), each keyed by a short stroke of its color.
export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  colorOf,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipPayloadEntry>;
  label?: string | number;
  labelFormatter?: (label: string | number) => string;
  valueFormatter?: (value: unknown, entry: TooltipPayloadEntry) => Formatted;
  colorOf?: (entry: TooltipPayloadEntry) => string | undefined;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      {label !== undefined && label !== "" && (
        <p className="mb-1 font-semibold text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry, i) => {
          const [value, name] = valueFormatter
            ? valueFormatter(entry.value, entry)
            : [String(entry.value ?? ""), String(entry.name ?? "")];
          const color = colorOf?.(entry) ?? entry.color ?? entry.stroke ?? entry.fill;
          return (
            <li key={`${name}-${i}`} className="flex items-center gap-2 whitespace-nowrap">
              <span
                aria-hidden
                className="h-[3px] w-3 flex-none rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="font-semibold tabular-nums text-foreground">{value}</span>
              <span className="text-foreground-faint">{name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export type LegendShape = "line" | "dashed" | "rect" | "wash";

export function LegendKey({ color, shape = "rect" }: { color: string; shape?: LegendShape }) {
  if (shape === "line" || shape === "dashed") {
    return (
      <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden className="flex-none">
        <line
          x1="1.5"
          y1="4"
          x2="14.5"
          y2="4"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={shape === "dashed" ? "3 3" : undefined}
        />
      </svg>
    );
  }
  return (
    <span
      aria-hidden
      className="h-2.5 w-2.5 flex-none rounded-[3px]"
      style={{ backgroundColor: color, opacity: shape === "wash" ? 0.5 : 1 }}
    />
  );
}

// Legend rows mirror the marks (a stroke for lines, a swatch for fills);
// the text itself stays in ink.
export function ChartLegend({
  items,
  className = "mt-3",
}: {
  items: { label: string; color: string; shape?: LegendShape }[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground-soft ${className}`}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <LegendKey color={item.color} shape={item.shape} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
