"use client";

// TEMPORARY placeholder — Member 2 (feature/dashboard-ui) owns this file.
// Kept minimal on purpose: just enough to prove the store -> engine wiring
// works end to end for PR #1, with the three integration slots already
// marked so Members 3 and 4 have a fixed place to drop their component.

import { useScenario, useScenarioStore } from "@/lib/store";

export default function Home() {
  const { inputs, outputs, activePreset } = useScenario();
  const applyPreset = useScenarioStore((s) => s.applyPreset);

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          LUMEN Germany — Pricing &amp; GTM Simulator
        </h1>
        <p className="text-sm text-neutral-500">
          Scaffold stage (PR #1) — real UI lands on feature/dashboard-ui.
        </p>
      </div>

      <div className="flex gap-2">
        {(["CFO", "Compromise", "CMO"] as const).map((preset) => (
          <button
            key={preset}
            onClick={() => applyPreset(preset)}
            className={`rounded border px-3 py-1 text-sm ${
              activePreset === preset ? "bg-neutral-900 text-white" : ""
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-neutral-500">Price</dt>
          <dd>{`€${inputs.priceEur.toFixed(2)}`}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Estimated monthly units</dt>
          <dd>{outputs.estimatedMonthlyUnits.toLocaleString("de-DE")}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Estimated monthly revenue</dt>
          <dd>{`€${outputs.estimatedMonthlyRevenueEur.toLocaleString("de-DE", {
            maximumFractionDigits: 0,
          })}`}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">CAC payback</dt>
          <dd>{outputs.cacPaybackMonths.toFixed(1)} months</dd>
        </div>
      </dl>

      {/* SLOT: kpis */}
      {/* SLOT: charts */}
      {/* SLOT: insights */}
    </main>
  );
}
