import { describe, expect, it } from "vitest";
import { buildQuery, eventCounts, filterHooks, parseFilters, sortHooks, type MetaByRepo } from "./filter";
import type { Hook } from "./schema";

const make = (slug: string, events: string[], extra: Partial<Hook> = {}): Hook => ({
  slug,
  name: slug.toUpperCase(),
  description: `The ${slug} hook`,
  repo: `o/${slug}`,
  events,
  install: "plugin",
  addedAt: "2026-10-01",
  ...extra,
});

const a = make("alpha", ["Stop"], { tags: ["voice"], addedAt: "2026-10-03" });
const b = make("bravo", ["PreToolUse", "Stop"], { addedAt: "2026-10-01" });
const c = make("charlie", ["SessionStart"], { addedAt: "2026-10-02" });
const all = [a, b, c];

const meta = (stars: number, pushedAt: string) => ({
  stars,
  license: null,
  language: null,
  pushedAt,
  archived: false,
  fetchedAt: "2026-10-10T00:00:00.000Z",
});
const metaByRepo: MetaByRepo = {
  "o/alpha": meta(5, "2026-09-01T00:00:00.000Z"),
  "o/bravo": meta(50, "2026-08-01T00:00:00.000Z"),
  // charlie has no metadata
};

describe("filterHooks", () => {
  it("returns everything when nothing is selected", () => {
    expect(filterHooks(all, { events: [], q: "" })).toHaveLength(3);
  });

  it("matches hooks that handle ANY selected event", () => {
    expect(filterHooks(all, { events: ["Stop"], q: "" }).map((h) => h.slug)).toEqual(["alpha", "bravo"]);
    expect(filterHooks(all, { events: ["Stop", "SessionStart"], q: "" })).toHaveLength(3);
  });

  it("searches name, description and tags, ignoring case and surrounding spaces", () => {
    expect(filterHooks(all, { events: [], q: "  VOICE " }).map((h) => h.slug)).toEqual(["alpha"]);
    expect(filterHooks(all, { events: [], q: "the charlie" }).map((h) => h.slug)).toEqual(["charlie"]);
  });

  it("combines event and text filters", () => {
    expect(filterHooks(all, { events: ["Stop"], q: "bravo" }).map((h) => h.slug)).toEqual(["bravo"]);
    expect(filterHooks(all, { events: ["SessionStart"], q: "alpha" })).toEqual([]);
  });
});

describe("sortHooks", () => {
  it("sorts by stars, with hooks that have no metadata last", () => {
    expect(sortHooks(all, metaByRepo, "stars").map((h) => h.slug)).toEqual(["bravo", "alpha", "charlie"]);
  });

  it("sorts by last push, newest first", () => {
    expect(sortHooks(all, metaByRepo, "updated").map((h) => h.slug)).toEqual(["alpha", "bravo", "charlie"]);
  });

  it("sorts by date added and by name, without mutating the input", () => {
    const copy = [...all];
    expect(sortHooks(all, metaByRepo, "newest").map((h) => h.slug)).toEqual(["alpha", "charlie", "bravo"]);
    expect(sortHooks(all, metaByRepo, "name").map((h) => h.slug)).toEqual(["alpha", "bravo", "charlie"]);
    expect(all).toEqual(copy);
  });
});

describe("eventCounts", () => {
  it("counts hooks per event", () => {
    expect(eventCounts(all)).toEqual({ Stop: 2, PreToolUse: 1, SessionStart: 1 });
  });
});

describe("URL state", () => {
  const known = ["Stop", "PreToolUse"];

  it("parses events, query and sort, ignoring unknown values", () => {
    const params = new URLSearchParams("event=Stop&event=Stop&event=Bogus&q=hi&sort=name");
    expect(parseFilters(params, known)).toEqual({ events: ["Stop"], q: "hi", sort: "name" });
    expect(parseFilters(new URLSearchParams("sort=nope"), known).sort).toBe("stars");
  });

  it("round-trips through the query string and omits defaults", () => {
    const state = { events: ["Stop", "PreToolUse"], q: "format", sort: "updated" as const };
    expect(parseFilters(new URLSearchParams(buildQuery(state)), known)).toEqual(state);
    expect(buildQuery({ events: [], q: "", sort: "stars" })).toBe("");
  });
});
