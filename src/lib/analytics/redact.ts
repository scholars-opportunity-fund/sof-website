// Shared with posthog-core and tracker-core, so the sof-website repo keeps a
// byte-identical copy (relative imports only; website-copy.test.ts checks).
import { ANALYTICS_LIMITS } from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LONG_HEX = /^[0-9a-f]{16,}$/i;
const LONG_DIGITS = /^\d{6,}$/;
// Anything that could be a person's handle or a bearer secret in a URL segment.
const EMAILISH = /@|%40/i;
const OPAQUE = /^[A-Za-z0-9_-]{32,}$/;

export interface RedactedUrl {
  /** Path with identifying segments replaced, plus only utm_* query params. */
  path: string;
  utm: Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content", string>>;
  /**
   * The campaign id from /vigil/entry/<uuid>, or from the vigil_campaign
   * marker that entry route adds to its redirect. It names outreach, not a person.
   */
  vigilCampaign: string | null;
}

function segment(value: string, previous: string | undefined, beforePrevious: string | undefined): string {
  if (previous === "invite" && beforePrevious === "mentoring" && /^[0-9a-f]{64}$/i.test(value)) return ":token";
  if (previous === "entry" && beforePrevious === "vigil" && UUID.test(value)) return ":code";
  if (UUID.test(value) || LONG_HEX.test(value) || LONG_DIGITS.test(value) || EMAILISH.test(value) || OPAQUE.test(value)) return ":id";
  return value;
}

/**
 * Reduces a URL or path to what analytics may keep: no fragment, no query
 * except utm_* campaign tags, and every token-, id- or email-shaped segment
 * replaced by a placeholder. Invitation tokens and entry codes get named
 * placeholders so those funnels still group.
 */
export function redactUrl(input: string): RedactedUrl {
  let url: URL;
  try { url = new URL(input, "https://analytics.invalid"); } catch { return { path: "/", utm: {}, vigilCampaign: null }; }
  const parts = url.pathname.split("/");
  let vigilCampaign: string | null = null;
  const redacted = parts.map((part, index) => {
    if (!part) return part;
    const next = segment(part, parts[index - 1], parts[index - 2]);
    if (next === ":code") vigilCampaign = part.toLowerCase();
    return next;
  });
  // The entry route is a server redirect the tracker never sees, so it tags the destination instead.
  const marker = url.searchParams.get("vigil_campaign");
  if (!vigilCampaign && marker && UUID.test(marker)) vigilCampaign = marker.toLowerCase();
  const utm: RedactedUrl["utm"] = {};
  const kept = new URLSearchParams();
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const) {
    const value = url.searchParams.get(key)?.trim().slice(0, ANALYTICS_LIMITS.maxUtm);
    // A campaign tag that is itself email- or token-shaped is dropped, not stored.
    if (!value || EMAILISH.test(value) || OPAQUE.test(value)) continue;
    utm[key] = value;
    kept.set(key, value);
  }
  const query = kept.toString();
  const path = (redacted.join("/") || "/") + (query ? `?${query}` : "");
  return { path: path.slice(0, ANALYTICS_LIMITS.maxPath), utm, vigilCampaign };
}

/** Path-only convenience wrapper around redactUrl. */
export function redactPath(input: string): string {
  return redactUrl(input).path;
}

const DOWNLOAD_KINDS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "zip"] as const;

/**
 * A download is labelled by file type only: filenames can name a person
 * ("Jane_Doe_Recommendation.pdf"). Anything unrecognised is just "file".
 */
export function downloadLabel(nameOrPath: string): string {
  const extension = /\.([a-z0-9]{1,5})$/i.exec(nameOrPath.trim())?.[1]?.toLowerCase();
  const bare = nameOrPath.trim().toLowerCase();
  const kind = extension ?? bare;
  return (DOWNLOAD_KINDS as readonly string[]).includes(kind) ? kind : "file";
}
