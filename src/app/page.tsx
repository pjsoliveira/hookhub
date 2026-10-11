import { Suspense } from "react";
import { HeroExplorer } from "@/components/hero/HeroExplorer";
import { HookBrowser } from "@/components/HookBrowser";
import { events, githubMeta, hooks } from "@/lib/hooks/load";

// The filters live in the URL (useSearchParams), so the browser sits inside
// <Suspense>; the page itself is a static shell.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <HeroExplorer />
      <Suspense fallback={<p className="text-zinc-500">Loading hooks…</p>}>
        <HookBrowser hooks={hooks} events={events} meta={githubMeta} />
      </Suspense>
    </main>
  );
}
