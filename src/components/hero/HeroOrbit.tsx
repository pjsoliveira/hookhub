// Orbit variation, in the Anthropic-style palette: a warm cream panel with a large Poppins title, an orange
// squiggle, and a slowly turning ring of dots around the HookHub mark. Follows hero/SPEC.md.
import { events, hooks } from "@/lib/hooks/load";

const MAX_EVENT_PILLS = 6;

// Dot positions on the ring (angle in degrees), the brand accent for each, and its size.
// Fixed values: nothing random, so the server render is always the same.
const RING_DOTS = [
  { angle: 0, color: "#d97757", r: 7 },
  { angle: 60, color: "#6a9bcc", r: 5 },
  { angle: 120, color: "#788c5d", r: 6 },
  { angle: 180, color: "#d97757", r: 5 },
  { angle: 240, color: "#6a9bcc", r: 7 },
  { angle: 300, color: "#788c5d", r: 5 },
] as const;

const CENTER = 160;
const RING_RADIUS = 118;

function ringDotPosition(angleDegrees: number) {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: Math.round((CENTER + RING_RADIUS * Math.cos(radians)) * 100) / 100,
    y: Math.round((CENTER + RING_RADIUS * Math.sin(radians)) * 100) / 100,
  };
}

export function HeroOrbit() {
  // Counted from the catalog, so these numbers can never go stale.
  const usedEvents = [...new Set(hooks.flatMap((hook) => hook.events))];
  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: usedEvents.length },
  ];
  const eventPills = usedEvents.slice(0, MAX_EVENT_PILLS);

  return (
    <header className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-zinc-900 sm:px-10 sm:py-14 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl dark:bg-sky-500/10"
      />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-5">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-zinc-700 motion-safe:animate-fade-up dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-sky-500" />
            Community hooks for Claude Code
          </p>

          <div style={{ animationDelay: "100ms" }} className="motion-safe:animate-fade-up">
            <h1 className="text-6xl font-semibold leading-none tracking-tight sm:text-8xl">HookHub</h1>
            <svg
              aria-hidden="true"
              viewBox="0 0 240 16"
              className="mt-3 h-4 w-48 text-sky-500 sm:w-60"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 10 C 24 2, 36 2, 56 10 S 88 18, 108 10 S 140 2, 160 10 S 192 18, 212 10 S 230 6, 236 8" />
            </svg>
          </div>

          <p
            style={{ animationDelay: "200ms" }}
            className="max-w-xl text-xl leading-relaxed text-zinc-700 motion-safe:animate-fade-up dark:text-zinc-300"
          >
            Find hooks by the event they react to. Every card links to the hook&apos;s GitHub repository.
          </p>

          <dl
            style={{ animationDelay: "300ms" }}
            className="mt-1 flex flex-wrap gap-x-12 gap-y-4 motion-safe:animate-fade-up"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-zinc-700 dark:text-zinc-400">{stat.label}</dt>
                <dd className="font-[family-name:var(--font-heading)] text-5xl font-semibold leading-none tabular-nums text-sky-700 dark:text-sky-400">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <ul
            aria-label="Some of the events hooks react to"
            style={{ animationDelay: "400ms" }}
            className="flex flex-wrap gap-2 motion-safe:animate-fade-up"
          >
            {eventPills.map((name) => (
              <li
                key={name}
                className="rounded-md bg-zinc-200 px-2 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true" className="mx-auto w-full max-w-xs motion-safe:animate-fade-up" style={{ animationDelay: "200ms" }}>
          <svg viewBox="0 0 320 320" className="h-auto w-full">
            {/* Static outer guide ring. */}
            <circle cx={CENTER} cy={CENTER} r={RING_RADIUS} fill="none" stroke="#b0aea5" strokeOpacity="0.5" strokeDasharray="3 7" />
            {/* The turning ring: dots only, so nothing readable is ever upside down. */}
            <g className="origin-center [transform-box:fill-box] motion-safe:animate-[spin_60s_linear_infinite]">
              {RING_DOTS.map((dot) => {
                const { x, y } = ringDotPosition(dot.angle);
                return <circle key={dot.angle} cx={x} cy={y} r={dot.r} fill={dot.color} />;
              })}
            </g>
            {/* The HookHub mark in the middle. */}
            <circle cx={CENTER} cy={CENTER} r="62" fill="#141413" />
            <circle cx={CENTER} cy={CENTER} r="62" fill="none" stroke="#d97757" strokeOpacity="0.35" strokeWidth="2" className="motion-safe:animate-pulse" />
            <path
              d="M171 125 V158 C171 170 163.5 177 155 177 C146.5 177 140 171 140 163 V158"
              fill="none"
              stroke="#d97757"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="171" cy="125" r="5" fill="#faf9f5" />
          </svg>
        </div>
      </div>
    </header>
  );
}
