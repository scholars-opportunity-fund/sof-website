// Consent-gated PostHog controller, shared by both apps' providers. It owns
// every call into posthog-js so the rules live in one place:
//  - nothing loads, initializes or captures until the banner choice is
//    "granted" AND a project key is configured (Global Privacy Control and Do
//    Not Track already read as "denied" in consent-client);
//  - PostHog starts opted out and is opted in only while it is wanted, so a
//    choice that changes while the library is still downloading never leaves
//    it capturing;
//  - the platform names a person only when its server says the member passed
//    the Vigil consent gate (audience "identify"); staff, View-as and test
//    accounts arrive as "exclude" and PostHog stays off for them;
//  - every URL PostHog sends is redacted like our own analytics (invitation
//    tokens, ids, emails, non-campaign query parameters);
//  - session replay never runs on pages that show a person's own records or
//    other people's details, and replay data captured while such a page is on
//    screen is dropped before it is sent.
// Withdrawal resets, opts out and clears PostHog's stored ids. apps/website
// keeps a byte-identical copy.
import type { BeforeSendFn, CaptureResult, PostHogConfig } from "posthog-js";
import { redactUrl } from "./redact";
import type { AnalyticsApp } from "./types";

/** The slice of posthog-js the controller uses; tests pass a fake. */
export interface PostHogLike {
  init(token: string, config: Partial<PostHogConfig>): unknown;
  capture(event: string, properties?: Record<string, unknown>): unknown;
  register(properties: Record<string, unknown>): void;
  identify(distinctId: string): void;
  reset(): void;
  opt_out_capturing(): void;
  opt_in_capturing(options?: { captureEventName?: false }): void;
  has_opted_out_capturing(): boolean;
  startSessionRecording(): void;
  stopSessionRecording(): void;
}

/**
 * Who PostHog may treat the visitor as. "pending" holds everything while a
 * signed-in platform session's gate answer is on its way.
 */
export type PostHogAudience =
  | { kind: "pending" }
  | { kind: "anonymous" }
  | { kind: "identify"; distinctId: string }
  | { kind: "exclude" };

/**
 * Session replay stays off where a page shows a person's records, answers or
 * other people's details. A first path segment matches exactly or as a
 * hyphenated variant ("resume" covers /resume-print); nested entries match
 * that prefix and everything under it.
 */
export const REPLAY_BLOCKED_SEGMENTS = [
  "resume", "profile", "privacy", "admin", "sign-in", "sign-up", "mentoring", "applications", "practice", "network", "search", "dev",
] as const;
export const REPLAY_BLOCKED_PREFIXES = [
  "/case-comp/profile", "/case-comp/teams", "/case-comp/requests", "/club/members", "/club/invites", "/club/requests", "/guide/practice",
] as const;

export function replayAllowed(path: string): boolean {
  const pathname = path.split(/[?#]/)[0] || "/";
  const first = pathname.split("/")[1]?.toLowerCase() ?? "";
  if (REPLAY_BLOCKED_SEGMENTS.some((segment) => first === segment || first.startsWith(segment + "-"))) return false;
  return !REPLAY_BLOCKED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

/**
 * A URL as PostHog may keep it: origin kept, path redacted like the
 * first-party collector (so /mentoring/invite/<token> becomes :token), query
 * reduced to utm_* tags, fragment dropped. Non-URL strings ("$direct") pass.
 */
export function scrubUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    try { const url = new URL(value); return url.origin + redactUrl(url.pathname + url.search).path; } catch { return "/"; }
  }
  return value.startsWith("/") ? redactUrl(value).path : value;
}

// $current_url, $pathname, $referrer, $initial_*, $session_entry_*, $prev_pageview_* ...
const URL_KEY = /(url|pathname|referrer|href)$/i;
type Bag = Record<string, unknown>;

function scrubBag(bag: Bag | undefined) {
  if (!bag) return;
  for (const [key, value] of Object.entries(bag)) if (typeof value === "string" && URL_KEY.test(key)) bag[key] = scrubUrl(value);
}

/** Replay events carry the page URL in meta (type 4) and custom payloads. */
function scrubSnapshots(data: unknown) {
  if (!Array.isArray(data)) return;
  for (const item of data) {
    const event = item as { data?: Bag & { payload?: Bag } } | null;
    if (!event?.data || typeof event.data !== "object") continue;
    scrubBag(event.data);
    if (event.data.payload && typeof event.data.payload === "object") scrubBag(event.data.payload);
  }
}

/**
 * posthog-js before_send: drops replay data whenever the page on screen is
 * one replay must not see (this also covers the first frames of a client
 * navigation, before the controller's page() can stop the recorder), and
 * scrubs every URL-shaped property, element href and replay URL.
 */
export function scrubEvent(event: CaptureResult | null, currentPath: string): CaptureResult | null {
  if (!event) return null;
  if (event.event === "$snapshot" && !replayAllowed(currentPath)) return null;
  const properties = event.properties as Bag;
  scrubBag(properties);
  scrubBag(event.$set as Bag | undefined);
  scrubBag(event.$set_once as Bag | undefined);
  if (Array.isArray(properties.$elements)) for (const element of properties.$elements) scrubBag(element as Bag);
  if (typeof properties.$elements_chain === "string") {
    properties.$elements_chain = properties.$elements_chain.replace(/attr__href="([^"]*)"/g, (_, href: string) => `attr__href="${scrubUrl(href)}"`);
  }
  if (event.event === "$snapshot") scrubSnapshots(properties.$snapshot_data);
  return event;
}

