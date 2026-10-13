import { describe, expect, it } from "vitest";
import { buildRobots, buildSitemap, hookPath } from "./seo";
import type { Hook } from "./hooks/schema";

const SITE = "https://example.test";

function hook(slug: string, addedAt = "2026-10-01", verifiedAt = "2026-10-02"): Hook {
  return {
    slug,
    name: slug,
    description: "A hook.",
    repo: `owner/${slug}`,
    events: ["Stop"],
    install: "plugin",
    addedAt,
    verifiedAt,
  };
}

describe("buildSitemap", () => {
  it("lists the home page first, then one URL per hook", () => {
    const urls = buildSitemap([hook("b-hook"), hook("a-hook")], SITE).map((entry) => entry.url);
    expect(urls).toEqual([`${SITE}/`, `${SITE}/hooks/a-hook`, `${SITE}/hooks/b-hook`]);
  });

  it("is sorted by slug, whatever order the catalog is in", () => {
    const a = buildSitemap([hook("x"), hook("y"), hook("z")], SITE);
    const b = buildSitemap([hook("z"), hook("x"), hook("y")], SITE);
    expect(a).toEqual(b);
  });

  it("uses each hook's verifiedAt as its last-modified date", () => {
    const entry = buildSitemap([hook("a-hook", "2026-10-01", "2026-10-09")], SITE).find((e) =>
      e.url.endsWith("/hooks/a-hook"),
    );
    expect(entry?.lastModified).toBe("2026-10-09");
  });

  it("dates the home page with the newest date in the catalog", () => {
    const sitemap = buildSitemap(
      [hook("a", "2026-10-01", "2026-10-05"), hook("b", "2026-10-12", "2026-10-03")],
      SITE,
    );
    expect(sitemap[0].lastModified).toBe("2026-10-12");
  });

  it("still lists the home page for an empty catalog, without a date", () => {
    expect(buildSitemap([], SITE)).toEqual([{ url: `${SITE}/` }]);
  });

  it("has no duplicate URLs and only absolute https URLs", () => {
    const urls = buildSitemap([hook("a"), hook("b"), hook("c")], SITE).map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) expect(url.startsWith("https://")).toBe(true);
  });

  it("produces dates that are real calendar dates", () => {
    for (const entry of buildSitemap([hook("a")], SITE)) {
      expect(Number.isNaN(Date.parse(String(entry.lastModified)))).toBe(false);
    }
  });
});

describe("hookPath", () => {
  it("is the path of a hook's page", () => {
    expect(hookPath("prompt-improver")).toBe("/hooks/prompt-improver");
  });

  it("matches the sitemap URL, so the canonical tag and the sitemap always agree", () => {
    const urls = buildSitemap([hook("a-hook")], SITE).map((entry) => entry.url);
    expect(urls).toContain(`${SITE}${hookPath("a-hook")}`);
  });
});

describe("buildRobots", () => {
  it("allows every crawler to read the whole site", () => {
    expect(buildRobots(SITE).rules).toEqual({ userAgent: "*", allow: "/" });
  });

  it("points crawlers at the sitemap with an absolute URL", () => {
    expect(buildRobots(SITE).sitemap).toBe(`${SITE}/sitemap.xml`);
  });
});
