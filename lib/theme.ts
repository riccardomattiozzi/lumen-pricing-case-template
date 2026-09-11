import type { PresetName, SalesChannel } from "@/lib/types";

// Chart and inline-style colors, as references to the CSS custom properties
// declared in app/globals.css — which is the only place a hex value lives.
//
// Recharts writes these strings straight into SVG fill/stroke attributes,
// and SVG resolves var() there like any other CSS value, so every chart
// follows the page into dark mode with no second palette to keep in sync.
// The one thing a var() string can't do is string surgery (appending a hex
// alpha, say): use fillOpacity / opacity or color-mix() instead.

export const colors = {
  ink: "var(--foreground)",
  inkSoft: "var(--foreground-soft)",
  inkFaint: "var(--foreground-faint)",
  line: "var(--line)",
  grid: "var(--chart-grid)",
  surface: "var(--surface)",
  fill: "var(--fill-strong)",
  wash: "var(--fill)",
  accent: "var(--accent)",
  accentSoft: "var(--accent-soft)",
  // Scenario identity — the same hue on the preset control, the score bars
  // and every chart series that stands for that side of the trade-off.
  cfo: "var(--cfo)",
  cmo: "var(--cmo)",
  compromise: "var(--accent)",
  series4: "var(--chart-4)",
  neutral: "var(--chart-neutral)",
  warning: "var(--warning)",
  danger: "var(--danger)",
} as const;

export const PRESET_COLORS: Record<PresetName, string> = {
  CFO: colors.cfo,
  CMO: colors.cmo,
  Compromise: colors.compromise,
};

// One channel, one color, everywhere it appears: the mix sliders, the
// volume and contribution bars, and the unit-economics waterfall.
export const CHANNEL_COLORS: Record<SalesChannel, string> = {
  "DTC Online": colors.accent,
  "Retail/Grocery": colors.cfo,
  "Gym & Office": colors.cmo,
};
