"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { InfoIcon } from "@/components/ui/icons";

// A small, on-demand definition for a technical term — click or focus the
// glyph, read one or two plain sentences, dismiss with Escape or a tap
// elsewhere. Rendered through a portal (not absolutely positioned in place)
// so it always floats above any card that clips its own overflow, and its
// position is recalculated relative to the trigger so it works the same
// inside the sticky inspector, a KPI tile, or a chart card.
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;

    function place() {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const left = Math.min(Math.max(r.left + r.width / 2, 128), window.innerWidth - 128);
      setCoords({ top: r.bottom + 8, left });
    }
    place();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickAway(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickAway);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickAway);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        aria-label={`About ${label}`}
        className="pressable -m-1.5 inline-flex flex-none items-center justify-center rounded-full p-1.5 align-middle text-foreground-faint hover:text-accent-ink focus-visible:text-accent-ink"
      >
        <InfoIcon className="h-3.5 w-3.5" />
      </button>
      {open &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            className="chart-tooltip fixed z-[100] w-56 -translate-x-1/2 text-left text-xs font-normal normal-case leading-snug text-foreground-soft"
            style={{ top: coords.top, left: coords.left }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}
