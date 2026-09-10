import { RecommendationBox } from "./RecommendationBox";
import { TradeoffMatrix } from "./TradeoffMatrix";
import { ChecklistPanel } from "./ChecklistPanel";

export function InsightsSection() {
  return (
    <div className="space-y-4">
      <RecommendationBox />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TradeoffMatrix />
        <ChecklistPanel />
      </div>
    </div>
  );
}
