const ITEMS: { question: string; answer: string }[] = [
  {
    question: "Data — what does the tool handle, and is any of it sensitive?",
    answer:
      "customer_survey.csv has first_name/last_name/email. scripts/build-data.ts strips all three before anything is written to data/processed/ — the build pipeline never lets them reach the shipped bundle. Everything the app actually reads (segment, city, spend, awareness, intent) is anonymized aggregate or individually non-identifying survey data.",
  },
  {
    question: "API keys — where is the key stored, if any?",
    answer:
      "No external API is called anywhere in this build — no key exists to leak. If the optional live-weather stretch is ever added, the key belongs in .env.local (gitignored) locally and in Vercel's Environment Variables for production, never typed into a chat or committed.",
  },
  {
    question: "Deployment — does any endpoint return raw, unfiltered data?",
    answer:
      "The app is fully static (no API routes, no server) — the browser only ever receives the pre-built JSON under data/processed/, which already has PII stripped at build time. There is no endpoint that could serve the raw CSVs.",
  },
  {
    question: "Generated files — should they be committed?",
    answer:
      "data/processed/*.json is committed deliberately: it's the PII-free, versioned artifact the deployed app actually reads, and committing it means the build is reproducible without re-running the pipeline. data/processed/DATA_QUALITY.md is committed for the same reason — it's the audit trail, not scratch output.",
  },
  {
    question: "Storage — what structure, and why?",
    answer:
      "No database and no localStorage persistence — every number is recomputed live from ScenarioInputs via a pure function (computeScenario). State lives only in memory (Zustand) for the current session; nothing needs to be shared between visitors or remembered between visits, so a database would be unearned complexity.",
  },
  {
    question: "Robustness — what happens on empty/inconsistent/unexpected input?",
    answer:
      "Empty target regions → zero demand, not NaN. A channel mix that doesn't sum to 1 gets normalized, not rejected. Price is clamped to [1.29, 3.29] even if something upstream sends a wild value. Zero marketing budget doesn't divide-by-zero the CAC payback. All four are covered by tests in lib/engine/pricingEngine.test.ts.",
  },
  {
    question: "Explainability — can a non-technical reader follow what this does?",
    answer:
      "The recommendation box states price, channel, timing and the trade-off in one plain paragraph with real numbers, not jargon. The market-share assumption slider is labeled explicitly as an assumption, not a fact. The stress-test panel shows whether a recommendation survives a more conservative guess, in plain language.",
  },
  {
    question: "Business relevance — does this answer the brief, or is it off-target?",
    answer:
      "It answers the brief's exact closing question — price, channel(s), timing, and what's deliberately not being optimized for — with numbers traceable to specific CSV columns, and flags where the model extrapolates beyond what was actually tested (€1.79–€2.59) instead of presenting every number with equal, false confidence.",
  },
];

export function ChecklistPanel() {
  return (
    <div className="rounded-xl border border-line bg-surface card-shadow p-4">
      <p className="text-sm font-medium text-foreground">
        README checklist — answered, not skipped
      </p>
      <dl className="mt-3 space-y-3">
        {ITEMS.map((item) => (
          <div key={item.question}>
            <dt className="text-xs font-medium text-foreground">{item.question}</dt>
            <dd className="mt-0.5 text-xs text-foreground-soft">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
