// Mesh variation: soft overlapping blurred color blobs (slow drift) behind a frosted text panel.
import { events, hooks } from "@/lib/hooks/load";

export function HeroMesh() {
  // Counted from the catalog, so these numbers can never go stale.
  const eventsCovered = new Set(hooks.flatMap((hook) => hook.events)).size;

  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: eventsCovered },
  ];

  return (
    <header className="relative isolate overflow-hidden rounded-2xl border border-zinc-200 bg-white px-4 py-8 sm:px-10 sm:py-14 dark:border-zinc-800 dark:bg-zinc-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-sky-300/70 blur-3xl motion-safe:animate-[spin_40s_linear_infinite] sm:h-80 sm:w-80 dark:bg-sky-500/30" />
        <div className="absolute -right-16 top-0 h-72 w-72 rounded-full bg-violet-300/70 blur-3xl motion-safe:animate-pulse sm:h-96 sm:w-96 dark:bg-violet-500/30" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emerald-300/70 blur-3xl motion-safe:animate-[spin_60s_linear_infinite_reverse] sm:h-80 sm:w-80 dark:bg-emerald-500/25" />
        <div className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-amber-200/80 blur-3xl dark:bg-amber-500/20" />
      </div>
      <div className="flex flex-col gap-4 rounded-xl border border-white/60 bg-white/75 p-5 backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-zinc-950/70">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-800 dark:text-sky-300">
          Claude Code hooks
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">HookHub</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
          Community hooks for Claude Code, filterable by the event they react to. Every card points to the
          hook&apos;s GitHub repository.
        </p>
        <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="text-sm text-zinc-700 dark:text-zinc-300">{stat.label}</dt>
              <dd className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
