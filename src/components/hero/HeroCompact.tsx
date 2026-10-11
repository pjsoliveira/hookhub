// Compact hero variation: one slim band for people who want the hooks immediately.
import { events, hooks } from "@/lib/hooks/load";

export function HeroCompact() {
  // Counted from the catalog, so these numbers can never go stale.
  const eventsCovered = new Set(hooks.flatMap((hook) => hook.events)).size;

  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: eventsCovered },
  ];

  return (
    <header className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">HookHub</h1>
        <p className="text-sm leading-snug text-zinc-600 dark:text-zinc-400">
          Community Claude Code hooks, filterable by event. Every card links to the hook&apos;s GitHub repository.
        </p>
      </div>
      <dl className="flex shrink-0 flex-wrap gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-row-reverse items-baseline justify-end gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <dt className="text-zinc-600 dark:text-zinc-400">{stat.label}</dt>
            <dd className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
