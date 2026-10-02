"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import {
  getConsent, onConsentChange, onConsentSettingsRequest, privacySignalEnabled, setConsent,
} from "@/lib/analytics/consent-client";

// Hybrid-consent banner for the public site. Cookieless first-party analytics
// runs for everyone; this asks only about the optional layer (a persistent
// visitor id and PostHog with masked session replay). Global Privacy Control
// answers for the visitor, so the banner never appears on its own then. The
// footer's "Cookie settings" link reopens it. The choice logic lives in the
// shared consent-client copy; the platform has its own banner in its own style.
// The layout mounts the banner only in builds with a PostHog key
// (src/lib/posthog.ts); without one there is nothing optional to ask about.
const noSubscription = () => () => {};
const buttonBase = "inline-flex flex-1 items-center justify-center px-5 py-3 text-[14px] font-medium tracking-wide transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper sm:flex-none";

export default function ConsentBanner() {
  const choice = useSyncExternalStore(onConsentChange, getConsent, () => null);
  const gpc = useSyncExternalStore(noSubscription, privacySignalEnabled, () => false);
  const [reopened, setReopened] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [draft, setDraft] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const toggleId = useId();

  useEffect(() => onConsentSettingsRequest(() => {
    setDraft(getConsent() === "granted");
    setCustomize(true);
    setReopened(true);
    requestAnimationFrame(() => heading.current?.focus());
  }), []);

  const visible = reopened || (choice === "unset" && !gpc);
  if (!visible) return null;

  function answer(optIn: boolean) {
    if (!gpc) setConsent(optIn ? "granted" : "denied");
    setReopened(false);
    setCustomize(false);
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && reopened) { setReopened(false); setCustomize(false); }
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onKeyDown={onKeyDown}
      className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-5"
    >
      <div className="mx-auto w-full max-w-3xl border border-border bg-background-alt p-5 text-foreground-secondary shadow-[0_12px_40px_rgba(11,18,33,0.18)] sm:p-6">
        <p className="text-xs font-medium tracking-[0.15em] text-copper uppercase">Privacy</p>
        <h2 id={titleId} ref={heading} tabIndex={-1} className="mt-2 text-lg text-ink outline-none">Your analytics choice</h2>
        <p id={bodyId} className="mt-2 text-[15px] leading-relaxed">
          We count visits without cookies for everyone. With your permission we also use PostHog for analytics, heatmaps and session replay, with anything typed into forms masked.{" "}
          <Link href="/privacy" className="text-ink underline underline-offset-4 hover:text-copper">Privacy notice</Link>
        </p>
        {gpc && (
          <p role="status" className="mt-4 border border-border p-3 text-[14px] leading-relaxed">
            Your browser sends Global Privacy Control, so optional analytics stays off and no visit is recorded.
          </p>
        )}
        {customize && !gpc && (
          <label htmlFor={toggleId} className="mt-4 flex items-start gap-3 border border-border p-4 text-[14px] leading-relaxed">
            <input
              id={toggleId}
              type="checkbox"
              role="switch"
              aria-checked={draft}
              checked={draft}
              onChange={(event) => setDraft(event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-copper"
            />
            <span>
              <span className="font-medium text-ink">Product analytics &amp; session replay</span>
              <span className="block">PostHog, click heatmaps, and replays of how pages were used with form fields masked. Keeps a random visitor id in this browser so repeat visits count together.</span>
            </span>
          </label>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {gpc ? (
            <button type="button" className={`${buttonBase} bg-ink text-cloud hover:bg-gunmetal`} onClick={() => answer(false)}>Close</button>
          ) : (
            <>
              {customize
                ? <button type="button" className={`${buttonBase} border border-ink/20 text-ink hover:border-ink/40`} onClick={() => answer(draft)}>Save choices</button>
                : <button type="button" className={`${buttonBase} border border-ink/20 text-ink hover:border-ink/40`} onClick={() => { setDraft(choice === "granted"); setCustomize(true); }}>Customize</button>}
              <button type="button" className={`${buttonBase} border border-ink/20 text-ink hover:border-ink/40`} onClick={() => answer(false)}>Reject</button>
              <button type="button" className={`${buttonBase} bg-ink text-cloud hover:bg-gunmetal`} onClick={() => answer(true)}>Accept all</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
