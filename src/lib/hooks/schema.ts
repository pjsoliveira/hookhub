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
  repo: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "owner/name"),
  events: z.array(z.string()).min(1),
  matchers: z.array(z.string()).optional(),
  install: z.enum(["plugin", "settings", "script"]),
  tags: z.array(z.string()).optional(),
  addedAt: z.iso.date(),
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

  const known = new Set(events.map((e) => e.name));
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
