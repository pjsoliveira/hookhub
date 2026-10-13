import type { MetadataRoute } from "next";
import { hooks } from "@/lib/hooks/load";
import { buildSitemap } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(hooks, SITE_URL);
}
