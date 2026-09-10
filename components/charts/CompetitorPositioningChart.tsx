"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useScenario } from "@/lib/store";
import { dataset, COMPETITORS } from "@/lib/engine/dataset";
import { colors } from "@/lib/theme";
import { formatEuro } from "./format";
import type { LumenDataset } from "@/lib/engine/dataset";

// Real price bands (min-max across every channel/format LUMEN's data room
// has for that competitor) — never invented, always derived from
// data/competitor_prices_by_channel.csv.
export function buildPositioningSeries(ds: LumenDataset = dataset) {
  return COMPETITORS.map((competitor) => {
    const rows = ds.competitorPricesByChannel.filter(
      (r) => r.competitor === competitor
    );
    const prices = rows.map((r) => r.priceEur);
    return {
      competitor,
      positioning: rows[0]?.positioning ?? "",
      range: [Math.min(...prices), Math.max(...prices)] as [number, number],
    };
  });
}

export function CompetitorPositioningChart() {
  const { inputs } = useScenario();
  const data = buildPositioningSeries();
  const maxDomain = Math.max(3.29, ...data.map((d) => d.range[1])) + 0.2;

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm font-medium text-foreground">
        LUMEN vs. competitor price bands
      </p>
      <p className="text-xs text-foreground-faint">
        Real price ranges across channel/format from the data room, current
        LUMEN price marked in green.
      </p>
      <div
        className="mt-3 h-56"
        role="img"
        aria-label={`LUMEN priced at ${formatEuro(inputs.priceEur, 2)}. ${data
          .map(
            (d) =>
              `${d.competitor} (${d.positioning}): ${formatEuro(d.range[0], 2)}–${formatEuro(d.range[1], 2)}`
          )
          .join("; ")}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid stroke={colors.line} strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, maxDomain]}
              tickFormatter={(v) => `€${v.toFixed(1)}`}
              stroke={colors.inkFaint}
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="competitor"
              stroke={colors.inkFaint}
              fontSize={11}
              width={80}
            />
            <Tooltip
              formatter={(value) => {
                const [min, max] = value as unknown as [number, number];
                return [`${formatEuro(min, 2)}–${formatEuro(max, 2)}`, "Price range"];
              }}
            />
            <ReferenceLine
              x={inputs.priceEur}
              stroke={colors.accent}
              strokeWidth={2}
              label={{ value: "LUMEN", position: "top", fontSize: 10, fill: colors.accent }}
            />
            <Bar dataKey="range" fill={colors.cfoSoft} stroke={colors.cfo} radius={4} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
