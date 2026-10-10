import { describe, expect, it } from "vitest";
import eventsJson from "../../../data/events.json";
import hooksJson from "../../../data/hooks.json";
import metaJson from "../../../data/github-meta.json";
import { GithubMetaSchema, HookSchema, parseCatalog } from "./schema";

const events = [
  { name: "Stop", group: "Turn end", supportsMatcher: false, description: "x" },
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

describe("the real catalog", () => {
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
