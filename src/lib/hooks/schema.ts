import { z } from "zod";

export const EventSchema = z.object({
  name: z.string().regex(/^[A-Za-z]+$/),
  group: z.string().min(1),
  supportsMatcher: z.boolean(),
  description: z.string().min(1),
});
export type HookEvent = z.infer<typeof EventSchema>;

// Plain text only: names and descriptions are rendered as text, never as HTML.
export const HookSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case"),
  name: z.string().min(1).max(80),
  description: z.string().min(1).max(200),
  // owner/name only, so every link goes to https://github.com/{repo}
  repo: z
    .string()
    .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "owner/name")
    .refine((repo) => repo.split("/").every((part) => part !== "." && part !== ".."), "no . or .. segments"),
  events: z
    .array(z.string())
    .min(1)
    .max(40)
    .refine((list) => new Set(list).size === list.length, "events must be unique"),
  install: z.enum(["plugin", "settings", "script"]),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  addedAt: z.iso.date(),
  // The day someone last checked `events` against the repo's real hook config.
  // Repos change, so the list is a dated snapshot, and the site says so.
  verifiedAt: z.iso.date(),
});
export type Hook = z.infer<typeof HookSchema>;

export const GithubMetaSchema = z.object({
  stars: z.number().int().nonnegative(),
  license: z.string().nullable(),
  language: z.string().nullable(),
  pushedAt: z.iso.datetime(),
  archived: z.boolean(),
  fetchedAt: z.iso.datetime(),
});
export type GithubMeta = z.infer<typeof GithubMetaSchema>;

/**
 * Validates the whole catalog: every entry parses, slugs and repos are unique,
 * and every event a hook lists exists in the event catalog.
 */
export function parseCatalog(rawEvents: unknown, rawHooks: unknown) {
  const events = z.array(EventSchema).parse(rawEvents);
  const hooks = z.array(HookSchema).parse(rawHooks);

  const known = new Set<string>();
  for (const event of events) {
    if (known.has(event.name)) throw new Error(`Duplicate event name: ${event.name}`);
    known.add(event.name);
  }
  const slugs = new Set<string>();
  const repos = new Set<string>();
  for (const hook of hooks) {
    if (slugs.has(hook.slug)) throw new Error(`Duplicate slug: ${hook.slug}`);
    if (repos.has(hook.repo.toLowerCase())) throw new Error(`Duplicate repo: ${hook.repo}`);
    slugs.add(hook.slug);
    repos.add(hook.repo.toLowerCase());
    for (const event of hook.events) {
      if (!known.has(event)) throw new Error(`${hook.slug}: unknown event "${event}"`);
    }
  }
  return { events, hooks };
}

/**
 * Every hook needs GitHub metadata, and metadata for a hook that no longer
 * exists is leftover data. Both fail the build so the two files can't drift.
 */
export function checkMeta(hooks: Hook[], meta: Record<string, unknown>) {
  const repos = new Set(hooks.map((hook) => hook.repo));
  for (const repo of repos) {
    if (!(repo in meta)) throw new Error(`No GitHub metadata for ${repo}. Run: npm run refresh:github`);
  }
  for (const key of Object.keys(meta)) {
    if (!repos.has(key)) throw new Error(`github-meta.json has an entry for ${key}, which is not in hooks.json`);
  }
}
