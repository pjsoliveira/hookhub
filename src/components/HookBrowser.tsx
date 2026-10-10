"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  buildQuery,
  eventCounts,
  filterHooks,
  parseFilters,
  SORT_KEYS,
  sortHooks,
  type MetaByRepo,
  type SortKey,
} from "@/lib/hooks/filter";
import type { Hook, HookEvent } from "@/lib/hooks/schema";
import { HookCard } from "./HookCard";

const SORT_LABELS: Record<SortKey, string> = {
  stars: "Most stars",
  updated: "Recently updated",
  newest: "Newest added",
  name: "Name",
};

export function HookBrowser({ hooks, events, meta }: { hooks: Hook[]; events: HookEvent[]; meta: MetaByRepo }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = parseFilters(params, events.map((e) => e.name));
  // The text box keeps its own state so typing never waits on the URL.
  const [text, setText] = useState(filters.q);

  function update(next: Partial<{ events: string[]; q: string; sort: SortKey }>) {
    const query = buildQuery({ events: filters.events, q: text, sort: filters.sort, ...next });
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function toggle(event: string) {
    const selected = filters.events.includes(event)
      ? filters.events.filter((e) => e !== event)
      : [...filters.events, event];
    update({ events: selected });
  }

  const groupOf = Object.fromEntries(events.map((event) => [event.name, event.group]));
  const counts = eventCounts(hooks);
  // Only offer events that at least one hook handles (plus any already selected).
  const groups = new Map<string, HookEvent[]>();
  for (const event of events) {
    if (!counts[event.name] && !filters.events.includes(event.name)) continue;
    groups.set(event.group, [...(groups.get(event.group) ?? []), event]);
  }

  const visible = sortHooks(filterHooks(hooks, { events: filters.events, q: text }), meta, filters.sort);
  const filtered = filters.events.length > 0 || text.trim() !== "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Search hooks</span>
          <input
            type="search"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              update({ q: e.target.value });
            }}
            placeholder="Search hooks"
            className="w-full rounded-md border border-zinc-300 bg-transparent p-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Sort</span>
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value as SortKey })}
            className="rounded-md border border-zinc-300 bg-transparent p-2 dark:border-zinc-700"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key} className="text-black">
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Filter by event</legend>
        {[...groups].map(([group, items]) => (
          <div key={group} className="flex flex-wrap items-center gap-2">
            <span className="w-full shrink-0 text-xs text-zinc-500 sm:w-28">{group}</span>
            {items.map((event) => {
              const on = filters.events.includes(event.name);
              return (
                <button
                  key={event.name}
                  type="button"
                  aria-pressed={on}
                  title={event.description}
                  onClick={() => toggle(event.name)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    on
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  {event.name} <span className={on ? "opacity-80" : "text-zinc-500"}>{counts[event.name] ?? 0}</span>
                </button>
              );
            })}
          </div>
        ))}
      </fieldset>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <p aria-live="polite">
          {visible.length} of {hooks.length} hooks
        </p>
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setText("");
              router.replace(pathname, { scroll: false });
            }}
            className="underline underline-offset-4"
          >
            Clear filters
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No hooks match. Try removing a filter.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((hook) => (
            <HookCard key={hook.slug} hook={hook} meta={meta[hook.repo]} groupOf={groupOf} />
          ))}
        </div>
      )}
    </div>
  );
}
