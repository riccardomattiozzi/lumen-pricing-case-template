"use client";

import { useScenario, PRESET_INPUTS } from "@/lib/store";
import { computeScenario } from "@/lib/engine/pricingEngine";
import { computeTradeoff, stressTestAssumption } from "@/lib/recommendationEngine";
import { colors } from "@/lib/theme";
import { InfoTip } from "@/components/ui/InfoTip";

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

// Where a scenario sits between the two priorities, as a single number: 0
// means the score is entirely CFO-weighted, 100 entirely CMO-weighted, 50
// an even split. Purely a display-layer placement derived from the two
// scores the engine already computed — it adds no new scoring logic.
function spectrumPosition(cfoScore: number, cmoScore: number): number {
  const total = cfoScore + cmoScore;
  if (total <= 0) return 50;
  return (cmoScore / total) * 100;
}

function SpectrumMarker({
  position,
  color,
  label,
  emphasis,
  stackRow = 0,
}: {
  position: number;
  color: string;
  label: string;
  emphasis?: boolean;
  /** Vertical row (0, 1, ...) to stagger this marker's label into, so two
      markers sitting close together on the spectrum don't render their
      labels on top of each other. */
  stackRow?: number;
}) {
  return (
    <div
      className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${Math.min(100, Math.max(0, position))}%` }}
    >
      <span
        aria-hidden
        className="rounded-full ring-2 ring-surface"
        style={{
          backgroundColor: color,
          width: emphasis ? "0.875rem" : "0.5rem",
          height: emphasis ? "0.875rem" : "0.5rem",
        }}
      />
      <span
        className={`whitespace-nowrap text-2xs ${
          emphasis ? "font-semibold text-foreground" : "text-foreground-faint"
        }`}
        style={{ marginTop: `${0.375 + stackRow * 1.125}rem` }}
      >
        {label}
      </span>
    </div>
  );
}

export function TradeoffMatrix() {
  const { inputs, outputs } = useScenario();
  const result = computeTradeoff(inputs, outputs);
  const stress = stressTestAssumption(inputs);

  const compromiseOutputs = computeScenario(PRESET_INPUTS.Compromise);
  const compromiseResult = computeTradeoff(PRESET_INPUTS.Compromise, compromiseOutputs);

  const currentPosition = spectrumPosition(result.cfoScore, result.cmoScore);
  const compromisePosition = spectrumPosition(compromiseResult.cfoScore, compromiseResult.cmoScore);
  // Below this % distance the two markers' labels would collide — stack
  // "This scenario" onto a second row instead of overlapping "Compromise".
  const markersAreClose = Math.abs(currentPosition - compromisePosition) < 14;

  const leaning =
    result.tradeoffGapPts <= 5
      ? "balanced"
      : result.cfoScore > result.cmoScore
      ? "CFO"
      : "CMO";
  const interpretation =
    leaning === "balanced"
      ? `Only a ${result.tradeoffGapPts}-point gap — this scenario serves financial efficiency and brand/growth reasonably evenly.`
      : leaning === "CFO"
      ? `A ${result.tradeoffGapPts}-point gap toward CFO priorities — this scenario favors financial efficiency (margin, payback) over brand positioning and growth.`
      : `A ${result.tradeoffGapPts}-point gap toward CMO priorities — this scenario favors brand positioning and growth over financial efficiency (margin, payback).`;

  return (
    <div className="card p-5">
      <h3 className="card-title">CFO vs. CMO trade-off</h3>
      <p className="card-subtitle">
        The CFO reads this scenario for margin, CAC and payback speed. The
        CMO reads it for price positioning, premium channels and purchase
        intent. Neither score is &quot;correct&quot; — they represent two
        different priorities on the same numbers.
      </p>

      <div className="mt-4 space-y-4">
        <ScoreBar label="CFO score" score={result.cfoScore} color={colors.cfo} />
        <ScoreBar label="CMO score" score={result.cmoScore} color={colors.cmo} />
        <ScoreBar label="Compromise score" score={result.compromiseScore} color={colors.accent} />
      </div>

      {/* The same two scores, read as one position along a spectrum rather
          than two separate bars — where this scenario sits between
          financial efficiency and brand/growth, with the balanced
          Compromise preset shown for reference. */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-2xs font-semibold text-foreground-faint">
          <span>CFO · Financial efficiency</span>
          <span>CMO · Brand &amp; growth</span>
        </div>
        <div className="relative mt-3 h-1.5 rounded-full" style={{
          background: `linear-gradient(to right, ${colors.cfo}, ${colors.neutral}, ${colors.cmo})`,
        }}>
          <SpectrumMarker position={compromisePosition} color={colors.accent} label="Compromise" />
          <SpectrumMarker
            position={currentPosition}
            color={colors.compromise}
            label="This scenario"
            emphasis
            stackRow={markersAreClose ? 1 : 0}
          />
        </div>
        <p className={`${markersAreClose ? "mt-9" : "mt-6"} text-sm text-foreground-soft text-pretty`}>
          {interpretation}
        </p>
      </div>

      <div className="mt-5 border-t border-line-soft pt-5">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          Does this hold up? Stress-testing the market-share assumption
          <InfoTip label="Market share stress test">
            Year-1 market share is an assumption, not a measurement — there
            is no German sales history yet. This reruns the scenario at
            half and double the current assumption to show whether the
            scores survive a more conservative or more optimistic guess.
          </InfoTip>
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
                {multiplier}× {multiplier === 0.5 ? "downside" : multiplier === 2 ? "upside" : "(now)"}
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
