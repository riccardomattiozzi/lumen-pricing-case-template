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
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="text-sm tabular-nums text-foreground-soft">
          <span className="text-base font-semibold text-foreground">{score}</span>
          <span className="text-foreground-faint">/100</span>
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-fill"
        role="img"
        aria-label={`${label}: ${score} out of 100`}
      >
        <div
          className="h-full rounded-full"
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
    <div className="card p-5">
      <h3 className="card-title">CFO vs. CMO trade-off</h3>
      <div className="mt-4 space-y-4">
        <ScoreBar label="CFO score" score={result.cfoScore} color={colors.cfo} />
        <ScoreBar label="CMO score" score={result.cmoScore} color={colors.cmo} />
        <ScoreBar label="Compromise score" score={result.compromiseScore} color={colors.accent} />
      </div>
      <p className="mt-4 text-sm text-foreground-soft">
        {result.tradeoffGapPts <= 5
          ? `Only a ${result.tradeoffGapPts}-point gap — this scenario serves both sides reasonably evenly.`
          : `A ${result.tradeoffGapPts}-point gap — this scenario clearly favors one side over the other.`}
      </p>

      <div className="mt-5 border-t border-line-soft pt-5">
        <h4 className="text-sm font-semibold text-foreground">
          Does this hold up? Stress-testing the market-share assumption
        </h4>
        <p className="mt-1 text-sm text-foreground-faint">
          Rerunning the recommendation at half and double the current
          Year-1 capture-rate assumption ({(inputs.marketShareCapturePct * 100).toFixed(2)}%):
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {stress.map(({ multiplier, result: r }) => (
            <div
              key={multiplier}
              className={`rounded-xl px-3 py-2.5 ${
                multiplier === 1 ? "bg-surface-2 ring-1 ring-inset ring-line" : "bg-surface-2"
              }`}
            >
              <p className="text-xs font-medium text-foreground-faint">
                {multiplier}×{multiplier === 1 ? " (now)" : ""}
              </p>
              <p className="mt-1 flex flex-wrap gap-x-2.5 text-sm tabular-nums">
                <span>
                  <span className="text-xs text-foreground-faint">CFO </span>
                  <span className="font-semibold text-foreground">{r.cfoScore}</span>
                </span>
                <span>
                  <span className="text-xs text-foreground-faint">CMO </span>
                  <span className="font-semibold text-foreground">{r.cmoScore}</span>
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
