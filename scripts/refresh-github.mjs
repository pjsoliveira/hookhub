// Refreshes data/github-meta.json (stars, license, language, last push, archived)
// for every repo in data/hooks.json. The site never calls GitHub at request time.
//
//   node scripts/refresh-github.mjs
//
// Set GITHUB_TOKEN to raise the rate limit (60/hour unauthenticated).
import { readFile, writeFile } from "node:fs/promises";

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
for (const { repo } of hooks) {
  const response = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!response.ok) {
    // Keep the last known data on a transient failure; report it either way.
    problems.push(`${repo}: HTTP ${response.status}`);
    if (previous[repo]) next[repo] = previous[repo];
    continue;
  }
  const data = await response.json();
  next[repo] = {
    stars: data.stargazers_count,
    license: data.license?.spdx_id && data.license.spdx_id !== "NOASSERTION" ? data.license.spdx_id : null,
    language: data.language ?? null,
    pushedAt: new Date(data.pushed_at).toISOString(),
    archived: Boolean(data.archived),
    fetchedAt: new Date().toISOString(),
  };
}

await writeFile(outPath, JSON.stringify(next, null, 2) + "\n");
console.log(`Updated ${Object.keys(next).length}/${hooks.length} repos`);
for (const [repo, meta] of Object.entries(next)) {
  if (meta.archived) problems.push(`${repo}: archived`);
}
if (problems.length > 0) {
  console.error("Problems:\n  " + problems.join("\n  "));
  process.exitCode = 1;
}
