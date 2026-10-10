import { Suspense } from "react";
import { HookBrowser } from "@/components/HookBrowser";
import { events, githubMeta, hooks } from "@/lib/hooks/load";

// The filters live in the URL (useSearchParams), so the browser sits inside
// <Suspense>; the page itself is a static shell.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">HookHub</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Community hooks for Claude Code, filterable by the event they react to. Every card links to the hook&apos;s
          GitHub repository.
        </p>
      </header>
      <Suspense fallback={<p className="text-zinc-500">Loading hooks…</p>}>
        <HookBrowser hooks={hooks} events={events} meta={githubMeta} />
      </Suspense>
    </main>
  );
}
