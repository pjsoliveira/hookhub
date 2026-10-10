// Small display helpers. Keep this file free of imports from ./load: client
// components import it, and ./load would pull the whole catalog into the browser.

export function repoUrl(repo: string) {
  return `https://github.com/${repo}`;
}

/**
 * GitHub reports `null` when a repo has no license file, and "NOASSERTION"
 * when it has one it cannot classify. Those are different statements, so the
 * label must not call a custom license "No license".
 */
export function licenseLabel(license: string | null) {
  if (license === null) return "No license";
  if (license === "NOASSERTION") return "Custom license";
  return license;
}
