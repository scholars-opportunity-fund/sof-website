// Client-safe analytics vocabulary, shared by the collector, the platform
// tracker, and (by copy) the public website's tracker. No imports. apps/website
// keeps byte-identical copies of this file, consent-client.ts and
// tracker-core.ts under src/lib/analytics/; lib/analytics/website-copy.test.ts
// fails when they drift. Edit here, then copy.

/**
 * Version of the analytics banner wording. Re-exported by lib/privacy.ts; a
 * stored banner choice or a member's recorded choice under an older version
 * no longer counts. Change it only when the banner's text changes.
 */
export const ANALYTICS_CONSENT_VERSION = "2026-09-30";

export const ANALYTICS_APPS = ["platform", "website"] as const;
export type AnalyticsApp = (typeof ANALYTICS_APPS)[number];

/** Mirrors the CHECK list in migration 0064; a new kind needs both changes. */
export const ANALYTICS_EVENT_KINDS = [
  "cta_click", "outbound_click", "form_start", "form_submit", "form_abandon",
  "search", "download", "qr_entry", "signup_start", "nav_click",
] as const;
export type AnalyticsEventKind = (typeof ANALYTICS_EVENT_KINDS)[number];

export const ANALYTICS_LIMITS = {
  /** Whole request body, checked before JSON parsing. */
  maxBodyBytes: 16 * 1024,
  maxPageviews: 50,
  maxEvents: 100,
  maxPath: 300,
  maxTitle: 200,
  maxLabel: 120,
  maxTarget: 300,
  maxUtm: 120,
  /** A single pageview's engaged time is capped at one hour. */
  maxEngagedMs: 3_600_000,
} as const;

/** Per-tab session id (and, only after consent, the persistent visitor id). */
export const ANALYTICS_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export interface AnalyticsLanding {
  /** Path plus query of the first page in the session; the server redacts it. */
  url: string;
  /** document.referrer at landing; the server keeps only the host. */
  referrer?: string;
}
export interface AnalyticsPageviewInput {
  id: string;
  path: string;
  title?: string;
  /** Epoch milliseconds. */
  enteredAt: number;
  engagedMs: number;
  maxScrollPct: number;
  exit?: boolean;
}
export interface AnalyticsEventInput {
  id: string;
  kind: AnalyticsEventKind;
  label: string;
  target?: string;
  pageviewId?: string;
  props?: Record<string, string | number | boolean>;
  /** Epoch milliseconds. */
  at: number;
}
/** One beacon/fetch body. `v` versions the wire format. */
export interface AnalyticsBatch {
  v: 1;
  app: AnalyticsApp;
  sid: string;
  vid?: string;
  landing: AnalyticsLanding;
  pageviews: AnalyticsPageviewInput[];
  events: AnalyticsEventInput[];
}
