import { Navbar } from "@/components/layout/Navbar";
import { ScenarioPresets, AssumptionControls } from "@/components/layout/ScenarioPanel";
import { PriceSlider } from "@/components/layout/PriceSlider";
import { ChannelMixSliders } from "@/components/layout/ChannelMixSliders";
import { RegionSelect } from "@/components/layout/RegionSelect";
import { Tabs, TabPanel } from "@/components/layout/Tabs";

import { DecisionFraming } from "@/components/insights/DecisionFraming";
import { RecommendationBox } from "@/components/insights/RecommendationBox";
import { TradeoffMatrix } from "@/components/insights/TradeoffMatrix";
import { StressTest } from "@/components/insights/StressTest";
import { ScenarioComparison } from "@/components/insights/ScenarioComparison";
import { RecommendationRecap } from "@/components/insights/RecommendationRecap";
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

import { SectionHeading } from "@/components/ui/SectionHeading";

const TABS = [
  { id: "price", label: "Price", hint: "What happens as price changes?" },
  { id: "customers", label: "Customers", hint: "What does demand look like?" },
  { id: "channels", label: "Channels", hint: "Where should we distribute?" },
  { id: "timing", label: "Timing & regions", hint: "When and where should we launch?" },
  { id: "method", label: "Method", hint: "What supports this model?" },
];

export default function Home() {
  return (
    <div className="min-h-full">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8">
        {/* 01 — The decision: pure framing, no controls or numbers yet. */}
        <DecisionFraming />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[17.5rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-8">
          {/* 02 — Build the scenario. Sticky on wide screens so the
              controls and the numbers they move stay on screen together
              through every later section. */}
          <aside
            aria-label="Scenario assumptions"
            className="h-fit overscroll-contain md:sticky md:top-[calc(var(--nav-h)+1rem)] md:max-h-[calc(100dvh-var(--nav-h)-2rem)] md:overflow-y-auto"
          >
            <SectionHeading number="02" title="Build the scenario" question="What assumptions are we making?" />
            <div className="card inspector">
              <ScenarioPresets />
              <PriceSlider />
              <ChannelMixSliders />
              <RegionSelect />
              <AssumptionControls />
            </div>
          </aside>

          <div className="@container min-w-0 space-y-8">
            {/* 03 — See the business impact. */}
            <div className="space-y-5">
              <SectionHeading
                number="03"
                title="See the business impact"
                question="What happens financially in this scenario?"
              />
              <RecommendationBox />
              <KpiRow />
            </div>

            {/* 04 — Understand the strategic trade-off. */}
            <div className="space-y-5">
              <SectionHeading
                number="04"
                title="Understand the strategic trade-off"
                question="Why isn't this simply the highest-margin or highest-volume choice?"
              />
              <TradeoffMatrix />
            </div>

            {/* 05 — Stress test the decision. Supporting evidence, not the
                headline — kept visually quieter than 03/04. */}
            <div className="space-y-5">
              <SectionHeading
                number="05"
                title="Stress test the decision"
                question="How robust is this if our one uncertain assumption is wrong?"
              />
              <StressTest />
              <ScenarioComparison />
            </div>

            {/* 06 — Review the evidence: detailed analysis, tabbed so it
                stays out of the way until someone asks for it. */}
            <div className="space-y-5">
              <SectionHeading number="06" title="Review the evidence" />
              <Tabs tabs={TABS}>
                <TabPanel id="price">
                  <VanWestendorpChart />
                  <RevenueMarginChart />
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
        </div>

        {/* 07 — Make the recommendation: the close of the journey. */}
        <RecommendationRecap />
      </main>
    </div>
  );
}
