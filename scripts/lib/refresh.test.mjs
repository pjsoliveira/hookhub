import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isRateLimited, loadPrevious, refreshAll, stable, writeAtomic } from "./refresh.mjs";

let dir;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "hookhub-refresh-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("loadPrevious", () => {
  it("treats a missing file as a first run", async () => {
    expect(await loadPrevious(join(dir, "nope.json"))).toEqual({});
  });

  it("reads a valid file", async () => {
    const path = join(dir, "meta.json");
    await writeFile(path, JSON.stringify({ "a/a": { stars: 1 } }));
    expect(await loadPrevious(path)).toEqual({ "a/a": { stars: 1 } });
  });

  it.each([
    ["git conflict markers", "<<<<<<< HEAD\n{}\n=======\n{}\n>>>>>>> branch\n"],
    ["a truncated write", '{"a/a": {"stars": 1'],
    ["an empty file", ""],
  ])("does NOT treat %s as a first run (it would overwrite recoverable data)", async (_label, content) => {
    const path = join(dir, "meta.json");
    await writeFile(path, content);
    await expect(loadPrevious(path)).rejects.toThrow();
  });

  it("does not swallow other read errors either (a directory where the file should be)", async () => {
    const path = join(dir, "meta.json");
    await mkdir(path);
    await expect(loadPrevious(path)).rejects.toThrow();
  });
});

describe("writeAtomic", () => {
  it("writes the file and leaves no temp file behind", async () => {
    const path = join(dir, "meta.json");
    await writeAtomic(path, "hello\n");
    expect(await readFile(path, "utf8")).toBe("hello\n");
    expect(await readdir(dir)).toEqual(["meta.json"]);
  });

  it("replaces an existing file", async () => {
    const path = join(dir, "meta.json");
    await writeFile(path, "old");
    await writeAtomic(path, "new");
    expect(await readFile(path, "utf8")).toBe("new");
  });

  it("never touches the existing file when it can't write its temp file", async () => {
    // A write done in place would already have destroyed the old content by the time it fails.
    const path = join(dir, "meta.json");
    await writeFile(path, "precious old data");
    await mkdir(`${path}.tmp`); // the temp file can't be created here
    await expect(writeAtomic(path, "new data")).rejects.toThrow();
    expect(await readFile(path, "utf8")).toBe("precious old data");
  });

  it("cleans up its temp file and rethrows when it can't finish", async () => {
    const path = join(dir, "meta.json");
    await mkdir(path); // renaming a file over a directory fails
    await expect(writeAtomic(path, "x")).rejects.toThrow();
    expect(await readdir(dir)).toEqual(["meta.json"]); // no stray .tmp
  });
});

describe("isRateLimited", () => {
  const response = (status, headers = {}) => new Response("", { status, headers });

  it.each([
    ["429", response(429), true],
    ["403 with no quota left", response(403, { "x-ratelimit-remaining": "0" }), true],
    ["403 with retry-after (secondary limit)", response(403, { "retry-after": "60" }), true],
    ["a bare 403 (for example no access to one repo)", response(403), false],
    ["403 with quota remaining", response(403, { "x-ratelimit-remaining": "42" }), false],
    ["404", response(404), false],
    ["200", response(200), false],
  ])("%s", (_label, res, expected) => {
    expect(isRateLimited(res)).toBe(expected);
  });
});

describe("stable", () => {
  const old = { stars: 5, license: "MIT", language: "Python", pushedAt: "2026-10-01T00:00:00.000Z", archived: false, fetchedAt: "2026-10-03T10:00:00.000Z" };

  it("keeps the old fetchedAt when nothing changed in the same month", () => {
    const fresh = { ...old, fetchedAt: "2026-10-17T10:00:00.000Z" };
    expect(stable(fresh, old).fetchedAt).toBe(old.fetchedAt);
  });

  it("takes the new fetchedAt in a new month, or when anything changed", () => {
    expect(stable({ ...old, fetchedAt: "2026-11-02T00:00:00.000Z" }, old).fetchedAt).toBe("2026-11-02T00:00:00.000Z");
    expect(stable({ ...old, stars: 6, fetchedAt: "2026-10-17T00:00:00.000Z" }, old).stars).toBe(6);
  });

  it("uses the new entry when there is no old one", () => {
    expect(stable(old, undefined)).toBe(old);
  });
});

