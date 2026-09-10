import { Navbar } from "@/components/layout/Navbar";
import { ScenarioPanel } from "@/components/layout/ScenarioPanel";
import { PriceSlider } from "@/components/layout/PriceSlider";
import { ChannelMixSliders } from "@/components/layout/ChannelMixSliders";
import { RegionSelect } from "@/components/layout/RegionSelect";
import { Tabs, TabPanel } from "@/components/layout/Tabs";

import { RecommendationBox } from "@/components/insights/RecommendationBox";
import { TradeoffMatrix } from "@/components/insights/TradeoffMatrix";
import { ChecklistPanel } from "@/components/insights/ChecklistPanel";

import { KpiRow } from "@/components/charts/KpiRow";
import { RevenueMarginChart } from "@/components/charts/RevenueMarginChart";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { ChannelContributionChart } from "@/components/charts/ChannelContributionChart";
import { CompetitorPositioningChart } from "@/components/charts/CompetitorPositioningChart";
import { CompetitorPriceHistoryChart } from "@/components/charts/CompetitorPriceHistoryChart";

import { VanWestendorpChart } from "@/components/analysis/VanWestendorpChart";
import { UnitEconomicsPanel } from "@/components/analysis/UnitEconomicsPanel";
import { SegmentPanel } from "@/components/analysis/SegmentPanel";
import { SeasonalityChart } from "@/components/analysis/SeasonalityChart";
import { RegionalOpportunity } from "@/components/analysis/RegionalOpportunity";
import { HomeMarketBenchmark } from "@/components/analysis/HomeMarketBenchmark";
import { DataProvenance } from "@/components/analysis/DataProvenance";

const TABS = [
  { id: "tradeoff", label: "Trade-off", hint: "CFO vs CMO scoring and stress test" },
  { id: "price", label: "Price", hint: "Willingness to pay and competitor bands" },
  { id: "customers", label: "Customers", hint: "Segment acceptance and verbatims" },
  { id: "channels", label: "Channels", hint: "Where the margin comes from" },
  { id: "timing", label: "Timing & regions", hint: "Seasonality and geography" },
  { id: "method", label: "Method", hint: "Data handling and limitations" },
];

export default function Home() {
  return (
    <div className="min-h-full">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[340px_1fr]">
          <aside className="card-shadow h-fit space-y-8 rounded-2xl border border-line bg-surface p-5 md:sticky md:top-6">
            <div className="space-y-5 border-b border-line pb-6">
              <PriceSlider />
              <ChannelMixSliders />
              <RegionSelect />
            </div>
            <ScenarioPanel />
          </aside>

          <div className="space-y-4">
            <RecommendationBox />
            <KpiRow />

            <Tabs tabs={TABS}>
              <TabPanel id="tradeoff">
                <TradeoffMatrix />
                <RevenueMarginChart />
              </TabPanel>

              <TabPanel id="price">
                <VanWestendorpChart />
                <CompetitorPositioningChart />
                <CompetitorPriceHistoryChart />
              </TabPanel>

              <TabPanel id="customers">
                <SegmentPanel />
              </TabPanel>

              <TabPanel id="channels">
                <UnitEconomicsPanel />
                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                  <VolumeChart />
                  <ChannelContributionChart />
                </div>
              </TabPanel>

              <TabPanel id="timing">
                <SeasonalityChart />
                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                  <RegionalOpportunity />
                  <HomeMarketBenchmark />
                </div>
              </TabPanel>

              <TabPanel id="method">
                <DataProvenance />
                <ChecklistPanel />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
