"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useScenario } from "@/lib/store";
import { dataset } from "@/lib/engine/dataset";
import { colors } from "@/lib/theme";
import { formatMonth, formatUnits } from "@/components/charts/format";
import {
  ChartLegend,
  ChartTooltip,
  cursorLine,
  gridProps,
  refLabel,
  xAxisProps,
  yAxisProps,
} from "@/components/charts/chartKit";

const COUNTRIES = ["Netherlands", "Denmark", "Sweden"] as const;

const COUNTRY_COLORS: Record<(typeof COUNTRIES)[number], string> = {
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
    <div className="card p-5">
      <h3 className="card-title">The only real sales history LUMEN has</h3>
      <p className="card-subtitle">
        78 weeks of actual units sold in the Netherlands, Denmark and Sweden —
        three markets with two to three years of brand building behind them.
        Germany has none of that, which is why this is the sanity check on any
        German projection.
      </p>

      <ChartLegend
        className="mt-4"
        items={[
          ...COUNTRIES.map((c) => ({ label: c, color: COUNTRY_COLORS[c] })),
          { label: "Germany estimate", color: colors.ink, shape: "dashed" as const },
        ]}
      />
      <div
        className="mt-3 h-56"
        role="img"
        aria-label={`Combined home-market volume averages ${formatUnits(Math.round(avgCombined))} units per month. The current Germany estimate is ${formatUnits(outputs.estimatedMonthlyUnits)} units per month.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis
              {...xAxisProps}
              dataKey="month"
              tickFormatter={(v) => formatMonth(String(v))}
              minTickGap={16}
            />
            <YAxis
              {...yAxisProps}
              tickFormatter={(v) => formatUnits(Number(v))}
              width={56}
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
                  valueFormatter={(v, e) => [formatUnits(Number(v)), String(e.name)]}
                />
              )}
            />
            {COUNTRIES.map((country) => (
              <Area
                key={country}
                type="monotone"
                dataKey={country}
                stackId="1"
                stroke={COUNTRY_COLORS[country]}
                strokeWidth={1.5}
                fill={COUNTRY_COLORS[country]}
                fillOpacity={0.3}
                activeDot={{ r: 3.5, strokeWidth: 2, stroke: colors.surface }}
                isAnimationActive={false}
              />
            ))}
            <ReferenceLine
              y={outputs.estimatedMonthlyUnits}
              stroke={colors.ink}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              label={refLabel("Germany estimate", "insideTopRight")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="callout mt-4">
        <strong>
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
