import type { MetadataRoute } from "next";
import type { Hook } from "./hooks/schema";

// Pure builders for robots.txt and sitemap.xml, kept apart from src/app so they
// can be tested. Nothing here may be non-deterministic (no `new Date()`): with
// Cache Components, that fails the prerender. Dates come from the catalog.

/** One URL for the home page and one per hook, in a stable order. */
export function buildSitemap(hooks: Hook[], siteUrl: string): MetadataRoute.Sitemap {
  // ISO dates (YYYY-MM-DD) sort correctly as plain strings.
  const newest = hooks
    .flatMap((hook) => [hook.addedAt, hook.verifiedAt])
    .sort()
    .at(-1);

  const hookPages = [...hooks]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((hook) => ({ url: `${siteUrl}/hooks/${hook.slug}`, lastModified: hook.verifiedAt }));

  return [{ url: `${siteUrl}/`, ...(newest ? { lastModified: newest } : {}) }, ...hookPages];
}

/** Everything is public, so allow all crawlers and point them at the sitemap. */
export function buildRobots(siteUrl: string): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
