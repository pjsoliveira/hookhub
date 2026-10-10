import eventsJson from "../../../data/events.json";
import hooksJson from "../../../data/hooks.json";
import metaJson from "../../../data/github-meta.json";
import { GithubMetaSchema, parseCatalog } from "./schema";
import type { MetaByRepo } from "./filter";
import { z } from "zod";

// Validated once at build time. A bad catalog entry fails the build instead of
// shipping a broken card.
const catalog = parseCatalog(eventsJson, hooksJson);
const meta: MetaByRepo = z.record(z.string(), GithubMetaSchema).parse(metaJson);

export const events = catalog.events;
export const hooks = catalog.hooks;
export const githubMeta = meta;

export function getHook(slug: string) {
  return hooks.find((hook) => hook.slug === slug);
}

export function repoUrl(repo: string) {
  return `https://github.com/${repo}`;
}
