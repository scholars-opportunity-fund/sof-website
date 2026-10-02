// Framework-free browser tracker behind components/analytics/tracker.tsx and
// the public website's Tracker. The sof-website repo keeps a byte-identical
// copy (it cannot import from this repo); lib/analytics/website-copy.test.ts
// fails when this file changes, so the copy gets the same edit. No
// dependencies, no cookies.
//
// Anonymous by default: a random per-tab session id in sessionStorage. Only
// after the banner is accepted does a persistent visitor id live in
// localStorage ("sof_aid"); declining removes it. With Global Privacy Control
// or Do Not Track on, nothing starts and nothing is sent.
import { getConsent, onConsentChange, privacySignalEnabled } from "./consent-client";
import { downloadLabel } from "./redact";
import { ANALYTICS_EVENT_KINDS, ANALYTICS_LIMITS, type AnalyticsApp, type AnalyticsBatch, type AnalyticsEventInput, type AnalyticsEventKind, type AnalyticsPageviewInput } from "./types";

export interface TrackerOptions {
  app: AnalyticsApp;
  endpoint: string;
  /** Page titles can name a person on signed-in pages; only public sites send them. */
  sendTitles: boolean;
}
export interface Tracker {
  /** Records a navigation to `url` (path plus query). Repeats of the current URL are ignored. */
  page(url: string): void;
  /**
   * Who is signed in on this tab ("anon" when nobody). A change starts a fresh
   * session, so one visit never spans two accounts or an account and the
   * anonymous browsing before sign-in or after sign-out.
   */
  identity(key: string): void;
  stop(): void;
}

const SESSION_KEY = "sof_sid";
const LANDING_KEY = "sof_landing";
const VISITOR_KEY = "sof_aid";
const OWNER_KEY = "sof_sid_owner";
const FLUSH_MS = 15_000;
const IDLE_MS = 30_000;
const TICK_MS = 1_000;

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function stored(storage: () => Storage, key: string, create?: () => string): string | undefined {
  try {
    const existing = storage().getItem(key);
    if (existing || !create) return existing ?? undefined;
    const value = create();
    storage().setItem(key, value);
    return value;
  } catch { return create?.(); }
}
const compactId = () => randomId().replaceAll("-", "");
const isKind = (value: string): value is AnalyticsEventKind => (ANALYTICS_EVENT_KINDS as readonly string[]).includes(value);
const DOWNLOAD = /\.(pdf|docx?|xlsx?|pptx?|csv|zip)$/i;
/** FNV-1a: the tab remembers only a fingerprint of the account id, enough to notice a change. */
function fingerprint(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 0x01000193) >>> 0;
  return hash.toString(36);
}

