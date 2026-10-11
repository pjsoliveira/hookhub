// Spotlight variation: a soft light follows the pointer and reveals a faint dotted grid (decoration only).
import { events, hooks } from "@/lib/hooks/load";
import { HeroSpotlightFrame } from "./HeroSpotlightFrame";

export function HeroSpotlight() {
  // Counted from the catalog, so these numbers can never go stale.
  const eventsCovered = new Set(hooks.flatMap((hook) => hook.events)).size;

  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: eventsCovered },
  ];

  return (
    <HeroSpotlightFrame>
      <header className="flex flex-col gap-4 px-4 py-8 sm:px-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-800 dark:text-sky-300">
          Claude Code hooks
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">HookHub</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
          Community hooks for Claude Code, filterable by the event they react to. Every card links to the
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
      </header>
    </HeroSpotlightFrame>
  );
}
