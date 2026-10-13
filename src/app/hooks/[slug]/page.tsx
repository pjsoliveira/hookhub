import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, formatMonth } from "@/components/HookCard";
import { licenseLabel } from "@/lib/hooks/format";
import { events, getHook, githubMeta, hooks, repoUrl } from "@/lib/hooks/load";
import { hookPath } from "@/lib/seo";

export function generateStaticParams() {
  return hooks.map((hook) => ({ slug: hook.slug }));
}

export async function generateMetadata({ params }: PageProps<"/hooks/[slug]">): Promise<Metadata> {
  const hook = getHook((await params).slug);
  return hook
    ? { title: hook.name, description: hook.description, alternates: { canonical: hookPath(hook.slug) } }
    : {};
}

const INSTALL_NOTES = {
  plugin: "Installed as a Claude Code plugin. Follow the plugin install steps in the repository's README.",
  settings: "Installed by copying its hook entries into a Claude Code settings.json. See the repository's README.",
  script: "Installed with a script or package from the repository. See its README for the exact command.",
} as const;

export default async function HookPage({ params }: PageProps<"/hooks/[slug]">) {
  const hook = getHook((await params).slug);
  if (!hook) notFound();

  const meta = githubMeta[hook.repo];
  const hookEvents = events.filter((event) => hook.events.includes(event.name));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm underline underline-offset-4">
        ← All hooks
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{hook.name}</h1>
          {meta?.archived && <Badge tone="warn">Archived</Badge>}
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">{hook.description}</p>
        <p>
          <a
            href={repoUrl(hook.repo)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            {hook.repo} on GitHub ↗
          </a>
        </p>
        {meta && (
          <p className="text-sm text-zinc-500">
            ★ {meta.stars.toLocaleString("en-US")} · {licenseLabel(meta.license)}
            {meta.language ? ` · ${meta.language}` : ""} · Updated {formatMonth(meta.pushedAt)}
            <br />
            Stars and license as of {formatMonth(meta.fetchedAt)}.
          </p>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Events ({hookEvents.length})</h2>
        <p className="text-sm text-zinc-500">
          Checked against the repository&apos;s hook configuration in {formatMonth(hook.verifiedAt)}. Repositories
          change, so check the README for the current list.
        </p>
        <ul className="flex flex-col gap-2">
          {hookEvents.map((event) => (
            <li key={event.name} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="font-medium">
                <Link href={`/?event=${event.name}`} className="underline underline-offset-4">
                  {event.name}
                </Link>
                <span className="ml-2 text-xs font-normal text-zinc-500">{event.group}</span>
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {event.description}.{" "}
                {event.supportsMatcher ? "Supports matchers." : "No matcher; it applies every time."}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Installing</h2>
        <p className="text-zinc-600 dark:text-zinc-400">{INSTALL_NOTES[hook.install]}</p>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Hooks run commands on your computer with your permissions. Read a hook&apos;s code before you install it.
        </p>
      </section>
    </main>
  );
}
