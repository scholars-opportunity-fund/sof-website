"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { getConsent, onConsentChange } from "@/lib/analytics/consent-client";
import { createPostHogController, type PostHogController } from "@/lib/analytics/posthog-core";

// Optional PostHog layer for the public site: always anonymous (the site has no
// accounts), and posthog-js is only downloaded after the visitor accepts the
// banner and NEXT_PUBLIC_POSTHOG_KEY is set. The controller in
// src/lib/analytics/posthog-core.ts is a byte-identical copy of the platform's.
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export default function PostHogProvider() {
  const pathname = usePathname();
  const controller = useRef<PostHogController | null>(null);
  const granted = useSyncExternalStore(onConsentChange, getConsent, () => "unset") === "granted";

  useEffect(() => {
    const posthog = createPostHogController({
      app: "website",
      apiKey: POSTHOG_KEY,
      load: () => import("posthog-js").then((module) => module.default),
    });
    posthog.setAudience({ kind: "anonymous" });
    controller.current = posthog;
  }, []);

  useEffect(() => { controller.current?.setConsent(granted); }, [granted]);

  // Reading the query from location (not useSearchParams) keeps static pages static.
  useEffect(() => {
    if (pathname) controller.current?.page(pathname + window.location.search);
  }, [pathname]);

  return null;
}
