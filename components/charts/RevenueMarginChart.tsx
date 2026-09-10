"use client";

import {
  AreaChart,
  Area,
  LineChart,
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
import {
  ChartLegend,
  ChartTooltip,
  LegendKey,
  cursorLine,
  gridProps,
  lineSeriesProps,
  refLabel,
  xAxisProps,
  yAxisProps,
} from "./chartKit";

const PRICE_MIN = 1.29;
const PRICE_MAX = 3.29;
const TESTED_MIN = 1.79;
const TESTED_MAX = 2.59;
const STEPS = 21;
const PRICE_TICKS = [1.29, 1.79, 2.29, 2.79, 3.29];
const Y_AXIS_WIDTH = 64;

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

const UNTESTED = [
  { x1: PRICE_MIN, x2: TESTED_MIN },
  { x1: TESTED_MAX, x2: PRICE_MAX },
];

const priceLabel = (v: string | number) => `€${Number(v).toFixed(2)}`;

// Two measures on two scales get two charts, not two y-axes: revenue on
// top, margin below, sharing one price axis and one synced crosshair.
export function RevenueMarginChart() {
  const { inputs } = useScenario();
  const data = buildRevenueMarginSweep(inputs);
  const current = Math.round(inputs.priceEur * 100) / 100;

  return (
    <div className="card p-5">
      <h3 className="card-title">Revenue &amp; margin across the price range</h3>
      <p className="card-subtitle">
        Sweeps price at the current channel mix. The gray bands lie outside
        the €1.79–€2.59 range LUMEN tested, so the curves there are
        extrapolated.
      </p>

      <div
        className="mt-4"
        role="img"
        aria-label={`Monthly revenue ranges from ${formatEuro(
          Math.min(...data.map((d) => d.revenueEur))
        )} to ${formatEuro(
          Math.max(...data.map((d) => d.revenueEur))
        )} across the tested price range; contribution margin rises with price.`}
      >
        <p className="flex items-center gap-1.5 text-xs font-medium text-foreground-soft">
          <LegendKey color={colors.accent} shape="line" />
          Monthly revenue
        </p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              syncId="price-sweep"
              margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="priceEur"
                type="number"
                domain={[PRICE_MIN, PRICE_MAX]}
                ticks={PRICE_TICKS}
                hide
              />
              <YAxis
                {...yAxisProps}
                tickFormatter={(v) => formatEuro(v)}
                width={Y_AXIS_WIDTH}
              />
              {UNTESTED.map((band) => (
                <ReferenceArea
                  zIndex={-50}
                  key={band.x1}
                  x1={band.x1}
                  x2={band.x2}
                  fill={colors.wash}
                  fillOpacity={1}
                />
              ))}
              <Tooltip
                cursor={cursorLine}
                isAnimationActive={false}
                content={(p) => (
                  <ChartTooltip
                    active={p.active}
                    payload={p.payload}
                    label={p.label}
                    labelFormatter={priceLabel}
                    valueFormatter={(v) => [formatEuro(Number(v)), "Revenue"]}
                  />
                )}
              />
              <Area
                {...lineSeriesProps}
                type="monotone"
                dataKey="revenueEur"
                stroke={colors.accent}
                fill={colors.accent}
                fillOpacity={0.1}
              />
              <ReferenceLine
                x={current}
                stroke={colors.ink}
                strokeWidth={1.5}
                label={refLabel(priceLabel(current))}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-foreground-soft">
          <LegendKey color={colors.cfo} shape="line" />
          Contribution margin
        </p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              syncId="price-sweep"
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid {...gridProps} />
              <XAxis
                {...xAxisProps}
                dataKey="priceEur"
                type="number"
                domain={[PRICE_MIN, PRICE_MAX]}
                ticks={PRICE_TICKS}
                tickFormatter={priceLabel}
              />
              <YAxis
                {...yAxisProps}
                tickFormatter={(v) => `${v}%`}
                width={Y_AXIS_WIDTH}
                domain={["auto", "auto"]}
              />
              {UNTESTED.map((band) => (
                <ReferenceArea
                  zIndex={-50}
                  key={band.x1}
                  x1={band.x1}
                  x2={band.x2}
                  fill={colors.wash}
                  fillOpacity={1}
                />
              ))}
              <Tooltip
                cursor={cursorLine}
                isAnimationActive={false}
                content={(p) => (
                  <ChartTooltip
                    active={p.active}
                    payload={p.payload}
                    label={p.label}
                    labelFormatter={priceLabel}
                    valueFormatter={(v) => [formatPct(Number(v)), "Contribution margin"]}
                  />
                )}
              />
              <Line
                {...lineSeriesProps}
                type="monotone"
                dataKey="marginPct"
                stroke={colors.cfo}
              />
              <ReferenceLine x={current} stroke={colors.ink} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ChartLegend
        items={[
          { label: "Current price", color: colors.ink, shape: "line" },
          { label: "Extrapolated (untested)", color: colors.fill, shape: "rect" },
        ]}
      />
    </div>
  );
}