export function startTracker(options: TrackerOptions): Tracker | null {
  if (typeof window === "undefined" || typeof document === "undefined" || privacySignalEnabled()) return null;
  let sid = stored(() => window.sessionStorage, SESSION_KEY, compactId)!;
  const visitor = () => getConsent() === "granted" ? stored(() => window.localStorage, VISITOR_KEY, compactId) : undefined;
  let vid = visitor();
  let fresh = false;
  const landingJson = stored(() => window.sessionStorage, LANDING_KEY, () => {
    fresh = true;
    return JSON.stringify({ url: location.pathname + location.search, referrer: document.referrer || undefined });
  })!;
  let landing = JSON.parse(landingJson) as AnalyticsBatch["landing"];
  // A session that starts from a printed QR code (utm_medium=qr, a Vigil entry link, or the
  // vigil_campaign marker the entry route adds to its redirect).
  const vigilEntry = (url: string) => url.startsWith("/vigil/entry/") || /[?&]vigil_campaign=/i.test(url);
  let qrEntry = fresh && (/[?&]utm_medium=qr(&|$)/i.test(landing.url) || vigilEntry(landing.url));

  let current: AnalyticsPageviewInput | null = null;
  let sentSnapshot = "";
  const finished: AnalyticsPageviewInput[] = [];
  let events: AnalyticsEventInput[] = [];
  let lastInput = Date.now();
  let lastTick = Date.now();

  const active = () => document.visibilityState === "visible" && document.hasFocus() && Date.now() - lastInput < IDLE_MS;
  const tick = () => {
    const now = Date.now();
    // A long gap (sleep, throttled background tab) never counts as engagement.
    if (current && active()) current.engagedMs = Math.min(ANALYTICS_LIMITS.maxEngagedMs, current.engagedMs + Math.min(now - lastTick, TICK_MS * 2));
    lastTick = now;
  };
  const scroll = () => {
    lastInput = Date.now();
    if (!current) return;
    const height = document.documentElement.scrollHeight;
    const pct = height <= window.innerHeight ? 100 : ((window.scrollY + window.innerHeight) / height) * 100;
    current.maxScrollPct = Math.max(current.maxScrollPct, Math.min(100, Math.round(pct)));
  };
  const input = () => { lastInput = Date.now(); };

  const record = (kind: AnalyticsEventKind, label: string, target?: string) => {
    if (events.length >= ANALYTICS_LIMITS.maxEvents) events.shift();
    events.push({ id: randomId(), kind, label: label.slice(0, ANALYTICS_LIMITS.maxLabel), target: target?.slice(0, 2048), pageviewId: current?.id, at: Date.now() });
  };
  const click = (event: MouseEvent) => {
    input();
    const element = event.target instanceof Element ? event.target : null;
    const tagged = element?.closest<HTMLElement>("[data-track]");
    if (tagged) {
      const [kind, ...rest] = (tagged.dataset.track ?? "").split(":");
      if (isKind(kind)) return record(kind, rest.join(":"));
    }
    const link = element?.closest<HTMLAnchorElement>("a[href]");
    if (!link) return;
    let url: URL;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
    // Query strings are never sent for links: they can carry tokens.
    const target = url.origin + url.pathname;
    if (link.hasAttribute("download") || DOWNLOAD.test(url.pathname)) record("download", downloadLabel(url.pathname), target);
    else if (url.host !== location.host) record("outbound_click", url.host, target);
  };

  const batch = (): AnalyticsBatch | null => {
    const pageviews = current ? [...finished, current] : [...finished];
    const snapshot = JSON.stringify(current);
    if (!events.length && !finished.length && snapshot === sentSnapshot) return null;
    return { v: 1, app: options.app, sid, vid, landing, pageviews: pageviews.slice(-ANALYTICS_LIMITS.maxPageviews), events };
  };
  const send = (body: AnalyticsBatch): boolean => {
    let json = JSON.stringify(body);
    // Keep under the collector's limit by dropping the oldest events.
    while (json.length > ANALYTICS_LIMITS.maxBodyBytes - 512 && body.events.length) {
      body = { ...body, events: body.events.slice(Math.ceil(body.events.length / 2)) };
      json = JSON.stringify(body);
    }
    // text/plain keeps the cross-origin POST a simple request (no preflight).
    const blob = new Blob([json], { type: "text/plain;charset=UTF-8" });
    try { if (navigator.sendBeacon?.(options.endpoint, blob)) return true; } catch { /* fall through to fetch */ }
    fetch(options.endpoint, { method: "POST", body: json, keepalive: true, headers: { "content-type": "text/plain;charset=UTF-8" },
      credentials: options.app === "platform" ? "same-origin" : "omit" }).catch(() => {});
    return true;
  };
  const flush = () => {
    tick();
    const body = batch();
    if (!body || !send(body)) return;
    sentSnapshot = JSON.stringify(current);
    finished.length = 0;
    events = [];
  };

  const hidden = () => { if (document.visibilityState === "hidden") flush(); };
  const pagehide = () => { if (current) current.exit = true; flush(); };
  const timer = window.setInterval(tick, TICK_MS);
  const flusher = window.setInterval(() => { if (document.visibilityState === "visible") flush(); }, FLUSH_MS);
  const stopConsent = onConsentChange((choice) => {
    if (choice === "granted") vid = visitor();
    else { vid = undefined; try { window.localStorage.removeItem(VISITOR_KEY); } catch { /* nothing stored */ } }
  });
  const passive = { passive: true, capture: true } as const;
  window.addEventListener("scroll", scroll, passive);
  for (const name of ["pointerdown", "keydown", "mousemove", "touchstart", "focus"] as const) window.addEventListener(name, input, passive);
  document.addEventListener("click", click, { capture: true });
  document.addEventListener("visibilitychange", hidden);
  window.addEventListener("pagehide", pagehide);

  const pageview = (path: string): AnalyticsPageviewInput => ({ id: randomId(), path,
    title: options.sendTitles ? document.title.slice(0, ANALYTICS_LIMITS.maxTitle) || undefined : undefined,
    enteredAt: Date.now(), engagedMs: 0, maxScrollPct: 0 });

  return {
    page(url: string) {
      const path = url.split("#")[0] || "/";
      if (current?.path === path) return;
      tick();
      if (current) finished.push(current);
      current = pageview(path);
      lastInput = Date.now();
      if (qrEntry) { qrEntry = false; record("qr_entry", vigilEntry(landing.url) ? "vigil" : "utm"); }
      // Titles update after navigation commits; pick up the new one shortly.
      if (options.sendTitles) window.setTimeout(() => { if (current && current.path === path) current.title = document.title.slice(0, ANALYTICS_LIMITS.maxTitle) || undefined; }, 500);
      window.requestAnimationFrame(scroll);
    },
    identity(key: string) {
      const owner = key === "anon" ? "anon" : fingerprint(key);
      let previous: string | null = null;
      try { previous = window.sessionStorage.getItem(OWNER_KEY); window.sessionStorage.setItem(OWNER_KEY, owner); } catch { /* storage blocked */ }
      if (previous === null || previous === owner) return;
      // Unsent data belongs to the previous account (or to no one). It is dropped rather than
      // flushed, because the collector would read the new session's sign-in and claim it.
      finished.length = 0; events = []; sentSnapshot = ""; qrEntry = false;
      sid = compactId();
      landing = { url: current?.path ?? location.pathname + location.search };
      try {
        window.sessionStorage.setItem(SESSION_KEY, sid);
        window.sessionStorage.setItem(LANDING_KEY, JSON.stringify(landing));
      } catch { /* this tab keeps the new ids in memory */ }
      if (current) current = pageview(current.path);
    },
    stop() {
      flush();
      window.clearInterval(timer); window.clearInterval(flusher); stopConsent();
      window.removeEventListener("scroll", scroll, passive);
      for (const name of ["pointerdown", "keydown", "mousemove", "touchstart", "focus"] as const) window.removeEventListener(name, input, passive);
      document.removeEventListener("click", click, { capture: true });
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", pagehide);
    },
  };
}
