// Shared design tokens — colors here must stay in sync with the :root
// block in app/globals.css (Tailwind v4 reads its palette from CSS, chart
// libraries like Recharts need real JS values, so the same hex values are
// declared in both places rather than one generating the other). These
// are the light-mode values; charts render against the light palette even
// when the page is in dark mode (Recharts doesn't consume CSS variables).

export const colors = {
  ink: "#10201a",
  inkSoft: "#43584c",
  inkFaint: "#77897d",
  line: "#d9e4d5",
  bg: "#f4f7f3",
  surface: "#ffffff",
  accent: "#0f9d63",
  accentInk: "#0a5f3d",
  accentSoft: "#dcf3e6",
  // Scenario identity — used consistently on preset buttons here and on
  // every chart series Member 3 draws, so a scenario reads as the same
  // color everywhere in the app.
  cfo: "#3452d9",
  cfoSoft: "#e1e6fc",
  cmo: "#d97a06",
  cmoSoft: "#faead0",
  compromise: "#0f9d63",
  compromiseSoft: "#dcf3e6",
} as const;

export const PRESET_COLORS: Record<"CFO" | "CMO" | "Compromise", string> = {
  CFO: colors.cfo,
  CMO: colors.cmo,
  Compromise: colors.compromise,
};

export const PRESET_SOFT_COLORS: Record<"CFO" | "CMO" | "Compromise", string> = {
  CFO: colors.cfoSoft,
  CMO: colors.cmoSoft,
  Compromise: colors.compromiseSoft,
};
