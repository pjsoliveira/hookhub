// Particles variation: a fixed field of soft dots that slowly pulse and bob behind the content (motion-safe only).
import { events, hooks } from "@/lib/hooks/load";

type Particle = {
  x: number; // % from the left
  y: number; // % from the top
  size: number; // px
  opacity: number;
  motion: "pulse" | "bounce";
  duration: number; // seconds
  delay: number; // seconds
};

// Fixed positions: no Math.random(), so the output is identical on every render and build.
const PARTICLES: readonly Particle[] = [
  { x: 4, y: 12, size: 4, opacity: 0.5, motion: "pulse", duration: 4, delay: 0 },
  { x: 11, y: 70, size: 6, opacity: 0.35, motion: "bounce", duration: 9, delay: 1.2 },
  { x: 18, y: 38, size: 3, opacity: 0.6, motion: "pulse", duration: 5, delay: 2.1 },
  { x: 24, y: 88, size: 5, opacity: 0.4, motion: "pulse", duration: 6, delay: 0.7 },
  { x: 31, y: 18, size: 7, opacity: 0.25, motion: "bounce", duration: 11, delay: 3 },
  { x: 38, y: 58, size: 3, opacity: 0.55, motion: "pulse", duration: 4.5, delay: 1.7 },
  { x: 45, y: 8, size: 4, opacity: 0.45, motion: "pulse", duration: 7, delay: 2.6 },
  { x: 52, y: 80, size: 6, opacity: 0.3, motion: "bounce", duration: 10, delay: 0.4 },
  { x: 59, y: 30, size: 3, opacity: 0.6, motion: "pulse", duration: 5.5, delay: 3.4 },
  { x: 66, y: 64, size: 5, opacity: 0.4, motion: "pulse", duration: 6.5, delay: 1.1 },
  { x: 72, y: 14, size: 8, opacity: 0.2, motion: "bounce", duration: 12, delay: 2.2 },
  { x: 78, y: 48, size: 4, opacity: 0.5, motion: "pulse", duration: 4.2, delay: 0.2 },
  { x: 84, y: 84, size: 3, opacity: 0.55, motion: "pulse", duration: 5.8, delay: 3.1 },
  { x: 90, y: 26, size: 6, opacity: 0.3, motion: "bounce", duration: 9.5, delay: 1.9 },
  { x: 95, y: 62, size: 4, opacity: 0.45, motion: "pulse", duration: 6.2, delay: 2.8 },
  { x: 8, y: 50, size: 2, opacity: 0.6, motion: "pulse", duration: 3.8, delay: 0.9 },
  { x: 62, y: 92, size: 2, opacity: 0.5, motion: "pulse", duration: 4.8, delay: 2.4 },
  { x: 97, y: 6, size: 3, opacity: 0.5, motion: "pulse", duration: 5.2, delay: 1.5 },
];

export function HeroParticles() {
  // Counted from the catalog, so these numbers can never go stale.
  const eventsCovered = new Set(hooks.flatMap((hook) => hook.events)).size;

  const stats = [
    { label: "hooks listed", value: hooks.length },
    { label: `of ${events.length} events covered`, value: eventsCovered },
  ];

  return (
    <header className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-linear-to-b from-white to-sky-50 px-6 py-10 sm:px-10 sm:py-14 dark:border-zinc-800 dark:from-zinc-950 dark:to-sky-950/40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-sky-400 dark:bg-sky-300 ${
              p.motion === "pulse" ? "motion-safe:animate-pulse" : "motion-safe:animate-bounce"
            }`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="relative flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-300">
          Claude Code hooks
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">HookHub</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
          Community hooks for Claude Code, filterable by the event they react to. Every card links to the hook&apos;s
          GitHub repository.
        </p>
        <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</dt>
              <dd className="text-3xl font-semibold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