describe("refreshAll", () => {
  const hooks = [{ repo: "a/a" }, { repo: "b/b" }, { repo: "c/c" }];
  const good = (stars) => new Response(JSON.stringify({ stargazers_count: stars, license: { spdx_id: "MIT" }, language: "JS", pushed_at: "2026-10-01T00:00:00Z", archived: false }));
  const prev = (stars) => ({ stars, license: "MIT", language: "JS", pushedAt: "2026-09-01T00:00:00.000Z", archived: false, fetchedAt: "2026-09-01T00:00:00.000Z" });
  const now = () => new Date("2026-10-10T12:00:00Z");
  /** A fake GitHub: `routes` maps "owner/name" to a function that returns a Response (or throws). */
  const fakeFetch = (routes, calls = []) => async (url) => {
    const repo = url.replace("https://api.github.com/repos/", "");
    calls.push(repo);
    return routes[repo]();
  };

  it("collects data for every repo when all goes well", async () => {
    const { next, problems } = await refreshAll({
      hooks, previous: {}, now,
      fetchImpl: fakeFetch({ "a/a": () => good(1), "b/b": () => good(2), "c/c": () => good(3) }),
    });
    expect(problems).toEqual([]);
    expect(Object.keys(next)).toEqual(["a/a", "b/b", "c/c"]);
    expect(next["b/b"].stars).toBe(2);
    expect(next["a/a"].fetchedAt).toBe("2026-10-10T12:00:00.000Z");
  });

  it("a bare 403 on one repo skips ONLY that repo (it is not a rate limit)", async () => {
    const calls = [];
    const { next, problems } = await refreshAll({
      hooks, previous: { "b/b": prev(9) }, now,
      fetchImpl: fakeFetch({ "a/a": () => good(1), "b/b": () => new Response("", { status: 403 }), "c/c": () => good(3) }, calls),
    });
    expect(calls).toEqual(["a/a", "b/b", "c/c"]); // the run went on to c/c
    expect(next["b/b"].stars).toBe(9); // kept its last known data
    expect(next["c/c"].stars).toBe(3);
    expect(problems).toEqual(["b/b: HTTP 403"]);
  });

  it("a real rate limit stops early, asks no more questions, and keeps the rest", async () => {
    const calls = [];
    const { next, problems } = await refreshAll({
      hooks, previous: { "b/b": prev(8), "c/c": prev(7) }, now,
      fetchImpl: fakeFetch({
        "a/a": () => good(1),
        "b/b": () => new Response("", { status: 403, headers: { "x-ratelimit-remaining": "0" } }),
        "c/c": () => good(3),
      }, calls),
    });
    expect(calls).toEqual(["a/a", "b/b"]); // never asked about c/c
    expect(next["b/b"].stars).toBe(8);
    expect(next["c/c"].stars).toBe(7);
    expect(problems[0]).toContain("rate limited");
  });

  it("survives a network error, bad JSON and a null pushed_at, keeping old data", async () => {
    const { next, problems } = await refreshAll({
      hooks, previous: { "a/a": prev(1), "b/b": prev(2), "c/c": prev(3) }, now,
      fetchImpl: fakeFetch({
        "a/a": () => { throw Object.assign(new Error("boom"), { name: "TimeoutError" }); },
        "b/b": () => new Response("<html>oops</html>"),
        "c/c": () => new Response(JSON.stringify({ stargazers_count: 9, pushed_at: null })),
      }),
    });
    expect([next["a/a"].stars, next["b/b"].stars, next["c/c"].stars]).toEqual([1, 2, 3]);
    expect(problems).toHaveLength(3);
  });

  it("reports an archived repo, and a repo with no data at all", async () => {
    const archived = () => new Response(JSON.stringify({ stargazers_count: 1, license: null, language: null, pushed_at: "2026-10-01T00:00:00Z", archived: true }));
    const { next, problems } = await refreshAll({
      hooks: [{ repo: "a/a" }, { repo: "b/b" }], previous: {}, now,
      fetchImpl: fakeFetch({ "a/a": archived, "b/b": () => new Response("", { status: 404 }) }),
    });
    expect(next["a/a"].archived).toBe(true);
    expect(problems).toEqual(["a/a: archived", "b/b: HTTP 404", "b/b: no metadata (never fetched, nothing to keep)"]);
  });

  it("sends the token as a Bearer header, and nothing else carries it", async () => {
    let seen;
    await refreshAll({
      hooks: [{ repo: "a/a" }], previous: {}, token: "secret-token", now,
      fetchImpl: async (url, options) => { seen = { url, headers: options.headers }; return good(1); },
    });
    expect(seen.headers.Authorization).toBe("Bearer secret-token");
    expect(seen.url).not.toContain("secret-token");
  });
});
