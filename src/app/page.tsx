import { Suspense } from "react";
import { Hero } from "@/components/hero/Hero";
import { HeroBold } from "@/components/hero/HeroBold";
import { HeroCentered } from "@/components/hero/HeroCentered";
import { HeroCompact } from "@/components/hero/HeroCompact";
import { HeroExplorer } from "@/components/hero/HeroExplorer";
import { HeroMesh } from "@/components/hero/HeroMesh";
import { HeroParticles } from "@/components/hero/HeroParticles";
import { HeroSpotlight } from "@/components/hero/HeroSpotlight";
import { HeroTyper } from "@/components/hero/HeroTyper";
import { HeroWaveform } from "@/components/hero/HeroWaveform";
import { HookBrowser } from "@/components/HookBrowser";
import { events, githubMeta, hooks } from "@/lib/hooks/load";

// TEMPORARY: every hero one after another, to compare them and choose one. Each renders its own
// <h1>, which the hero spec forbids on a real page. Keep only the chosen hero afterwards.
const HERO_VARIATIONS = [
  { name: "Hero (original)", Component: Hero },
  { name: "HeroCentered", Component: HeroCentered },
  { name: "HeroCompact", Component: HeroCompact },
  { name: "HeroBold", Component: HeroBold },
  { name: "HeroWaveform", Component: HeroWaveform },
  { name: "HeroParticles", Component: HeroParticles },
  { name: "HeroMesh", Component: HeroMesh },
  { name: "HeroTyper", Component: HeroTyper },
  { name: "HeroSpotlight", Component: HeroSpotlight },
  { name: "HeroExplorer", Component: HeroExplorer },
];

// The filters live in the URL (useSearchParams), so the browser sits inside
// <Suspense>; the page itself is a static shell.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      {HERO_VARIATIONS.map(({ name, Component }) => (
        <section key={name} className="flex flex-col gap-2">
          <p className="font-mono text-xs font-semibold text-zinc-500">{name}</p>
          <Component />
        </section>
      ))}
      <Suspense fallback={<p className="text-zinc-500">Loading hooks…</p>}>
        <HookBrowser hooks={hooks} events={events} meta={githubMeta} />
      </Suspense>
    </main>
  );
}
