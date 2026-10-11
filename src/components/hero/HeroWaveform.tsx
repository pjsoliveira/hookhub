// Waveform variation: a calm audio-waveform of sky/indigo bars behind the title, pulsing gently only for motion-safe users.
import { events, hooks } from "@/lib/hooks/load";

// Fixed bar heights (% of the bar area), shaped like a soft waveform. Constant on purpose: no randomness at render time.
const BAR_HEIGHTS = [
  18, 30, 24, 42, 56, 38, 64, 78, 52, 40, 58, 72, 90, 66, 48, 34, 46, 62, 84, 70, 54, 36, 28, 44, 60, 76, 58, 42, 32, 50,
  68, 54, 38, 26, 34, 22, 30, 20, 16, 12,
];

export function HeroWaveform() {
  // Counted from the catalog, so these numbers can never go stale.
  const eventsCovered = new Set(hooks.flatMap((hook) => hook.events)).size;

  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: eventsCovered },
  ];

  return (
    <header className="relative overflow-hidden rounded-2xl border border-sky-200 bg-linear-to-br from-sky-50 via-white to-indigo-50 px-6 py-10 sm:px-10 sm:py-14 dark:border-indigo-900 dark:from-slate-950 dark:via-zinc-950 dark:to-indigo-950/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex h-4/5 items-center gap-[3px] px-2 opacity-40 sm:gap-1 sm:px-4 dark:opacity-30"
      >
        {BAR_HEIGHTS.map((height, index) => (
          <span
            key={index}
            style={{ height: `${height}%`, animationDelay: `${(index % 8) * 150}ms` }}
            className={`min-w-0 flex-1 rounded-full motion-safe:animate-pulse ${
              index % 3 === 0 ? "bg-indigo-400 dark:bg-indigo-500" : "bg-sky-300 dark:bg-sky-500"
            }`}
          />
        ))}
      </div>
      <div className="relative flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-800 dark:text-sky-300">Claude Code hooks</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">HookHub</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
          Community hooks for Claude Code, filterable by the event they react to. Every card links to the hook&apos;s
          GitHub repository.
        </p>
        <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{stat.label}</dt>
              <dd className="text-3xl font-semibold tabular-nums text-indigo-900 dark:text-indigo-200">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
