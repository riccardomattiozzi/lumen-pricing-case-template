// Shared design tokens — colors here must stay in sync with the @theme
// block in app/globals.css (Tailwind v4 reads its palette from CSS, chart
// libraries like Recharts need real JS values, so the same hex values are
// declared in both places rather than one generating the other).

export const colors = {
  ink: "#1B2321",
  inkSoft: "#4E5A52",
  inkFaint: "#7C877E",
  line: "#DCD5C2",
  bg: "#F6F4EC",
  surface: "#FFFFFF",
  accent: "#1F7A5C",
  accentSoft: "#E3F0E8",
  // Scenario identity — used consistently on preset buttons here and on
  // every chart series Member 3 draws, so a scenario reads as the same
  // color everywhere in the app.
  cfo: "#2563EB",
  cfoSoft: "#DBEAFE",
  cmo: "#D97706",
  cmoSoft: "#FEF3C7",
  compromise: "#1F7A5C",
  compromiseSoft: "#E3F0E8",
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
