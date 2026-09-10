"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { useScenario } from "@/lib/store";
import { CHANNEL_COLORS, colors } from "@/lib/theme";
import { formatUnits } from "./format";
import { ChartTooltip, cursorBand, xAxisProps } from "./chartKit";
import type { SalesChannel } from "@/lib/types";

export function VolumeChart() {
  const { outputs } = useScenario();

  const data = (Object.keys(outputs.byChannel) as SalesChannel[]).map(
    (channel) => ({
      channel,
      units: Math.round(outputs.estimatedMonthlyUnits * outputs.byChannel[channel].unitsShare),
    })
  );

  return (
    <div className="card p-5">
      <h3 className="card-title">Estimated monthly units by channel</h3>
      <div
        className="mt-4 h-56"
        role="img"
        aria-label={data
          .map((d) => `${d.channel}: ${formatUnits(d.units)} units`)
          .join("; ")}
      >
        {/* Every bar carries its value, so there is no y-axis to read. */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
            <XAxis {...xAxisProps} dataKey="channel" interval={0} />
            <YAxis hide domain={[0, "dataMax"]} />
            <Tooltip
              cursor={cursorBand}
              isAnimationActive={false}
              content={(p) => (
                <ChartTooltip
                  active={p.active}
                  payload={p.payload}
                  label={p.label}
                  valueFormatter={(v) => [formatUnits(Number(v)), "units"]}
                  colorOf={(e) => CHANNEL_COLORS[e.payload?.channel as SalesChannel]}
                />
              )}
            />
            <Bar dataKey="units" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.channel} fill={CHANNEL_COLORS[d.channel]} />
              ))}
              <LabelList
                dataKey="units"
                position="top"
                offset={8}
                formatter={(v) => formatUnits(Number(v))}
                fill={colors.ink}
                fontSize={12}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
