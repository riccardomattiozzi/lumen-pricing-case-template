"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { useScenario } from "@/lib/store";
import { computeScenario } from "@/lib/engine/pricingEngine";
import { colors } from "@/lib/theme";
import { formatEuro, formatPct } from "./format";

const PRICE_MIN = 1.29;
const PRICE_MAX = 3.29;
const STEPS = 21;

// Sweeps price across the full slider range at the CURRENT channel mix,
// calling the real engine at each step — never re-derives the math here.
export function buildRevenueMarginSweep(
  inputs: Parameters<typeof computeScenario>[0]
) {
  const points = [];
  for (let i = 0; i < STEPS; i++) {
    const priceEur =
      PRICE_MIN + ((PRICE_MAX - PRICE_MIN) * i) / (STEPS - 1);
    const outputs = computeScenario({ ...inputs, priceEur });
    points.push({
      priceEur: Math.round(priceEur * 100) / 100,
      revenueEur: outputs.estimatedMonthlyRevenueEur,
      marginPct: outputs.contributionMarginPct,
      extrapolated: outputs.extrapolated,
    });
  }
  return points;
}

export function RevenueMarginChart() {
  const { inputs } = useScenario();
  const data = buildRevenueMarginSweep(inputs);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm font-medium text-foreground">
        Revenue &amp; margin across the price range
      </p>
      <p className="text-xs text-foreground-faint">
        Sweeps price at the current channel mix — dashed where extrapolated
        beyond the €1.79–€2.59 tested range.
      </p>
      <div
        className="mt-3 h-64"
        role="img"
        aria-label={`Monthly revenue ranges from ${formatEuro(
          Math.min(...data.map((d) => d.revenueEur))
        )} to ${formatEuro(
          Math.max(...data.map((d) => d.revenueEur))
        )} across the tested price range; contribution margin rises with price.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.line} strokeDasharray="3 3" />
            <XAxis
              dataKey="priceEur"
              tickFormatter={(v) => `€${v.toFixed(2)}`}
              stroke={colors.inkFaint}
              fontSize={11}
            />
            <YAxis
              yAxisId="revenue"
              tickFormatter={(v) => formatEuro(v)}
              stroke={colors.inkFaint}
              fontSize={11}
              width={64}
            />
            <YAxis
              yAxisId="margin"
              orientation="right"
              tickFormatter={(v) => `${v}%`}
              stroke={colors.inkFaint}
              fontSize={11}
              width={40}
            />
            <Tooltip
              formatter={(value, name) =>
                name === "revenueEur"
                  ? [formatEuro(Number(value)), "Revenue"]
                  : [formatPct(Number(value)), "Contribution margin"]
              }
              labelFormatter={(v) => `€${Number(v).toFixed(2)}`}
            />
            <ReferenceArea
              yAxisId="revenue"
              x1={PRICE_MIN}
              x2={1.79}
              fill={colors.cmoSoft}
              fillOpacity={0.5}
            />
            <ReferenceArea
              yAxisId="revenue"
              x1={2.59}
              x2={PRICE_MAX}
              fill={colors.cmoSoft}
              fillOpacity={0.5}
            />
            <ReferenceLine
              x={Math.round(inputs.priceEur * 100) / 100}
              yAxisId="revenue"
              stroke={colors.accent}
              strokeWidth={2}
              label={{ value: "current", position: "top", fontSize: 10, fill: colors.accent }}
            />
            <Area
              yAxisId="revenue"
              dataKey="revenueEur"
              stroke={colors.accent}
              fill={colors.accentSoft}
              strokeWidth={2}
            />
            <Line
              yAxisId="margin"
              dataKey="marginPct"
              stroke={colors.cmo}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-foreground-faint">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: colors.accent }} />
          Revenue
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: colors.cmo }} />
          Contribution margin %
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: colors.cmoSoft, border: `1px solid ${colors.cmo}` }} />
          Extrapolated (untested)
        </span>
      </div>
    </div>
  );
}