const beforeSend: BeforeSendFn = (event) => scrubEvent(event, typeof window === "undefined" ? "/" : window.location.pathname);

/** Traffic goes through our own origin (the /ingest route handler), so CSP stays 'self'. */
export function posthogConfig(): Partial<PostHogConfig> {
  return {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "identified_only",
    // App Router navigations are captured by the controller's page().
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    // Nothing is captured or stored until the controller opts in, and opting
    // out removes PostHog's stored ids again.
    opt_out_capturing_by_default: true,
    opt_out_persistence_by_default: true,
    // The persistent id lives in localStorage, as the privacy notice says; no PostHog cookie.
    persistence: "localStorage",
    // Started per page by the controller so blocked paths never record.
    disable_session_recording: true,
    session_recording: { maskAllInputs: true, maskTextSelector: "[data-ph-mask]" },
    mask_personal_data_properties: true,
    custom_personal_data_properties: ["email", "code", "token", "invite"],
    before_send: beforeSend,
    disable_surveys: true,
    respect_dnt: true,
  };
}

/** PostHog's own browser storage (ids, session, super properties). Its opt-out record is kept. */
export function clearPostHogStorage(stores: Storage[]) {
  for (const store of stores) {
    try {
      const keys = Array.from({ length: store.length }, (_, index) => store.key(index)).filter((key): key is string => !!key && key.startsWith("ph_"));
      for (const key of keys) store.removeItem(key);
    } catch { /* storage blocked: nothing was kept either */ }
  }
}

function browserStores(): Storage[] {
  const stores: Storage[] = [];
  try { if (typeof window !== "undefined") stores.push(window.localStorage, window.sessionStorage); } catch { /* blocked */ }
  return stores;
}

export interface PostHogControllerOptions {
  app: AnalyticsApp;
  /** NEXT_PUBLIC_POSTHOG_KEY; blank or missing makes the controller a no-op. */
  apiKey: string | undefined;
  /** Loads posthog-js lazily so visitors who never accept never download it. */
  load: () => Promise<PostHogLike>;
  /** Browser storage to clear on withdrawal; tests pass fakes. */
  stores?: () => Storage[];
}

export interface PostHogController {
  setConsent(granted: boolean): void;
  setAudience(audience: PostHogAudience): void;
  page(path: string): void;
  /** Resolves once any in-flight load/sync has settled (tests, teardown). */
  settled(): Promise<void>;
}

export function createPostHogController(options: PostHogControllerOptions): PostHogController {
  const apiKey = options.apiKey?.trim() || "";
  const stores = options.stores ?? browserStores;
  let client: PostHogLike | null = null;
  let loading: Promise<void> | null = null;
  let granted = false;
  let audience: PostHogAudience = { kind: "pending" };
  let path: string | null = null;
  let active = false;
  // True once PostHog is confirmed off, so repeated syncs stay cheap.
  let quiet = false;
  let recording = false;
  let identified: string | null = null;
  let lastPageview: string | null = null;

  const wanted = () => granted && apiKey !== "" && (audience.kind === "anonymous" || audience.kind === "identify");

  /**
   * reset() also clears PostHog's stored consent, returning it to its default
   * (opted out here), so it always runs before opting in again.
   */
  function freshPerson(ph: PostHogLike) {
    ph.reset();
    if (ph.has_opted_out_capturing()) ph.opt_in_capturing({ captureEventName: false });
    ph.register({ app: options.app });
  }

  /**
   * Runs whether or not the controller ever activated: a library that
   * finished loading after the visitor declined, or that restored an earlier
   * opt-in from storage, is switched off here too. Reset first, opt out last.
   */
  function deactivate(ph: PostHogLike) {
    if (quiet) return;
    if (recording) { ph.stopSessionRecording(); recording = false; }
    ph.reset();
    ph.opt_out_capturing();
    clearPostHogStorage(stores());
    active = false; quiet = true; identified = null; lastPageview = null;
  }

  function sync() {
    if (!wanted()) { if (client) deactivate(client); return; }
    if (!client) { ensureLoaded(); return; }
    const ph = client;
    if (!active) {
      if (ph.has_opted_out_capturing()) ph.opt_in_capturing({ captureEventName: false });
      ph.register({ app: options.app });
      active = true; quiet = false;
    }
    if (audience.kind === "identify" && identified !== audience.distinctId) {
      if (identified) freshPerson(ph);
      ph.identify(audience.distinctId);
      identified = audience.distinctId;
    } else if (audience.kind === "anonymous" && identified) {
      // Signed out: forget the person on this device before capturing more.
      freshPerson(ph);
      identified = null;
    }
    if (path === null) return;
    const allowReplay = replayAllowed(path);
    if (allowReplay && !recording) { ph.startSessionRecording(); recording = true; }
    else if (!allowReplay && recording) { ph.stopSessionRecording(); recording = false; }
    if (lastPageview !== path) { ph.capture("$pageview"); lastPageview = path; }
  }

  function ensureLoaded() {
    if (loading) return;
    loading = options.load().then((ph) => {
      // Opted out by default (posthogConfig); sync() opts in only if still wanted.
      ph.init(apiKey, posthogConfig());
      client = ph;
      sync();
    }).catch(() => {
      // A blocked or failed load leaves the site untouched; a later change may retry.
      loading = null;
    });
  }

  return {
    setConsent(next) { granted = next; sync(); },
    setAudience(next) { audience = next; sync(); },
    page(next) { path = next; sync(); },
    async settled() { await loading; },
  };
}
