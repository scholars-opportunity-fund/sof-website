"use client";
import { Analytics } from "@vercel/analytics/next";
import { privacySignalEnabled } from "@/lib/analytics/consent-client";

/**
 * Vercel Web Analytics with the privacy notice's promise applied: when the
 * browser sends Global Privacy Control or Do Not Track, no pageview or event
 * leaves the page. (A client component, since beforeSend is a function.)
 */
export function vercelBeforeSend<T>(event: T): T | null {
  return privacySignalEnabled() ? null : event;
}

export default function VercelAnalytics() {
  return <Analytics beforeSend={vercelBeforeSend} />;
}
