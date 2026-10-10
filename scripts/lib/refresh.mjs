// The logic behind scripts/refresh-github.mjs, split out so it can be tested.
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { GithubMetaSchema } from "../../src/lib/hooks/schema.ts";

export const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Reads the previous metadata. A missing file is a normal first run, so it gives {}.
 * Any other problem (a corrupt file, a permissions error) throws instead: treating it
 * as "no previous data" would let the refresh silently overwrite data we could still save.
 */
export async function loadPrevious(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

/** Writes to a temp file, then renames it into place, so a crash can't leave a half-written file. */
export async function writeAtomic(path, text) {
  const temp = `${path}.tmp`;
  try {
    await writeFile(temp, text);
    await rename(temp, path);
  } catch (error) {
    await rm(temp, { force: true }).catch(() => {}); // best effort: never mask the real error
    throw error;
  }
}

/**
 * GitHub signals rate limiting with 429, or with 403 plus a header: x-ratelimit-remaining: 0
 * (primary limit) or retry-after (secondary limit). A bare 403 is something else, for
 * example no access to that one repository, and must not stop the whole run.
 */
export function isRateLimited(response) {
  if (response.status === 429) return true;
  if (response.status !== 403) return false;
  return response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after");
}

/**
 * If nothing changed and the old fetch was in the same month, keep the old `fetchedAt`.
 * The site only shows the month, so this stays accurate while a quiet week produces no
 * commit at all instead of a timestamp-only one.
 */
export function stable(entry, old) {
  if (!old) return entry;
  const unchanged = ["stars", "license", "language", "pushedAt", "archived"].every((key) => old[key] === entry[key]);
  const sameMonth = old.fetchedAt.slice(0, 7) === entry.fetchedAt.slice(0, 7);
  return unchanged && sameMonth ? { ...entry, fetchedAt: old.fetchedAt } : entry;
}

/**
 * Fetches metadata for every hook. One bad repo never aborts the run: its last known data
 * is kept and the problem is reported. Returns { next, problems }.
 */
export async function refreshAll({ hooks, previous, token, fetchImpl = fetch, now = () => new Date() }) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "hookhub-refresh" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const next = {};
  const problems = [];
  const keepPrevious = (repo) => {
    if (previous[repo]) next[repo] = previous[repo];
  };

  for (const { repo } of hooks) {
    let response;
    try {
      response = await fetchImpl(`https://api.github.com/repos/${repo}`, {
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      problems.push(`${repo}: request failed (${error?.name ?? "error"})`);
      keepPrevious(repo);
      continue;
    }

    if (isRateLimited(response)) {
      // Asking again only makes it worse. Keep what we have for the rest.
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
        fetchedAt: now().toISOString(),
      });
      next[repo] = stable(entry, previous[repo]);
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
  return { next, problems };
}
