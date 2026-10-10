# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev            # dev server on :3000 (one dev server per project)
npm test               # vitest: schema, catalog integrity, filter/sort/URL logic, and HookBrowser (jsdom)
npx vitest run src/lib/hooks/filter.test.ts   # a single test file
npm run typecheck && npm run lint
npm run build          # the real check: Cache Components errors only show up here
npm run refresh:github # regenerate data/github-meta.json from the GitHub API
```

## Architecture

A static catalog site. All data is JSON in `data/`, validated at build time by `src/lib/hooks/schema.ts` (`parseCatalog`: unique slugs and repos, and every event a hook lists must exist in `events.json`). `src/lib/hooks/load.ts` is the single place that imports the JSON.

- `src/lib/hooks/filter.ts` holds all filter, sort and URL-state logic as pure functions. Keep logic here, not in components, so it stays testable.
- `src/components/HookBrowser.tsx` is the only client component. Its React state is the source of truth; the URL mirrors it (debounced `history.replaceState`) and is adopted back when it changes from outside. It reads `useSearchParams`, so the home page renders it inside `<Suspense>`. Components must not import `@/lib/hooks/load` (it would ship the whole catalog to the browser); pass data in as props.
- Component tests live next to the component (`*.test.tsx`) and opt into jsdom with `// @vitest-environment jsdom`; `next/navigation` is mocked there.
- `src/app/hooks/[slug]/page.tsx` is statically generated from `hooks.json`.

## Rules for the catalog

- **Never guess a hook's events.** Read the repo's README and its hook config (`hooks/hooks.json` or `.claude/settings.json`) first. The seed entries were verified that way.
- **Before adding or re-checking any hook, run the `hook-verifier` agent** (`.claude/agents/hook-verifier.md`) on the repo. It is read-only: it reports a verdict with evidence and a proposed entry, and you make the edit. It also rejects repos that aren't focused hooks (guides, toolkits, marketplaces).
- `data/events.json` must match the official docs (https://code.claude.com/docs/en/hooks). Event names are case-sensitive.
- Set `verifiedAt` to the day you actually checked the events. Re-check an entry (and bump the date) when its repo changes.
- `data/github-meta.json` is generated; never edit it by hand. The build fails if a hook has no entry there, or an entry has no hook (`checkMeta`).
- Names and descriptions render as plain text. Don't switch them to HTML or markdown.

## Gotchas

- With `cacheComponents: true`, anything non-deterministic during prerender fails the build (`Math.random()`, `Date.now()`). That is why dates are formatted with a fixed locale and UTC (`formatMonth`) and why there is no "updated N days ago".
- Unknown `/hooks/<slug>` URLs return HTTP 200 with the not-found page and a `noindex` tag. That is documented Next.js behavior under Cache Components (`dynamicParams` is not supported there), not a bug.
- `vitest` 5 needs `@types/node` 22 or newer; this repo uses 24.

## Git

- This is a local repo with no remote. Commit directly to `main` when asked.
