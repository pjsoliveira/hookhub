// Centered, editorial hero variation: calm typography, a soft glow behind the title, stats as a quiet divided row.
import { events, hooks } from "@/lib/hooks/load";

export function HeroCentered() {
  // Counted from the catalog, so these numbers can never go stale.
  const eventsCovered = new Set(hooks.flatMap((hook) => hook.events)).size;

  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: eventsCovered },
  ];

  return (
    <header className="relative overflow-hidden px-4 py-12 text-center sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-sky-200/60 to-transparent to-70% blur-2xl dark:from-sky-500/15"
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 dark:text-sky-300">
          Claude Code hooks
        </p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">HookHub</h1>
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Community hooks for Claude Code, filterable by the event they react to. Every card links to the hook&apos;s
          GitHub repository.
        </p>
        <dl className="mt-3 flex divide-x divide-zinc-300 dark:divide-zinc-700">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse items-center gap-1 px-6 sm:px-10">
              <dt className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</dt>
              <dd className="text-3xl font-light tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
