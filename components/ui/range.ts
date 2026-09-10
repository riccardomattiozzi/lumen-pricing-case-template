import type { CSSProperties } from "react";

// Inline style for a native range input: how far the tint fill runs along
// the track (the thumb's position, in percent) and, optionally, which color
// fills it. Recomputed on every render, so the fill tracks the thumb 1:1
// while dragging — no transition sitting between the finger and the track.
export function rangeStyle(
  value: number,
  min: number,
  max: number,
  accent?: string
): CSSProperties {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const style: Record<string, string> = {
    "--fill": `${Math.min(100, Math.max(0, pct))}%`,
  };
  if (accent) style["--range-accent"] = accent;
  return style as CSSProperties;
}
