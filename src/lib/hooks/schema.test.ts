import { describe, expect, it } from "vitest";
import eventsJson from "../../../data/events.json";
import hooksJson from "../../../data/hooks.json";
import metaJson from "../../../data/github-meta.json";
import { checkMeta, GithubMetaSchema, HookSchema, parseCatalog } from "./schema";

const events = [
  { name: "Stop", group: "Turn end & alerts", supportsMatcher: false, description: "x" },
  { name: "PreToolUse", group: "Tools", supportsMatcher: true, description: "x" },
];
const valid = {
  slug: "my-hook",
  name: "My hook",
  description: "Does a thing.",
  repo: "owner/name",
  events: ["Stop"],
  install: "plugin",
  addedAt: "2026-10-10",
  verifiedAt: "2026-10-10",
};

describe("HookSchema", () => {
  it("accepts a valid entry", () => {
    expect(HookSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["a bad slug", { slug: "Not Kebab" }],
    ["a repo that is a URL", { repo: "https://github.com/owner/name" }],
    ["a repo with no owner", { repo: "name" }],
    ["a description over 200 characters", { description: "x".repeat(201) }],
    ["no events", { events: [] }],
    ["an unknown install type", { install: "magic" }],
    ["a malformed date", { addedAt: "10/10/2026" }],
    ["a missing verification date", { verifiedAt: undefined }],
    ["a repo with a .. segment", { repo: "owner/.." }],
    ["a repo with a . segment", { repo: "./name" }],
    ["the same event listed twice", { events: ["Stop", "Stop"] }],
    ["an absurd number of events", { events: Array.from({ length: 41 }, (_, i) => `E${i}`) }],
    ["too many tags", { tags: Array.from({ length: 11 }, (_, i) => `t${i}`) }],
    ["an empty tag", { tags: [""] }],
  ])("rejects %s", (_label, patch) => {
    expect(HookSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});

describe("parseCatalog", () => {
  it("rejects an event that is not in the catalog", () => {
    expect(() => parseCatalog(events, [{ ...valid, events: ["NotARealEvent"] }])).toThrow(/unknown event/);
  });

  it("rejects duplicate slugs and duplicate repos (case-insensitive)", () => {
    expect(() => parseCatalog(events, [valid, { ...valid, repo: "other/repo" }])).toThrow(/Duplicate slug/);
    expect(() => parseCatalog(events, [valid, { ...valid, slug: "two", repo: "OWNER/Name" }])).toThrow(/Duplicate repo/);
  });
});

describe("parseCatalog: event names", () => {
  it("rejects a duplicate event name in the event catalog", () => {
    expect(() => parseCatalog([...events, events[0]], [valid])).toThrow(/Duplicate event name/);
  });
});

describe("GithubMetaSchema", () => {
  const ok = {
    stars: 1,
    license: null,
    language: null,
    pushedAt: "2026-10-01T00:00:00.000Z",
    archived: false,
    fetchedAt: "2026-10-10T00:00:00.000Z",
  };

  it("accepts valid metadata, including a null license", () => {
    expect(GithubMetaSchema.safeParse(ok).success).toBe(true);
    expect(GithubMetaSchema.safeParse({ ...ok, license: "NOASSERTION" }).success).toBe(true);
  });

  it.each([
    ["negative stars", { stars: -1 }],
    ["fractional stars", { stars: 1.5 }],
    ["a non-date push time", { pushedAt: "yesterday" }],
    ["a 1970-style number for a date", { pushedAt: 0 }],
    ["a missing archived flag", { archived: undefined }],
    ["a missing fetch time", { fetchedAt: undefined }],
  ])("rejects %s", (_label, patch) => {
    expect(GithubMetaSchema.safeParse({ ...ok, ...patch }).success).toBe(false);
  });
});

describe("checkMeta", () => {
  const hook = HookSchema.parse(valid);

  it("passes when every hook has metadata and nothing is left over", () => {
    expect(() => checkMeta([hook], { "owner/name": {} })).not.toThrow();
  });

  it("fails when a hook has no metadata", () => {
    expect(() => checkMeta([hook], {})).toThrow(/refresh:github/);
  });

  it("fails on metadata for a hook that is no longer listed", () => {
    expect(() => checkMeta([hook], { "owner/name": {}, "gone/repo": {} })).toThrow(/gone\/repo/);
  });
});

describe("the real catalog", () => {
  // The count is checked on purpose: when Claude Code adds an event, update
  // data/events.json and this number together, so a stale catalog can't slip by.
  it("is valid and has the 33 documented events", () => {
    const { events: e, hooks } = parseCatalog(eventsJson, hooksJson);
    expect(e).toHaveLength(33);
    expect(hooks.length).toBeGreaterThan(0);
  });

  it("has GitHub metadata for every hook", () => {
    const { hooks } = parseCatalog(eventsJson, hooksJson);
    const meta = metaJson as Record<string, unknown>;
    for (const hook of hooks) {
      expect(GithubMetaSchema.safeParse(meta[hook.repo]).success, hook.repo).toBe(true);
    }
  });
});
