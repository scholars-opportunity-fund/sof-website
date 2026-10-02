// Browser-side record of the analytics banner choice, shared by both trackers,
// the consent banner and the PostHog loader. Stored in a first-party cookie
// "sof_consent" (12 months, SameSite=Lax, Secure over https) with a
// localStorage mirror under the same key, both holding
// {"v":1,"analytics":true|false,"ts":<epoch ms>,"ver":"<banner version>"}.
// The cookie records only the choice itself, never an identifier. A choice made
// under an older ANALYTICS_CONSENT_VERSION, or more than 12 months ago, reads
// as "unset", so a changed notice asks again. The sof-website repo keeps a
// byte-identical copy.
import { ANALYTICS_CONSENT_VERSION } from "./types";

export type ConsentChoice = "granted" | "denied" | "unset";
export const CONSENT_STORAGE_KEY = "sof_consent";
export const CONSENT_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;
const CHANGE_EVENT = "sof:consent-change";
const OPEN_EVENT = "sof:consent-open";

/** The stored shape. `v` versions the format; `ver` is the banner wording it answered. */
export interface ConsentRecord { v: 1; analytics: boolean; ts: number; ver: string }

/** Global Privacy Control or Do Not Track: the trackers store nothing at all. */
export function privacySignalEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

/** Parses a stored record (cookie value or mirror); null when malformed, stale, or expired. */
export function parseConsentRecord(raw: string | null | undefined, now = Date.now()): ConsentRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ConsentRecord> | null;
    if (!value || value.v !== 1 || typeof value.analytics !== "boolean" || typeof value.ts !== "number" || !Number.isFinite(value.ts)) return null;
    if (value.ver !== ANALYTICS_CONSENT_VERSION) return null;
    if (value.ts > now + 60_000 || now - value.ts > CONSENT_MAX_AGE_SECONDS * 1000) return null;
    return { v: 1, analytics: value.analytics, ts: value.ts, ver: value.ver };
  } catch { return null; }
}

export function consentRecord(analytics: boolean, now = Date.now()): ConsentRecord {
  return { v: 1, analytics, ts: now, ver: ANALYTICS_CONSENT_VERSION };
}

/** The full Set-Cookie style string for document.cookie. */
export function serializeConsentCookie(record: ConsentRecord, secure: boolean): string {
  return `${CONSENT_STORAGE_KEY}=${encodeURIComponent(JSON.stringify(record))}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** Reads the sof_consent value out of a Cookie header or document.cookie string. */
export function consentCookieValue(cookieHeader: string | null | undefined): string | null {
  for (const part of (cookieHeader ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name !== CONSENT_STORAGE_KEY) continue;
    try { return decodeURIComponent(rest.join("=")); } catch { return null; }
  }
  return null;
}

function documentCookie(): string | null {
  if (typeof document === "undefined") return null;
  try { return typeof document.cookie === "string" ? document.cookie : null; } catch { return null; }
}

/** The current valid record: the cookie first, then the localStorage mirror. */
export function getConsentRecord(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  const fromCookie = parseConsentRecord(consentCookieValue(documentCookie()));
  if (fromCookie) return fromCookie;
  try { return parseConsentRecord(window.localStorage.getItem(CONSENT_STORAGE_KEY)); } catch { return null; }
}

export function getConsent(): ConsentChoice {
  if (typeof window === "undefined") return "unset";
  if (privacySignalEnabled()) return "denied";
  const record = getConsentRecord();
  return record ? (record.analytics ? "granted" : "denied") : "unset";
}

/** Called by the banner. Notifies trackers in this tab now, and other tabs via "storage". */
export function setConsent(choice: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  const record = consentRecord(choice === "granted");
  if (documentCookie() !== null) {
    try { document.cookie = serializeConsentCookie(record, window.location?.protocol === "https:"); } catch { /* cookies blocked */ }
  }
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch { /* storage blocked: the choice lasts for this page only */ }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: choice }));
}

export function onConsentChange(listener: (choice: ConsentChoice) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const local = () => listener(getConsent());
  const storage = (event: StorageEvent) => { if (event.key === CONSENT_STORAGE_KEY) listener(getConsent()); };
  window.addEventListener(CHANGE_EVENT, local);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(CHANGE_EVENT, local); window.removeEventListener("storage", storage); };
}

/** "Cookie settings" links call this; the mounted banner reopens its preferences. */
export function openConsentSettings(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function onConsentSettingsRequest(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
}
