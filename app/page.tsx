import { Navbar } from "@/components/layout/Navbar";
import { ScenarioPresets, AssumptionControls } from "@/components/layout/ScenarioPanel";
import { PriceSlider } from "@/components/layout/PriceSlider";
import { ChannelMixSliders } from "@/components/layout/ChannelMixSliders";
import { RegionSelect } from "@/components/layout/RegionSelect";
import { Tabs, TabPanel } from "@/components/layout/Tabs";

import { RecommendationBox } from "@/components/insights/RecommendationBox";
import { TradeoffMatrix } from "@/components/insights/TradeoffMatrix";
import { ScenarioComparison } from "@/components/insights/ScenarioComparison";
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
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[17.5rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-8">
          {/* The inspector: every input in one grouped surface. On wide
              screens it stays put and scrolls on its own, so the controls
              and the numbers they move are on screen together. */}
          <aside
            aria-label="Scenario assumptions"
            className="h-fit overscroll-contain md:sticky md:top-[calc(var(--nav-h)+1rem)] md:max-h-[calc(100dvh-var(--nav-h)-2rem)] md:overflow-y-auto"
          >
            <p className="eyebrow px-1 pb-2 text-foreground-faint">
              Scenario assumptions — you control these
            </p>
            <div className="card inspector">
              <ScenarioPresets />
              <PriceSlider />
              <ChannelMixSliders />
              <RegionSelect />
              <AssumptionControls />
            </div>
          </aside>

          <div className="@container min-w-0 space-y-5">
            <p className="eyebrow px-1 text-foreground-faint">
              Scenario results — calculated by the model
            </p>
            <RecommendationBox />
            <KpiRow />

            <Tabs tabs={TABS}>
              <TabPanel id="tradeoff">
                <TradeoffMatrix />
                <ScenarioComparison />
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
                <div className="grid grid-cols-1 items-start gap-5 @3xl:grid-cols-2">
                  <VolumeChart />
                  <ChannelContributionChart />
                </div>
              </TabPanel>

              <TabPanel id="timing">
                <SeasonalityChart />
                <div className="grid grid-cols-1 items-start gap-5 @3xl:grid-cols-2">
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
