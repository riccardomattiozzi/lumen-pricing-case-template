"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { useScenario } from "@/lib/store";
import { computeVanWestendorp } from "@/lib/analysis/vanWestendorp";
import { colors } from "@/lib/theme";

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

  return (
    <div className="rounded-xl border border-line bg-surface card-shadow p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          What German respondents said they&apos;d pay
        </p>
        <p className="font-data text-[11px] text-foreground-faint">
          Van Westendorp · n={vw.respondentCount}
        </p>
      </div>
      <p className="mt-0.5 text-xs text-foreground-faint">
        Each of {vw.respondentCount} respondents gave four price thresholds.
        Where the curves cross gives the classic price points — computed here
        from the raw responses, not from the three pre-tested prices.
      </p>

      <div
        className="mt-3 h-64"
        role="img"
        aria-label={`Van Westendorp price sensitivity. Optimal price point €${vw.optimalPriceEur}, acceptable range €${vw.acceptableRangeEur?.[0]} to €${vw.acceptableRangeEur?.[1]}. Current price €${inputs.priceEur.toFixed(2)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.line} strokeDasharray="3 3" />
            <XAxis
              dataKey="priceEur"
              tickFormatter={(v) => `€${Number(v).toFixed(1)}`}
              stroke={colors.inkFaint}
              fontSize={11}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              stroke={colors.inkFaint}
              fontSize={11}
              width={40}
            />
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(1)}%`}
              labelFormatter={(v) => `€${Number(v).toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {vw.acceptableRangeEur && (
              <ReferenceArea
                x1={vw.acceptableRangeEur[0]}
                x2={vw.acceptableRangeEur[1]}
                fill={colors.accent}
                fillOpacity={0.08}
              />
            )}
            {vw.optimalPriceEur !== null && (
              <ReferenceLine
                x={vw.optimalPriceEur}
                stroke={colors.accent}
                strokeDasharray="4 3"
                label={{ value: "OPP", position: "top", fontSize: 10, fill: colors.accent }}
              />
            )}
            <ReferenceLine
              x={Math.round(inputs.priceEur * 100) / 100}
              stroke={colors.cmo}
              strokeWidth={2}
              label={{ value: "yours", position: "top", fontSize: 10, fill: colors.cmo }}
            />
            <Line type="monotone" dataKey="Too cheap" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Cheap" stroke={colors.cfo} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Expensive" stroke={colors.cmo} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Too expensive" stroke="#b91c1c" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Optimal price", value: vw.optimalPriceEur, hint: "fewest outright rejections" },
          { label: "Indifference", value: vw.indifferencePriceEur, hint: "cheap = expensive" },
          { label: "Range floor", value: vw.acceptableRangeEur?.[0] ?? null, hint: "below: quality doubts" },
          { label: "Range ceiling", value: vw.acceptableRangeEur?.[1] ?? null, hint: "above: resistance" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-surface-2 p-2.5">
            <p className="text-[11px] text-foreground-faint">{item.label}</p>
            <p className="font-data text-sm font-semibold text-foreground">
              {item.value !== null ? `€${item.value.toFixed(2)}` : "—"}
            </p>
            <p className="text-[10px] text-foreground-faint">{item.hint}</p>
          </div>
        ))}
      </div>

      <div
        className={`mt-3 rounded-lg p-3 text-xs ${
          inRange ? "bg-accent-soft text-foreground" : "bg-cmo-soft text-foreground"
        }`}
      >
        {inRange ? (
          <>
            Your €{inputs.priceEur.toFixed(2)} sits inside the range respondents
            themselves called acceptable.
          </>
        ) : (
          <>
            <strong>Worth arguing about:</strong> your €{inputs.priceEur.toFixed(2)} is
            above the €{vw.acceptableRangeEur?.[1].toFixed(2)} ceiling this survey
            implies. That isn&apos;t automatically wrong — stated willingness-to-pay
            skews low, and the profit-maximising price deliberately gives up the
            most price-sensitive segments — but it does mean the recommendation
            rests on margin per buyer, not on broad acceptance. Elena&apos;s case
            gets stronger the further right you go; Jonas&apos;s gets easier.
          </>
        )}
      </div>
    </div>
  );
}
