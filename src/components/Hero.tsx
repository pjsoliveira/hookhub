import { events, hooks } from "@/lib/hooks/load";

export function Hero() {
  // Counted from the catalog, so these numbers can never go stale.
  const eventsCovered = new Set(hooks.flatMap((hook) => hook.events)).size;

  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: eventsCovered },
  ];

  return (
    <header className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-linear-to-br from-zinc-50 via-white to-sky-50 px-6 py-10 sm:px-10 sm:py-14 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-sky-950/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10"
      />
      <div className="relative flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-300">
          Claude Code hooks
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">HookHub</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Community hooks for Claude Code, filterable by the event they react to. Every card links to the hook&apos;s
          GitHub repository.
        </p>
        <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="text-sm text-zinc-500">{stat.label}</dt>
              <dd className="text-3xl font-semibold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
