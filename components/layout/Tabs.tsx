"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type Direction = "forward" | "back" | "none";

interface TabsContextValue {
  active: string;
  direction: Direction;
}

const TabsContext = createContext<TabsContextValue | null>(null);

// Soft edges on the scrolling row, only on the side that has more to show.
function updateFade(scroller: HTMLElement) {
  const start = scroller.scrollLeft > 1;
  const end = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1;
  scroller.dataset.fade = start && end ? "both" : start ? "start" : end ? "end" : "none";
}

// A segmented control. The selected segment is one raised thumb that slides
// (on a critically damped spring) to whichever tab was picked, starting from
// wherever it is at that moment — tapping quickly between tabs redirects it
// mid-flight instead of queueing animations. If the tabs don't fit a phone's
// width the row scrolls, with soft edges showing there is more.
//
// The thumb is positioned by writing to the DOM directly: it is pure
// presentation, so it doesn't need to go through React state.
export function Tabs({
  tabs,
  children,
}: {
  tabs: { id: string; label: string; hint?: string }[];
  children: ReactNode;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const [direction, setDirection] = useState<Direction>("none");

  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function select(id: string) {
    if (id === active) return;
    const from = tabs.findIndex((t) => t.id === active);
    const to = tabs.findIndex((t) => t.id === id);
    setDirection(to > from ? "forward" : "back");
    setActive(id);
  }

  useLayoutEffect(() => {
    const button = tabRefs.current[active];
    const scroller = scrollRef.current;
    const thumb = thumbRef.current;
    if (!button || !scroller || !thumb) return;

    const place = () => {
      thumb.style.width = `${button.offsetWidth}px`;
      thumb.style.transform = `translateX(${button.offsetLeft}px)`;
      updateFade(scroller);
    };
    place();

    // First placement is instant; only later moves animate.
    if (thumb.dataset.ready !== "true") {
      thumb.dataset.ready = "true";
      requestAnimationFrame(() => {
        thumb.dataset.animate = "true";
      });
    }

    // Keep the picked segment fully in view when the row scrolls.
    const pad = 24;
    const left = button.offsetLeft - pad;
    const right = button.offsetLeft + button.offsetWidth + pad;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    if (left < scroller.scrollLeft) {
      scroller.scrollTo({ left, behavior });
    } else if (right > scroller.scrollLeft + scroller.clientWidth) {
      scroller.scrollTo({ left: right - scroller.clientWidth, behavior });
    }

    const observer = new ResizeObserver(place);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [active]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((t) => t.id === active);
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    const id = tabs[next].id;
    select(id);
    tabRefs.current[id]?.focus();
  }

  return (
    <TabsContext.Provider value={{ active, direction }}>
      <div className="segmented p-0.5">
        <div
          ref={scrollRef}
          onScroll={(e) => updateFade(e.currentTarget)}
          className="segmented-scroll overflow-x-auto"
        >
          <div
            role="tablist"
            aria-label="Analysis sections"
            onKeyDown={onKeyDown}
            className="relative flex w-max min-w-full"
          >
            <span
              ref={thumbRef}
              aria-hidden
              className="segmented-thumb absolute inset-y-0 left-0"
            />
            {tabs.map((tab) => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  title={tab.hint}
                  onClick={() => select(tab.id)}
                  className={`segment pressable relative z-10 flex-1 whitespace-nowrap rounded-[0.5625rem] px-3.5 py-1.5 text-footnote font-medium ${
                    isActive
                      ? "text-foreground"
                      : "text-foreground-soft hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {children}
    </TabsContext.Provider>
  );
}

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.active !== id) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      data-direction={ctx.direction}
      className="tab-panel space-y-5"
    >
      {children}
    </div>
  );
}
