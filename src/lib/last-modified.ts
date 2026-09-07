import { execFileSync } from "child_process";

/**
 * Last commit date touching any of the given paths, for sitemap <lastmod>.
 *
 * Falls back to build time when git is unavailable or the history is too
 * shallow to answer (Vercel clones are shallow), so a missing .git can never
 * break the build. The fallback trades accuracy for safety; the git answer
 * is what makes <lastmod> a signal Google can trust.
 */
export function lastCommitDate(paths: string[]): Date {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...paths],
      { stdio: ["ignore", "pipe", "ignore"] }
    )
      .toString()
      .trim();
    if (out) return new Date(out);
  } catch {
    // fall through to build time
  }
  return new Date();
}
