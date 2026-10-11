import type { Metadata } from "next";
import { Hero } from "@/components/hero/Hero";
import { HeroBold } from "@/components/hero/HeroBold";
import { HeroCentered } from "@/components/hero/HeroCentered";
import { HeroCompact } from "@/components/hero/HeroCompact";
import { HeroMesh } from "@/components/hero/HeroMesh";
import { HeroParticles } from "@/components/hero/HeroParticles";
import { HeroWaveform } from "@/components/hero/HeroWaveform";

// A throwaway comparison page for choosing a hero. Each variation renders its own <h1>, which the
// hero spec forbids on a real page, so this one is kept out of search results. Delete it once a
// hero is chosen.
export const metadata: Metadata = {
  title: "Hero variations",
  robots: { index: false, follow: false },
};

const VARIATIONS = [
  { name: "Hero (original)", Component: Hero },
  { name: "HeroCentered", Component: HeroCentered },
  { name: "HeroCompact", Component: HeroCompact },
  { name: "HeroBold", Component: HeroBold },
  { name: "HeroWaveform", Component: HeroWaveform },
  { name: "HeroParticles", Component: HeroParticles },
  { name: "HeroMesh", Component: HeroMesh },
];

export default function HeroesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
      <p className="text-sm text-zinc-500">
        {VARIATIONS.length} hero variations, one after another. To use one, import it in{" "}
        <code>src/app/page.tsx</code>.
      </p>
      {VARIATIONS.map(({ name, Component }) => (
        <section key={name} className="flex flex-col gap-3">
          <h2 className="font-mono text-sm font-semibold text-zinc-500">{name}</h2>
          <Component />
        </section>
      ))}
    </main>
  );
}
