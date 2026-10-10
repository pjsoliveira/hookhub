import Link from "next/link";
import { repoUrl } from "@/lib/hooks/load";
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

export function HookCard({ hook, meta }: { hook: Hook; meta?: GithubMeta }) {
  const shown = hook.events.slice(0, MAX_EVENT_BADGES);
  const hidden = hook.events.length - shown.length;
  const facts = [
    meta ? `★ ${meta.stars.toLocaleString("en-US")}` : null,
    meta ? (meta.license ?? "No license") : null,
    meta ? `Updated ${formatMonth(meta.pushedAt)}` : null,
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold leading-snug">
          <a
            href={repoUrl(hook.repo)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline focus-visible:underline"
          >
            {hook.name}
            <span className="sr-only"> (opens {hook.repo} on GitHub)</span>
            <span aria-hidden="true"> ↗</span>
          </a>
        </h2>
        {meta?.archived && <Badge tone="warn">Archived</Badge>}
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{hook.description}</p>

      <ul className="flex flex-wrap gap-1.5" aria-label="Events">
        {shown.map((event) => (
          <li key={event}>
            <Badge>{event}</Badge>
          </li>
        ))}
        {hidden > 0 && (
          <li>
            <Badge>+{hidden} more</Badge>
          </li>
        )}
      </ul>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-zinc-500">
        <span>{facts.join(" · ")}</span>
        <Link href={`/hooks/${hook.slug}`} className="font-medium underline underline-offset-4">
          Details
          <span className="sr-only"> for {hook.name}</span>
        </Link>
      </div>
    </article>
  );
}
