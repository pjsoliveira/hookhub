import type { GithubMeta, Hook } from "./schema";

export type SortKey = "stars" | "updated" | "newest" | "name";
export const SORT_KEYS: SortKey[] = ["stars", "updated", "newest", "name"];

/** The longest search text we accept, in the box, in the URL and when parsing. */
export const MAX_QUERY_LENGTH = 100;

export type MetaByRepo = Record<string, GithubMeta | undefined>;

export type Filters = {
  /** A hook matches when it handles ANY of these events. Empty = all hooks. */
  events: string[];
  q: string;
};

export function filterHooks(hooks: Hook[], { events, q }: Filters): Hook[] {
  const needle = q.trim().toLowerCase();
  return hooks.filter((hook) => {
    if (events.length > 0 && !events.some((event) => hook.events.includes(event))) return false;
    if (!needle) return true;
    // Event names and the repo are searchable too, so "PreToolUse" or "disler" find things.
    const haystack = [hook.name, hook.description, hook.repo, ...hook.events, ...(hook.tags ?? [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function sortHooks(hooks: Hook[], meta: MetaByRepo, sort: SortKey): Hook[] {
  const stars = (h: Hook) => meta[h.repo]?.stars ?? -1;
  const pushed = (h: Hook) => meta[h.repo]?.pushedAt ?? "";
  const compare: Record<SortKey, (a: Hook, b: Hook) => number> = {
    stars: (a, b) => stars(b) - stars(a),
    updated: (a, b) => pushed(b).localeCompare(pushed(a)),
    newest: (a, b) => b.addedAt.localeCompare(a.addedAt),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  // Ties fall back to name so the order is stable.
  return [...hooks].sort((a, b) => compare[sort](a, b) || a.name.localeCompare(b.name));
}

/** How many hooks handle each event (for the count on each filter chip). */
export function eventCounts(hooks: Hook[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const hook of hooks) for (const event of hook.events) counts[event] = (counts[event] ?? 0) + 1;
  return counts;
}

/** Reads filters from URL search params, ignoring anything invalid. */
export function parseFilters(params: URLSearchParams, knownEvents: string[]) {
  const known = new Set(knownEvents);
  const events = [...new Set(params.getAll("event"))].filter((e) => known.has(e));
  const q = (params.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);
  // find() returns one of our own constants, so no cast is needed.
  const sort = SORT_KEYS.find((key) => key === params.get("sort")) ?? "stars";
  return { events, q, sort };
}

export function buildQuery({ events, q, sort }: { events: string[]; q: string; sort: SortKey }) {
  const params = new URLSearchParams();
  for (const event of events) params.append("event", event);
  if (q.trim()) params.set("q", q.trim().slice(0, MAX_QUERY_LENGTH));
  if (sort !== "stars") params.set("sort", sort);
  return params.toString();
}
