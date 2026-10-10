// Small display helpers. Keep this file free of imports from ./load: client
// components import it, and ./load would pull the whole catalog into the browser.

export function repoUrl(repo: string) {
  return `https://github.com/${repo}`;
}
