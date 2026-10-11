"use client";
// Explorer tabs: a WAI-ARIA tab list that teaches what each hook event is; receives plain data as props, never the catalog.
import { useId, useRef, useState, type KeyboardEvent } from "react";

export type ExplorerItem = { name: string; description: string; hookCount: number };

export function HeroExplorerTabs({ items }: { items: ExplorerItem[] }) {
  const [selected, setSelected] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelId = `${baseId}-panel`;
  const tabId = (index: number) => `${baseId}-tab-${index}`;

  if (items.length === 0) return null;
  const current = items[Math.min(selected, items.length - 1)];

  const moveTo = (index: number) => {
    setSelected(index);
    tabRefs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = items.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = selected >= last ? 0 : selected + 1;
    else if (event.key === "ArrowLeft") next = selected <= 0 ? last : selected - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    moveTo(next);
  };

  const count = current.hookCount;

  return (
    <div className="flex flex-col gap-3">
      <p id={`${baseId}-label`} className="text-xs font-semibold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
        What is a hook event?
      </p>
      <div role="tablist" aria-labelledby={`${baseId}-label`} className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const isSelected = index === selected;
          return (
            <button
              key={item.name}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={onKeyDown}
              className={`rounded-full border px-3 py-1.5 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-sky-300 dark:focus-visible:ring-offset-zinc-950 ${
                isSelected
                  ? "border-sky-800 bg-sky-800 font-semibold text-white dark:border-sky-300 dark:bg-sky-300 dark:text-zinc-950"
                  : "border-zinc-400 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(selected)}
        className="min-h-24 rounded-xl border border-zinc-300 bg-white/80 p-4 sm:min-h-20 dark:border-zinc-700 dark:bg-zinc-900/80"
      >
        <p className="text-base text-zinc-900 dark:text-zinc-50">{current.description}</p>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          {count} {count === 1 ? "hook reacts" : "hooks react"} to {current.name}
        </p>
      </div>
    </div>
  );
}
