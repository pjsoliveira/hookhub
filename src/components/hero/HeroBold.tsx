// Bold variation: an always-dark "terminal" panel with a monospace eyebrow, a huge title and large-numeral stats.
import { events, hooks } from "@/lib/hooks/load";

export function HeroBold() {
  // Counted from the catalog, so these numbers can never go stale.
  const eventsCovered = new Set(hooks.flatMap((hook) => hook.events)).size;

  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: eventsCovered },
  ];

  return (
    <header className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 px-6 py-10 text-zinc-100 sm:px-10 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-size-[2rem_2rem] mask-[radial-gradient(ellipse_at_top_right,black,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl motion-safe:animate-pulse"
      />
      <div className="relative flex flex-col gap-5">
        <p className="font-mono text-sm font-medium text-emerald-400">
          <span aria-hidden="true">$ </span>claude hooks list
          <span aria-hidden="true" className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-emerald-400 motion-safe:animate-pulse" />
        </p>
        <h1 className="text-6xl font-black leading-none tracking-tighter sm:text-8xl">HookHub</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-300">
          Community hooks for Claude Code, filterable by the event they react to. Every card links to the hook&apos;s
          GitHub repository.
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-12 gap-y-6 border-t border-zinc-800 pt-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1">
              <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">{stat.label}</dt>
              <dd className="text-6xl font-bold leading-none tabular-nums text-emerald-400 sm:text-7xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
