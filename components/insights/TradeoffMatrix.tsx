"use client";

import { useScenario } from "@/lib/store";
import { computeTradeoff, stressTestAssumption } from "@/lib/recommendationEngine";
import { colors } from "@/lib/theme";

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground-soft">{score}/100</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-line" role="img" aria-label={`${label} score: ${score} out of 100`}>
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function TradeoffMatrix() {
  const { inputs, outputs } = useScenario();
  const result = computeTradeoff(inputs, outputs);
  const stress = stressTestAssumption(inputs);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm font-medium text-foreground">CFO vs. CMO trade-off</p>
      <div className="mt-3 space-y-3">
        <ScoreBar label="CFO score" score={result.cfoScore} color={colors.cfo} />
        <ScoreBar label="CMO score" score={result.cmoScore} color={colors.cmo} />
        <ScoreBar label="Compromise score" score={result.compromiseScore} color={colors.accent} />
      </div>
      <p className="mt-3 text-xs text-foreground-faint">
        {result.tradeoffGapPts <= 5
          ? `Only a ${result.tradeoffGapPts}-point gap — this scenario serves both sides reasonably evenly.`
          : `A ${result.tradeoffGapPts}-point gap — this scenario clearly favors one side over the other.`}
      </p>

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-xs font-medium text-foreground">
          Does this hold up? Stress-testing the market-share assumption
        </p>
        <p className="mt-1 text-xs text-foreground-faint">
          Rerunning the recommendation at half and double the current
          Year-1 capture-rate assumption ({(inputs.marketShareCapturePct * 100).toFixed(2)}%):
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          {stress.map(({ multiplier, result: r }) => (
            <div key={multiplier} className="rounded-md border border-line p-2">
              <p className="text-foreground-faint">{multiplier}×</p>
              <p className="mt-1 font-mono tabular-nums text-foreground">
                CFO {r.cfoScore} / CMO {r.cmoScore}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
