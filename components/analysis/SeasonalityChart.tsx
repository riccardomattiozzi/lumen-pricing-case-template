"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useScenario, useScenarioStore } from "@/lib/store";
import { dataset } from "@/lib/engine/dataset";
import { recommendLaunchMonth } from "@/lib/recommendationEngine";
import { colors } from "@/lib/theme";
import {
  ChartLegend,
  ChartTooltip,
  LegendKey,
  cursorBand,
  cursorLine,
  gridProps,
  lineSeriesProps,
  xAxisProps,
  yAxisProps,
} from "@/components/charts/chartKit";
import { CheckIcon } from "@/components/ui/icons";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const Y_AXIS_WIDTH = 40;

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

  // Emphasis: the selected month in the tint, promo months flagged, the
  // rest recede to gray.
  const barColor = (d: (typeof data)[number]) =>
    d.monthIndex === inputs.launchMonth
      ? colors.accent
      : d.promos > 0
      ? colors.cmo
      : colors.neutral;

  return (
    <div className="card p-5">
      <h3 className="card-title">When demand actually shows up</h3>
      <p className="card-subtitle">
        Monthly demand index (100 = year average), with average German
        temperature underneath. Months where competitors ran promotions in
        the 12-month history are flagged — noisy months to launch into. Click
        a bar to set the launch month.
      </p>

      <div
        className="mt-4"
        role="img"
        aria-label={`Demand peaks mid-year. Recommended launch month: ${MONTH_NAMES[recommended.month - 1]}. Currently selected: ${MONTH_NAMES[inputs.launchMonth - 1]}.`}
      >
        <p className="text-xs font-medium text-foreground-soft">Demand index</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} syncId="season" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" hide />
              <YAxis {...yAxisProps} width={Y_AXIS_WIDTH} />
              <ReferenceLine y={100} stroke={colors.line} />
              <Tooltip
                cursor={cursorBand}
                isAnimationActive={false}
                content={(p) => (
                  <ChartTooltip
                    active={p.active}
                    payload={p.payload}
                    label={p.label}
                    valueFormatter={(v, e) => {
                      const promos = Number(e.payload?.promos ?? 0);
                      return [
                        String(v),
                        promos > 0
                          ? `demand index · ${promos} competitor promo${promos > 1 ? "s" : ""}`
                          : "demand index",
                      ];
                    }}
                    colorOf={(e) => barColor(e.payload)}
                  />
                )}
              />
              <Bar
                dataKey="seasonality"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
                isAnimationActive={false}
              >
                {data.map((d) => (
                  <Cell
                    key={d.month}
                    fill={barColor(d)}
                    cursor="pointer"
                    onClick={() => setLaunchMonth(d.monthIndex)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-foreground-soft">
          <LegendKey color={colors.cfo} shape="line" />
          Average temperature
        </p>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} syncId="season" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              {/* Band scale, like the bars above, so each temperature point
                  sits exactly under its month's bar. */}
              <XAxis {...xAxisProps} dataKey="month" interval={0} scale="band" />
              <YAxis
                {...yAxisProps}
                width={Y_AXIS_WIDTH}
                tickFormatter={(v) => `${v}°`}
                tickCount={3}
              />
              <Tooltip
                cursor={cursorLine}
                isAnimationActive={false}
                content={(p) => (
                  <ChartTooltip
                    active={p.active}
                    payload={p.payload}
                    label={p.label}
                    valueFormatter={(v) => [`${v}°C`, "avg temperature"]}
                  />
                )}
              />
              <Line
                {...lineSeriesProps}
                type="monotone"
                dataKey="temperature"
                stroke={colors.cfo}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ChartLegend
        items={[
          { label: "Selected launch month", color: colors.accent },
          { label: "Competitor promo month", color: colors.cmo },
          { label: "Other months", color: colors.neutral },
        ]}
      />

      <div className="callout callout-positive mt-4 flex gap-2">
        <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-accent-ink" />
        <span>
          <strong>Recommended: {MONTH_NAMES[recommended.month - 1]}.</strong>{" "}
          {recommended.rationale}
          {inputs.launchMonth !== recommended.month && (
            <>
              {" "}You currently have {MONTH_NAMES[inputs.launchMonth - 1]} selected
              (demand index{" "}
              {data.find((d) => d.monthIndex === inputs.launchMonth)?.seasonality}).
            </>
          )}
        </span>
      </div>
    </div>
  );
}
