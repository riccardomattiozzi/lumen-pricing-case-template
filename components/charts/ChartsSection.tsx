import { KpiRow } from "./KpiRow";
import { RevenueMarginChart } from "./RevenueMarginChart";
import { VolumeChart } from "./VolumeChart";
import { ChannelContributionChart } from "./ChannelContributionChart";
import { CompetitorPositioningChart } from "./CompetitorPositioningChart";
import { CompetitorPriceHistoryChart } from "./CompetitorPriceHistoryChart";

export function ChartsSection() {
  return (
    <div className="space-y-4">
      <KpiRow />
      <RevenueMarginChart />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <VolumeChart />
        <ChannelContributionChart />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <CompetitorPositioningChart />
        <CompetitorPriceHistoryChart />
      </div>
    </div>
  );
}
