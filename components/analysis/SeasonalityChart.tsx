"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useScenario, useScenarioStore } from "@/lib/store";
import { dataset } from "@/lib/engine/dataset";
import { recommendLaunchMonth } from "@/lib/recommendationEngine";
import { colors } from "@/lib/theme";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function SeasonalityChart() {
  const { inputs } = useScenario();
  const setLaunchMonth = useScenarioStore((s) => s.setLaunchMonth);
  const recommended = recommendLaunchMonth();

  const promoByMonth = new Map<number, number>();
  for (const row of dataset.competitorPriceHistory) {
    if (!row.promoActive) continue;
    const m = Number(row.month.slice(5, 7));
    promoByMonth.set(m, (promoByMonth.get(m) ?? 0) + 1);
  }

  const data = dataset.seasonalityAndWeather.map((row) => ({
    month: MONTH_NAMES[row.month - 1],
    monthIndex: row.month,
    seasonality: row.seasonalityIndex,
    temperature: row.avgTempCelsius,
    promos: promoByMonth.get(row.month) ?? 0,
  }));

  return (
    <div className="rounded-xl border border-line bg-surface card-shadow p-4">
      <p className="text-sm font-medium text-foreground">
        When demand actually shows up
      </p>
      <p className="mt-0.5 text-xs text-foreground-faint">
        Monthly demand index (100 = year average) against average German
        temperature. Bars in amber are months where competitors ran promotions
        in the 12-month history — noisy months to launch into. Click a bar to
        set the launch month.
      </p>

      <div
        className="mt-3 h-60"
        role="img"
        aria-label={`Demand peaks mid-year. Recommended launch month: ${MONTH_NAMES[recommended.month - 1]}. Currently selected: ${MONTH_NAMES[inputs.launchMonth - 1]}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.line} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" stroke={colors.inkFaint} fontSize={11} />
            <YAxis yAxisId="idx" stroke={colors.inkFaint} fontSize={11} width={36} />
            <YAxis
              yAxisId="temp"
              orientation="right"
              tickFormatter={(v) => `${v}°`}
              stroke={colors.inkFaint}
              fontSize={11}
              width={36}
            />
            <Tooltip
              formatter={(value, name) =>
                name === "temperature"
                  ? [`${value}°C`, "Avg temperature"]
                  : name === "seasonality"
                  ? [`${value}`, "Demand index"]
                  : [`${value}`, "Competitor promos"]
              }
            />
            <Bar yAxisId="idx" dataKey="seasonality" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.month}
                  fill={
                    d.monthIndex === inputs.launchMonth
                      ? colors.accent
                      : d.promos > 0
                      ? colors.cmo
                      : `${colors.accent}55`
                  }
                  cursor="pointer"
                  onClick={() => setLaunchMonth(d.monthIndex)}
                />
              ))}
            </Bar>
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke={colors.cfo}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-lg bg-accent-soft p-3 text-xs text-foreground">
        <strong>Recommended: {MONTH_NAMES[recommended.month - 1]}.</strong>{" "}
        {recommended.rationale}
        {inputs.launchMonth !== recommended.month && (
          <>
            {" "}You currently have {MONTH_NAMES[inputs.launchMonth - 1]} selected
            (demand index{" "}
            {data.find((d) => d.monthIndex === inputs.launchMonth)?.seasonality}).
          </>
        )}
      </div>
    </div>
  );
}
