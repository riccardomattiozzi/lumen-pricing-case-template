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
import { formatEuro } from "./format";
import type { SalesChannel } from "@/lib/types";

const CHANNEL_COLORS: Record<SalesChannel, string> = {
  "DTC Online": colors.accent,
  "Retail/Grocery": colors.cfo,
  "Gym & Office": colors.cmo,
};

export function ChannelContributionChart() {
  const { outputs } = useScenario();

  const data = (Object.keys(outputs.byChannel) as SalesChannel[]).map(
    (channel) => {
      const channelData = outputs.byChannel[channel];
      const units = outputs.estimatedMonthlyUnits * channelData.unitsShare;
      return {
        channel,
        contributionEur: Math.round(units * channelData.unitContributionEur),
      };
    }
  );

  return (
    <div className="rounded-xl border border-line bg-surface card-shadow p-4">
      <p className="text-sm font-medium text-foreground">
        Estimated monthly contribution by channel
      </p>
      <p className="text-xs text-foreground-faint">
        Units × that channel&apos;s unit contribution — where the margin
        actually comes from, not just the volume.
      </p>
      <div
        className="mt-3 h-56"
        role="img"
        aria-label={data
          .map((d) => `${d.channel}: ${formatEuro(d.contributionEur)}`)
          .join("; ")}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.line} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="channel" stroke={colors.inkFaint} fontSize={11} />
            <YAxis
              tickFormatter={(v) => formatEuro(v)}
              stroke={colors.inkFaint}
              fontSize={11}
              width={64}
            />
            <Tooltip formatter={(value) => [formatEuro(Number(value)), "Contribution"]} />
            <Bar dataKey="contributionEur" radius={[4, 4, 0, 0]}>
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
