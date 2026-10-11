// Typer variation: the headline cycles through real hook event names with a typewriter effect (client child).
import { events, hooks } from "@/lib/hooks/load";
import { HeroTyperText } from "./HeroTyperText";

export function HeroTyper() {
  // Counted from the catalog, so these numbers can never go stale.
  const used = new Set(hooks.flatMap((hook) => hook.events));
  const eventsCovered = used.size;
  const names = events
    .filter((event) => used.has(event.name))
    .slice(0, 6)
    .map((event) => event.name);

  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: eventsCovered },
  ];

  return (
    <header className="rounded-2xl border border-zinc-200 bg-linear-to-br from-zinc-50 via-white to-sky-50 px-4 py-8 sm:px-10 sm:py-14 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-sky-950/40">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-800 dark:text-sky-300">
          Claude Code hooks
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">HookHub</h1>
        <HeroTyperText names={names} />
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
          Community hooks for Claude Code, filterable by the event they react to. Every card links to the hook&apos;s
          GitHub repository.
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
