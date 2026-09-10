"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useScenario } from "@/lib/store";
import { colors } from "@/lib/theme";
import { formatUnits } from "./format";
import type { SalesChannel } from "@/lib/types";

const CHANNEL_COLORS: Record<SalesChannel, string> = {
  "DTC Online": colors.accent,
  "Retail/Grocery": colors.cfo,
  "Gym & Office": colors.cmo,
};

export function VolumeChart() {
  const { outputs } = useScenario();

  const data = (Object.keys(outputs.byChannel) as SalesChannel[]).map(
    (channel) => ({
      channel,
      units: Math.round(outputs.estimatedMonthlyUnits * outputs.byChannel[channel].unitsShare),
    })
  );

  return (
    <div className="rounded-xl border border-line bg-surface card-shadow p-4">
      <p className="text-sm font-medium text-foreground">
        Estimated monthly units by channel
      </p>
      <div
        className="mt-3 h-56"
        role="img"
        aria-label={data
          .map((d) => `${d.channel}: ${formatUnits(d.units)} units`)
          .join("; ")}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.line} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="channel" stroke={colors.inkFaint} fontSize={11} />
            <YAxis
              tickFormatter={(v) => formatUnits(v)}
              stroke={colors.inkFaint}
              fontSize={11}
              width={56}
            />
            <Tooltip formatter={(value) => [formatUnits(Number(value)), "Units"]} />
            <Bar dataKey="units" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.channel} fill={CHANNEL_COLORS[d.channel]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
