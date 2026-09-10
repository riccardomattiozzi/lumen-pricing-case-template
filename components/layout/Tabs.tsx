"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  tabs,
  children,
}: {
  tabs: { id: string; label: string; hint?: string }[];
  children: ReactNode;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div
        role="tablist"
        aria-label="Analysis sections"
        className="-mx-1 flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 card-shadow"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              title={tab.hint}
              onClick={() => setActive(tab.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "text-foreground-soft hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
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
      className="space-y-4"
    >
      {children}
    </div>
  );
}
