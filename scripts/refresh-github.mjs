// Refreshes data/github-meta.json (stars, license, language, last push, archived)
// for every repo in data/hooks.json. The site never calls GitHub at request time.
//
//   node scripts/refresh-github.mjs
//
// Needs Node 22.18 or newer (it imports the site's TypeScript schema directly).
// Set GITHUB_TOKEN to raise the rate limit (60/hour unauthenticated).
//
// One bad repo never aborts the run: its last known data is kept and the problem
// is reported. Every entry is validated against the same schema the site uses
// before it is written. Exit code 1 means "something needs a look".
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadPrevious, refreshAll, writeAtomic } from "./lib/refresh.mjs";

const hooksPath = fileURLToPath(new URL("../data/hooks.json", import.meta.url));
const outPath = fileURLToPath(new URL("../data/github-meta.json", import.meta.url));

const hooks = JSON.parse(await readFile(hooksPath, "utf8"));

let previous;
try {
  previous = await loadPrevious(outPath);
} catch (error) {
  // The file exists but can't be used. Stop: continuing would overwrite data we might still recover.
  console.error(`data/github-meta.json exists but could not be read (${error.message}).`);
  console.error("Fix it (for example `git checkout data/github-meta.json`) or delete it, then run again.");
  process.exit(1);
}

const { next, problems } = await refreshAll({ hooks, previous, token: process.env.GITHUB_TOKEN });

await writeAtomic(outPath, JSON.stringify(next, null, 2) + "\n");
console.log(`Wrote metadata for ${Object.keys(next).length}/${hooks.length} repos`);
if (problems.length > 0) {
  console.error("Problems:\n  " + problems.join("\n  "));
  process.exitCode = 1;
}
