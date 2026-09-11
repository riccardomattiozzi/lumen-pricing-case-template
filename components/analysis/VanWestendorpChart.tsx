"use client";

import {
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
import { computeVanWestendorp } from "@/lib/analysis/vanWestendorp";
import { colors } from "@/lib/theme";
import {
  ChartLegend,
  ChartTooltip,
  cursorLine,
  gridProps,
  lineSeriesProps,
  refLabel,
  xAxisProps,
  yAxisProps,
} from "@/components/charts/chartKit";
import { CheckIcon, WarningIcon } from "@/components/ui/icons";

// Hue says which side of the question a curve answers (blue = "cheap",
// orange = "expensive"); the dash says it's the "too" version. That makes
// the classic crossings easy to find: dashed × dashed is the optimal price
// point, solid × solid the indifference point.
const CURVES = [
  { key: "Too cheap", color: colors.cfo, dashed: true },
  { key: "Cheap", color: colors.cfo, dashed: false },
  { key: "Expensive", color: colors.cmo, dashed: false },
  { key: "Too expensive", color: colors.cmo, dashed: true },
] as const;

export function VanWestendorpChart() {
  const { inputs } = useScenario();
  const vw = computeVanWestendorp();

  const data = vw.curve.map((p) => ({
    priceEur: p.priceEur,
    "Too cheap": Math.round(p.tooCheapPct * 10) / 10,
    Cheap: Math.round(p.cheapPct * 10) / 10,
    Expensive: Math.round(p.expensivePct * 10) / 10,
    "Too expensive": Math.round(p.tooExpensivePct * 10) / 10,
  }));

  const inRange =
    vw.acceptableRangeEur !== null &&
    inputs.priceEur >= vw.acceptableRangeEur[0] &&
    inputs.priceEur <= vw.acceptableRangeEur[1];

  const current = Math.round(inputs.priceEur * 100) / 100;

  // Ticks on round half-euros across whatever span the survey covers.
  const prices = data.map((d) => d.priceEur);
  const priceTicks: number[] = [];
  if (prices.length > 0) {
    for (let t = Math.ceil(Math.min(...prices) * 2) / 2; t <= Math.max(...prices); t += 0.5) {
      priceTicks.push(t);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="card-title">What German respondents said they&apos;d pay</h3>
        <p className="text-xs tabular-nums text-foreground-faint">
          Van Westendorp · n={vw.respondentCount}
        </p>
      </div>
      <p className="card-subtitle">
        Each of {vw.respondentCount} respondents gave four price thresholds.
        Where the curves cross gives the classic price points — computed here
        from the raw responses, not from the three pre-tested prices.
      </p>

      <ChartLegend
        className="mt-4"
        items={CURVES.map((c) => ({
          label: c.key,
          color: c.color,
          shape: c.dashed ? ("dashed" as const) : ("line" as const),
        }))}
      />
      <div
        className="mt-3 h-64"
        role="img"
        aria-label={`Van Westendorp price sensitivity. Optimal price point €${vw.optimalPriceEur}, acceptable range €${vw.acceptableRangeEur?.[0]} to €${vw.acceptableRangeEur?.[1]}. Current price €${inputs.priceEur.toFixed(2)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            {/* A numeric axis, so the reference lines land on any price —
                the curve is sampled in €0.05 steps, a slider price rarely is. */}
            <XAxis
              {...xAxisProps}
              dataKey="priceEur"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={priceTicks}
              tickFormatter={(v) => `€${Number(v).toFixed(2)}`}
              minTickGap={12}
            />
            <YAxis
              {...yAxisProps}
              tickFormatter={(v) => `${v}%`}
              width={46}
            />
            {vw.acceptableRangeEur && (
              <ReferenceArea
                zIndex={-50}
                x1={vw.acceptableRangeEur[0]}
                x2={vw.acceptableRangeEur[1]}
                fill={colors.accent}
                fillOpacity={0.1}
              />
            )}
            <Tooltip
              cursor={cursorLine}
              isAnimationActive={false}
              content={(p) => (
                <ChartTooltip
                  active={p.active}
                  payload={p.payload}
                  label={p.label}
                  labelFormatter={(l) => `€${Number(l).toFixed(2)}`}
                  valueFormatter={(v, e) => [`${Number(v).toFixed(1)}%`, String(e.name)]}
                />
              )}
            />
            {CURVES.map((c) => (
              <Line
                key={c.key}
                {...lineSeriesProps}
                type="monotone"
                dataKey={c.key}
                stroke={c.color}
                strokeDasharray={c.dashed ? "5 4" : undefined}
              />
            ))}
            {vw.optimalPriceEur !== null && (
              <ReferenceLine
                x={vw.optimalPriceEur}
                stroke={colors.inkFaint}
                strokeDasharray="2 3"
                label={refLabel("OPP", "insideTopLeft")}
              />
            )}
            <ReferenceLine
              x={current}
              stroke={colors.ink}
              strokeWidth={1.5}
              label={refLabel(`€${current.toFixed(2)}`)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        items={[
          { label: "Acceptable range", color: colors.accent, shape: "wash" },
          { label: "Optimal price point (OPP)", color: colors.inkFaint, shape: "dashed" },
          { label: "Your current price", color: colors.ink, shape: "line" },
        ]}
      />

      <div className="mt-4 grid grid-cols-2 gap-2 @2xl:grid-cols-4">
        {[
          { label: "Optimal price", value: vw.optimalPriceEur, hint: "fewest outright rejections" },
          { label: "Indifference", value: vw.indifferencePriceEur, hint: "cheap = expensive" },
          { label: "Range floor", value: vw.acceptableRangeEur?.[0] ?? null, hint: "below: quality doubts" },
          { label: "Range ceiling", value: vw.acceptableRangeEur?.[1] ?? null, hint: "above: resistance" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-surface-2 px-3 py-2.5">
            <p className="text-xs text-foreground-faint">{item.label}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {item.value !== null ? `€${item.value.toFixed(2)}` : "—"}
            </p>
            <p className="text-2xs text-foreground-faint">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className={`callout mt-4 flex gap-2 ${inRange ? "callout-positive" : "callout-warning"}`}>
        {inRange ? (
          <>
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-accent-ink" />
            <span>
              Your €{inputs.priceEur.toFixed(2)} sits inside the range respondents
              themselves called acceptable.
            </span>
          </>
        ) : (
          <>
            <WarningIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-warning" />
            <span>
              <strong>Worth arguing about:</strong> your €{inputs.priceEur.toFixed(2)} is
              above the €{vw.acceptableRangeEur?.[1].toFixed(2)} ceiling this survey
              implies. That isn&apos;t automatically wrong — stated willingness-to-pay
              skews low, and the profit-maximising price deliberately gives up the
              most price-sensitive segments — but it does mean the recommendation
              rests on margin per buyer, not on broad acceptance. Elena&apos;s case
              gets stronger the further right you go; Jonas&apos;s gets easier.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
