"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  buildQuery,
  eventCounts,
  filterHooks,
  MAX_QUERY_LENGTH,
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

const DEFAULT_FILTERS = { events: [] as string[], q: "", sort: "stars" as SortKey };

export function HookBrowser({ hooks, events, meta }: { hooks: Hook[]; events: HookEvent[]; meta: MetaByRepo }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // This state is the single source of truth. The URL is only a mirror of it
  // (written below), so a click can never be computed from a stale URL.
  // It starts from the URL, which is what makes shared links work.
  const eventNames = events.map((e) => e.name);
  const [filters, setFilters] = useState(() => parseFilters(params, eventNames));
  // The query string this component last wrote (or last adopted) for itself.
  const lastQuery = useRef(buildQuery(filters));

  // Mirror the state into the address bar with the native History API, which Next
  // keeps in sync with useSearchParams. Debounced, so typing doesn't write the
  // URL on every keystroke. No navigation happens and no history entry is added.
  useEffect(() => {
    const timer = setTimeout(() => {
      const query = buildQuery(filters);
      lastQuery.current = query;
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    }, 250);
    return () => clearTimeout(timer);
  }, [filters, pathname]);

  // The other direction: if the URL changes from outside (a link to /?event=Stop
  // while this page is open), adopt it. Our own writes arrive here equal to
  // `lastQuery`, so they are ignored.
  useEffect(() => {
    const incoming = parseFilters(params, eventNames);
    const query = buildQuery(incoming);
    if (query === lastQuery.current) return;
    lastQuery.current = query;
    setFilters(incoming);
    // eventNames is derived from `events` on every render; `params` is what changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Functional updates always start from the latest state, so two quick clicks both count.
  function toggle(event: string) {
    setFilters((current) => ({
      ...current,
      events: current.events.includes(event)
        ? current.events.filter((e) => e !== event)
        : [...current.events, event],
    }));
  }

  const groupOf = Object.fromEntries(events.map((event) => [event.name, event.group]));
  const counts = eventCounts(hooks);
  // Only offer events that at least one hook handles (plus any already selected).
  const groups = new Map<string, HookEvent[]>();
  for (const event of events) {
    if (!counts[event.name] && !filters.events.includes(event.name)) continue;
    groups.set(event.group, [...(groups.get(event.group) ?? []), event]);
  }

  const visible = sortHooks(filterHooks(hooks, { events: filters.events, q: filters.q }), meta, filters.sort);
  const filtered = filters.events.length > 0 || filters.q.trim() !== "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Search hooks</span>
          <input
            ref={inputRef}
            type="search"
            value={filters.q}
            maxLength={MAX_QUERY_LENGTH}
            onChange={(e) => {
              const q = e.target.value;
              setFilters((current) => ({ ...current, q }));
            }}
            placeholder="Search hooks"
            className="w-full rounded-md border border-zinc-300 bg-transparent p-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Sort</span>
          <select
            value={filters.sort}
            onChange={(e) => {
              const sort = e.target.value as SortKey;
              setFilters((current) => ({ ...current, sort }));
            }}
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
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors sm:py-1 ${
                    on
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  {event.name} <span className={on ? "opacity-80" : "text-zinc-500"}>{counts[event.name] ?? 0}</span>
                  {/* `title` doesn't work on touch screens or for keyboard and screen-reader users. */}
                  <span className="sr-only">. {event.description}</span>
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
              setFilters(DEFAULT_FILTERS);
              // This button disappears once the filters are clear; without this,
              // keyboard focus would fall back to the top of the page.
              inputRef.current?.focus();
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
