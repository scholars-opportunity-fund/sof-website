"use client";
import { openConsentSettings } from "@/lib/analytics/consent-client";

/** Footer control that reopens the consent banner's preferences. */
export default function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => openConsentSettings()}>
      Cookie settings
    </button>
  );
}
