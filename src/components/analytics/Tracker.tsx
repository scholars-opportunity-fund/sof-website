"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { startTracker, type Tracker as AnalyticsTracker } from "@/lib/analytics/tracker-core";

// First-party, cookieless analytics posted to the SOF Scholars platform's
// collector (cross-origin, allowlisted there). The core in src/lib/analytics/
// is a byte-identical copy of the platform's lib/analytics/ files; edit the
// platform copy first. Global Privacy Control / Do Not Track: nothing starts.
const ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT
  ?? (process.env.NODE_ENV === "production"
    ? "https://sof-scholars.vercel.app/api/analytics/collect"
    : "http://localhost:3100/api/analytics/collect");

export default function Tracker() {
  const pathname = usePathname();
  const tracker = useRef<AnalyticsTracker | null>(null);
  useEffect(() => {
    tracker.current = startTracker({ app: "website", endpoint: ENDPOINT, sendTitles: true });
    return () => { tracker.current?.stop(); tracker.current = null; };
  }, []);
  // Reading the query from location (not useSearchParams) keeps static pages
  // statically rendered; campaign tags arrive with the landing page anyway.
  useEffect(() => {
    if (pathname) tracker.current?.page(pathname + window.location.search);
  }, [pathname]);
  return null;
}
