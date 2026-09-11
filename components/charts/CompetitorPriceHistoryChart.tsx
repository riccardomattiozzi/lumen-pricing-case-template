"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dataset, COMPETITORS } from "@/lib/engine/dataset";
import { colors } from "@/lib/theme";
import { formatEuro, formatMonth } from "./format";
import {
  ChartLegend,
  ChartTooltip,
  cursorLine,
  gridProps,
  lineSeriesProps,
  xAxisProps,
  yAxisProps,
} from "./chartKit";
import type { LumenDataset } from "@/lib/engine/dataset";
import type { Competitor } from "@/lib/types";

const LINE_COLORS: Record<Competitor, string> = {
  PulsUp: colors.cfo,
  "Mate Libre": colors.accent,
  VoltFit: colors.cmo,
  "Root & Rise": colors.series4,
};

// Pivots 12 months of competitor_price_history.csv into one row per month,
// one column per competitor's shelf price — the actual price paid after
// any active promo, not the list price.
export function buildPromoTimelineSeries(ds: LumenDataset = dataset) {
  const months = [...new Set(ds.competitorPriceHistory.map((r) => r.month))].sort();
  return months.map((month) => {
    const row: Record<string, string | number> = { month: month.slice(0, 7) };
    for (const competitor of COMPETITORS) {
      const entry = ds.competitorPriceHistory.find(
        (r) => r.month === month && r.competitor === competitor
      );
      if (entry) row[competitor] = entry.shelfPriceEur;
    }
    return row;
  });
}

export function CompetitorPriceHistoryChart() {
  const data = buildPromoTimelineSeries();
  // Legend reads top to bottom in the order the lines finish on the right,
  // so each key sits level with its line. Colors still follow the brand,
  // not the rank.
  const last = data[data.length - 1] ?? {};
  const legendOrder = [...COMPETITORS].sort(
    (a, b) => Number(last[b] ?? 0) - Number(last[a] ?? 0)
  );

  return (
    <div className="card p-5">
      <h3 className="card-title">12 months of competitor shelf pricing</h3>
      <p className="card-subtitle">
        Actual shelf price (after promos), not list price — dips are promo
        activity, useful for reading launch timing.
      </p>
      <ChartLegend
        className="mt-4"
        items={legendOrder.map((c) => ({ label: c, color: LINE_COLORS[c], shape: "line" as const }))}
      />
      <div
        className="mt-3 h-64"
        role="img"
        aria-label="Line chart of 12 months of shelf price history for PulsUp, Mate Libre, VoltFit and Root & Rise."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis
              {...xAxisProps}
              dataKey="month"
              tickFormatter={(v) => formatMonth(String(v))}
              minTickGap={12}
            />
            <YAxis
              {...yAxisProps}
              tickFormatter={(v) => `€${v.toFixed(2)}`}
              width={48}
              domain={["auto", "auto"]}
            />
            <Tooltip
              cursor={cursorLine}
              isAnimationActive={false}
              content={(p) => (
                <ChartTooltip
                  active={p.active}
                  payload={p.payload}
                  label={p.label}
                  labelFormatter={(l) => formatMonth(String(l), "long")}
                  valueFormatter={(v, e) => [formatEuro(Number(v), 2), String(e.name)]}
                />
              )}
            />
            {COMPETITORS.map((competitor) => (
              <Line
                key={competitor}
                {...lineSeriesProps}
                type="monotone"
                dataKey={competitor}
                stroke={LINE_COLORS[competitor]}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
