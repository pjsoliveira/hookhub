# Hero component spec

The hero is the top block of the HookHub home page (`/`). This file describes what the current `Hero.tsx` does and the rules every **variation** of it must follow. If you change the contract, change this file in the same commit.

> Path note: the component lives at `src/components/hero/Hero.tsx` (singular `hero`, `.tsx`).

## Goals

1. **Say what HookHub is in one glance:** a catalog of community Claude Code hooks, filterable by the event they react to, where every card links to the hook's GitHub repository.
2. **Prove the catalog is real** with live numbers: how many hooks are listed and how many of the hook events they cover.
3. **Get out of the way.** The hooks are the product. The hero must not push the filter bar and cards far down the page, and must not need JavaScript.

## What the current component does

- Renders a `<header>` with:
  - a small label, "Claude Code hooks";
  - the page title, an `<h1>` reading "HookHub";
  - a one-sentence tagline;
  - two stats in a `<dl>`: **hooks listed** (`hooks.length`) and **"of N events covered"** (the number of distinct events used by at least one hook, with N = `events.length`).
- Reads the catalog itself through `@/lib/hooks/load` (`hooks`, `events`). The numbers are **counted, never typed in**, so they cannot go stale.
- Is a **server component**: no `"use client"`, no state, no effects, no event handlers, no network calls.
- Has a decorative blurred circle in the corner (`aria-hidden`, `pointer-events-none`), a light gradient background, a border and rounded corners, with `dark:` colors for dark mode.
- Visual order of each stat is value on top, label underneath (`flex-col-reverse`), while the DOM order stays `<dt>` label first, then `<dd>` value, which is the correct semantic order for a screen reader.

## Contract every variation must keep

### Content
| Rule | Why |
|---|---|
| Exactly **one `<h1>`** on the home page, in the hero, with the text "HookHub" (or the product name if it ever changes). | `HookCard` uses `<h2>`, so the hero is the only `<h1>` on `/`. Two or zero hurts accessibility and SEO. |
| Keep a short tagline that mentions **filtering by event** and **links to GitHub repositories**. Wording and length may change. | It is the one-line explanation of the product. |
| Keep both stats, or a deliberate subset. If you drop one, say why in the variation's header comment. | Stats are the proof the catalog is alive. |
| Stats are **derived from the catalog** (`hooks`, `events`). Never hard-code a number. | A hard-coded count is wrong the next time someone adds a hook. |
| Text is **plain text**. No `dangerouslySetInnerHTML`, no markdown rendering. Escape apostrophes in JSX (`&apos;`). | Project rule: names and descriptions render as plain text; also the lint rule `react/no-unescaped-entities`. |

### Rendering
- **Server component by default.** Do not add `"use client"` for something CSS can do. If a variation truly needs client behavior (an animation with state, say), put only that part in a small client child component, and pass data to it as **props**.
- A client component must **never import `@/lib/hooks/load`**: that would ship the whole catalog to the browser. Server components (like the current hero) may import it.
- No `Math.random()`, `Date.now()` or `new Date()` during render. With `cacheComponents: true` the build fails on them. No "updated N days ago" text for the same reason.
- No data fetching and no request-time APIs (`cookies()`, `headers()`, `searchParams`). The home page is a static shell; the hero must not make it dynamic.
- No images, web fonts or third-party scripts. The hero should add **no extra network requests** and cause **no layout shift**.

### Accessibility
- Use landmark and list semantics: `<header>` (or `<section>` with an accessible name), `<h1>`, and `<dl>/<dt>/<dd>` for label/value pairs.
- Purely decorative elements get `aria-hidden="true"` and `pointer-events-none`.
- Text contrast must pass WCAG AA (4.5:1 for body text, 3:1 for large text) in **both** light and dark mode. Check the muted gray text on the gradient, since that is where it usually fails.
- Nothing may depend on color alone, and nothing may animate without respecting `prefers-reduced-motion` (use `motion-safe:` / `motion-reduce:`).
- If the hero gets a link or button, it must be reachable by keyboard with a visible focus ring.

### Layout and style
- Tailwind 4 utilities only (note the v4 name `bg-linear-to-br`, not `bg-gradient-to-br`). No new CSS files.
- Mobile first. It must hold at **375 px** wide with no horizontal scroll, and be fully usable at that width. Use the `sm:` and larger breakpoints to scale up.
- Match the page container: the home `<main>` already sets `max-w-6xl` and horizontal padding, so the hero fills its parent and sets **no outer margin or fixed width**.
- Keep the hero's height modest (about one screen height at most on a phone) so the filters stay visible without a long scroll.
- Both color schemes must be designed: every light color has a `dark:` counterpart.

## How to add a variation

1. Create the file next to the original, named by what makes it different: `src/components/hero/HeroCentered.tsx`, exporting `HeroCentered`. Keep `Hero` as the default.
2. Make it a **drop-in replacement**: no required props, same stats, same single `<h1>`. The page switches by changing one import in `src/app/page.tsx`.
3. Prefer sharing the stat calculation over copying it. If two variations need the same numbers, extract a small pure helper (for example `getHeroStats(hooks, events)` returning `{ hooksListed, eventsCovered, eventsTotal }`) and test it. Do not duplicate the `new Set(hooks.flatMap(...))` line in each file.
4. Leave a one-line comment at the top saying what the variation is for.

## Testing and checks

Existing tests cover logic and `HookBrowser`; the hero has none yet. For a variation, at minimum:

- a component test (`*.test.tsx`, with `// @vitest-environment jsdom` at the top) that renders it and asserts: exactly one `h1`, the stats show the counts computed from the catalog, and no `<a>` or button is added by accident;
- if you extract `getHeroStats`, unit-test it with a tiny fixture (empty catalog, hooks that share an event, an event no hook uses).

Before committing:

```bash
npm run typecheck && npm run lint && npm test
npm run build   # the real check: Cache Components errors only show up here
```

Then look at it in the browser at 375 px and at desktop width, in light and dark mode.

## Out of scope

Search or filters (they live in `HookBrowser`), navigation, authentication, announcements or banners, and any call to the GitHub API at request time.
