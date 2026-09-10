"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useScenario } from "@/lib/store";
import { dataset } from "@/lib/engine/dataset";
import { colors } from "@/lib/theme";
import { formatUnits } from "@/components/charts/format";

const COUNTRY_COLORS: Record<string, string> = {
  Netherlands: colors.accent,
  Denmark: colors.cfo,
  Sweden: colors.cmo,
};

// The one real sales history LUMEN has. Germany's estimate is a projection;
// this is the yardstick that says whether that projection is plausible.
export function HomeMarketBenchmark() {
  const { outputs } = useScenario();

  const byMonth = new Map<string, Record<string, number>>();
  for (const row of dataset.historicalSalesWeekly) {
    const month = row.weekStartDate.slice(0, 7);
    const entry = byMonth.get(month) ?? {};
    entry[row.country] = (entry[row.country] ?? 0) + row.unitsSold;
    byMonth.set(month, entry);
  }

  const data = [...byMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    // Drop partial first/last months so the shape isn't misleading.
    .slice(1, -1)
    .map(([month, counts]) => ({
      month,
      Netherlands: counts.Netherlands ?? 0,
      Denmark: counts.Denmark ?? 0,
      Sweden: counts.Sweden ?? 0,
      total:
        (counts.Netherlands ?? 0) + (counts.Denmark ?? 0) + (counts.Sweden ?? 0),
    }));

  const avgCombined =
    data.reduce((s, d) => s + d.total, 0) / Math.max(1, data.length);
  const ratio = avgCombined > 0 ? outputs.estimatedMonthlyUnits / avgCombined : 0;

  return (
    <div className="rounded-xl border border-line bg-surface card-shadow p-4">
      <p className="text-sm font-medium text-foreground">
        The only real sales history LUMEN has
      </p>
      <p className="mt-0.5 text-xs text-foreground-faint">
        78 weeks of actual units sold in the Netherlands, Denmark and Sweden —
        three markets with two to three years of brand building behind them.
        Germany has none of that, which is why this is the sanity check on any
        German projection.
      </p>

      <div
        className="mt-3 h-56"
        role="img"
        aria-label={`Combined home-market volume averages ${formatUnits(Math.round(avgCombined))} units per month. The current Germany estimate is ${formatUnits(outputs.estimatedMonthlyUnits)} units per month.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.line} strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke={colors.inkFaint} fontSize={10} />
            <YAxis
              tickFormatter={(v) => formatUnits(Number(v))}
              stroke={colors.inkFaint}
              fontSize={11}
              width={54}
            />
            <Tooltip formatter={(value) => formatUnits(Number(value))} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              y={outputs.estimatedMonthlyUnits}
              stroke={colors.ink}
              strokeDasharray="5 4"
              label={{
                value: "Germany estimate",
                position: "insideTopRight",
                fontSize: 10,
                fill: colors.ink,
              }}
            />
            {(["Netherlands", "Denmark", "Sweden"] as const).map((country) => (
              <Area
                key={country}
                type="monotone"
                dataKey={country}
                stackId="1"
                stroke={COUNTRY_COLORS[country]}
                fill={COUNTRY_COLORS[country]}
                fillOpacity={0.5}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-foreground-soft">
        <strong className="text-foreground">
          Your Germany estimate is {ratio.toFixed(1)}× LUMEN&apos;s entire current
          combined volume
        </strong>{" "}
        ({formatUnits(outputs.estimatedMonthlyUnits)} vs{" "}
        {formatUnits(Math.round(avgCombined))} units/month across all three home
        markets).{" "}
        {ratio > 3
          ? "That is a very aggressive year-one claim for a market with no brand presence — worth lowering the market-share assumption before anyone builds a plan on it."
          : ratio > 1.5
          ? "Ambitious but arguable: Germany is roughly four times the size of the three home markets combined, so out-performing them is possible — it just has to be earned, not assumed."
          : "That sits within the range a first-year entry can plausibly deliver, given Germany is several times larger than the three home markets combined."}
      </div>
    </div>
  );
}
