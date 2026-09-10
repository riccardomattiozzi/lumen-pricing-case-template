import { Navbar } from "@/components/layout/Navbar";
import { ScenarioPanel } from "@/components/layout/ScenarioPanel";
import { PriceSlider } from "@/components/layout/PriceSlider";
import { ChannelMixSliders } from "@/components/layout/ChannelMixSliders";
import { RegionSelect } from "@/components/layout/RegionSelect";
import { ChartsSection } from "@/components/charts/ChartsSection";
import { InsightsSection } from "@/components/insights/InsightsSection";

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

          <div className="space-y-8">
            {/* SLOT: insights */}
            <InsightsSection />
            {/* SLOT: charts */}
            <ChartsSection />
          </div>
        </div>
      </main>
    </div>
  );
}
