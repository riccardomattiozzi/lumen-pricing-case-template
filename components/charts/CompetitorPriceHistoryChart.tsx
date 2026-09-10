"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { dataset, COMPETITORS } from "@/lib/engine/dataset";
import { colors } from "@/lib/theme";
import { formatEuro } from "./format";
import type { LumenDataset } from "@/lib/engine/dataset";
import type { Competitor } from "@/lib/types";

const LINE_COLORS: Record<Competitor, string> = {
  PulsUp: colors.cfo,
  "Mate Libre": colors.accent,
  VoltFit: colors.cmo,
  "Root & Rise": "#7C3AED",
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

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm font-medium text-foreground">
        12 months of competitor shelf pricing
      </p>
      <p className="text-xs text-foreground-faint">
        Actual shelf price (after promos), not list price — dips are promo
        activity, useful for reading launch timing.
      </p>
      <div
        className="mt-3 h-64"
        role="img"
        aria-label="Line chart of 12 months of shelf price history for PulsUp, Mate Libre, VoltFit and Root & Rise."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.line} strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke={colors.inkFaint} fontSize={10} />
            <YAxis
              tickFormatter={(v) => `€${v.toFixed(1)}`}
              stroke={colors.inkFaint}
              fontSize={11}
              width={44}
            />
            <Tooltip formatter={(value) => formatEuro(Number(value), 2)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {COMPETITORS.map((competitor) => (
              <Line
                key={competitor}
                type="monotone"
                dataKey={competitor}
                stroke={LINE_COLORS[competitor]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
