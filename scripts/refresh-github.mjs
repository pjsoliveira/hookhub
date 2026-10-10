// Refreshes data/github-meta.json (stars, license, language, last push, archived)
// for every repo in data/hooks.json. The site never calls GitHub at request time.
//
//   node scripts/refresh-github.mjs
//
// Set GITHUB_TOKEN to raise the rate limit (60/hour unauthenticated).
//
// One bad repo never aborts the run: its last known data is kept and the
// problem is reported. Every entry is validated against the same schema the
// site uses before it is written. Exit code 1 means "something needs a look".
import { readFile, writeFile } from "node:fs/promises";
import { GithubMetaSchema } from "../src/lib/hooks/schema.ts";

const REQUEST_TIMEOUT_MS = 15_000;

const hooks = JSON.parse(await readFile(new URL("../data/hooks.json", import.meta.url), "utf8"));
const outPath = new URL("../data/github-meta.json", import.meta.url);

let previous = {};
try {
  previous = JSON.parse(await readFile(outPath, "utf8"));
} catch {
  // first run
}

const headers = { Accept: "application/vnd.github+json", "User-Agent": "hookhub-refresh" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const next = {};
const problems = [];

/** Keeps the last known data for a repo, if there is any. */
function keepPrevious(repo) {
  if (previous[repo]) next[repo] = previous[repo];
}

for (const { repo } of hooks) {
  let response;
  try {
    response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    problems.push(`${repo}: request failed (${error?.name ?? "error"})`);
    keepPrevious(repo);
    continue;
  }

  if (response.status === 403 || response.status === 429) {
    // Rate limited: asking again only makes it worse. Keep what we have for the rest.
    problems.push(`${repo}: HTTP ${response.status}, rate limited; stopped early`);
    for (const rest of hooks) if (!next[rest.repo]) keepPrevious(rest.repo);
    break;
  }
  if (!response.ok) {
    problems.push(`${repo}: HTTP ${response.status}`);
    keepPrevious(repo);
    continue;
  }

  try {
    const data = await response.json();
    // new Date(null) is 1970-01-01, not an error, so check explicitly (empty repos have no pushed_at).
    if (typeof data.pushed_at !== "string") throw new TypeError("missing pushed_at");
    const entry = GithubMetaSchema.parse({
      stars: data.stargazers_count,
      // null = no license file; "NOASSERTION" = a license file GitHub can't classify.
      license: data.license?.spdx_id ?? null,
      language: data.language ?? null,
      pushedAt: new Date(data.pushed_at).toISOString(),
      archived: Boolean(data.archived),
      fetchedAt: new Date().toISOString(),
    });
    next[repo] = entry;
    if (entry.archived) problems.push(`${repo}: archived`);
  } catch (error) {
    // A non-JSON body, a null pushed_at (empty repo), or a value the schema rejects.
    problems.push(`${repo}: unusable response (${error?.name ?? "error"})`);
    keepPrevious(repo);
  }
}

// Every listed hook must end up with metadata, or the site's checks will fail.
for (const { repo } of hooks) {
  if (!next[repo]) problems.push(`${repo}: no metadata (never fetched, nothing to keep)`);
}

await writeFile(outPath, JSON.stringify(next, null, 2) + "\n");
console.log(`Wrote metadata for ${Object.keys(next).length}/${hooks.length} repos`);
if (problems.length > 0) {
  console.error("Problems:\n  " + problems.join("\n  "));
  process.exitCode = 1;
}
