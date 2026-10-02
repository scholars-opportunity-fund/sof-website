"use client";
import { openConsentSettings } from "@/lib/analytics/consent-client";
import { POSTHOG_ENABLED } from "@/lib/posthog";

/**
 * Footer control that reopens the consent banner's preferences. Renders
 * nothing in builds without a PostHog key, since there is no banner to open.
 */
export default function CookieSettingsLink({ className = "" }: { className?: string }) {
  if (!POSTHOG_ENABLED) return null;
  return (
    <button type="button" className={className} onClick={() => openConsentSettings()}>
      Cookie settings
    </button>
  );
}
