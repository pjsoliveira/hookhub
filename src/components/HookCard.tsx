import Link from "next/link";
import { repoUrl } from "@/lib/hooks/format";
import type { GithubMeta, Hook } from "@/lib/hooks/schema";

const MAX_EVENT_BADGES = 4;

// Fixed locale and time zone, so server and browser always print the same text.
export function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warn" }) {
  const styles =
    tone === "warn"
      ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>{children}</span>;
}

// Event badges are tinted by event group, so a card's behavior reads at a glance.
// Full class names (no string building) so Tailwind can find them.
const GROUP_TONES: Record<string, string> = {
  Session: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900",
  Prompt: "bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900",
  Tools: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900",
  "Agents & tasks": "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900",
  "Turn end": "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900",
  "Context & model": "bg-cyan-50 text-cyan-800 ring-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:ring-cyan-900",
  Worktrees: "bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700",
  MCP: "bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:ring-fuchsia-900",
};
const FALLBACK_TONE = "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700";

const INSTALL_LABELS = { plugin: "Plugin", settings: "Settings", script: "Script" } as const;

function EventBadge({ name, group }: { name: string; group?: string }) {
  const tone = GROUP_TONES[group ?? ""] ?? FALLBACK_TONE;
  return (
    <span className={`rounded-md px-2 py-0.5 font-mono text-xs ring-1 ring-inset ${tone}`}>{name}</span>
  );
}

// `groupOf` maps an event name to its group. It is passed in (not imported) so
// this component never pulls the catalog data into the client bundle.
export function HookCard({
  hook,
  meta,
  groupOf,
}: {
  hook: Hook;
  meta?: GithubMeta;
  groupOf: Record<string, string>;
}) {
  const shown = hook.events.slice(0, MAX_EVENT_BADGES);
  const hidden = hook.events.length - shown.length;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-600">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium uppercase tracking-wide text-zinc-500">{INSTALL_LABELS[hook.install]}</span>
          {meta?.archived && <Badge tone="warn">Archived</Badge>}
        </div>
        <h2 className="text-lg font-semibold leading-snug tracking-tight">
          <a
            href={repoUrl(hook.repo)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded underline-offset-4 outline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            {hook.name}
            <span className="sr-only"> (opens {hook.repo} on GitHub)</span>
            <span aria-hidden="true" className="text-zinc-400">
              {" "}
              ↗
            </span>
          </a>
        </h2>
      </div>

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{hook.description}</p>

      <ul className="flex flex-wrap gap-1.5" aria-label="Events">
        {shown.map((event) => (
          <li key={event}>
            <EventBadge name={event} group={groupOf[event]} />
          </li>
        ))}
        {hidden > 0 && (
          <li>
            <span className="rounded-md px-2 py-0.5 text-xs text-zinc-500">+{hidden} more</span>
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
        {meta ? (
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span>
              <span aria-hidden="true" className="text-amber-500">
                ★
              </span>{" "}
              {meta.stars.toLocaleString("en-US")}
              <span className="sr-only"> stars</span>
            </span>
            <span>{meta.license ?? "No license"}</span>
            <span>Updated {formatMonth(meta.pushedAt)}</span>
          </p>
        ) : (
          <span />
        )}
        <Link
          href={`/hooks/${hook.slug}`}
          className="shrink-0 rounded-md border border-zinc-200 px-2.5 py-1 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Details
          <span className="sr-only"> for {hook.name}</span>
        </Link>
      </div>
    </article>
  );
}
