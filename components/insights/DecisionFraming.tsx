import { SectionHeading } from "@/components/ui/SectionHeading";

// Step 01 of the guided journey: pure framing, no numbers yet. Names and
// facts here (Elena/CFO, Jonas/CMO, the 300-respondent survey) are already
// part of the existing model and its rationale text — nothing invented.
export function DecisionFraming() {
  return (
    <section className="card p-6 sm:p-8" aria-labelledby="decision-heading">
      <SectionHeading number="01" title="The decision" />
      <h2
        id="decision-heading"
        className="max-w-2xl text-xl font-semibold text-foreground text-balance sm:text-2xl"
      >
        LUMEN is evaluating its entry into the German market.
      </h2>
      <p className="mt-3 max-w-2xl text-base text-foreground-soft text-pretty">
        There is no German sales history yet — everything below is built
        from research (a 300-respondent pricing survey, live price tests,
        competitor and seasonality data) plus one adjustable assumption
        about market share, not from live sales.
      </p>
      <p className="mt-3 max-w-2xl text-base text-foreground-soft text-pretty">
        The question this simulator answers:{" "}
        <strong className="font-semibold text-foreground">
          what price, sales-channel mix and launch timing should LUMEN
          choose for Year 1?
        </strong>{" "}
        Elena (CFO) and Jonas (CMO) read the same numbers differently —
        the rest of this page builds the scenario, then shows both
        readings side by side.
      </p>
    </section>
  );
}
