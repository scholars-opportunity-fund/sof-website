import { relayToPostHog } from "@/lib/analytics/posthog-proxy";

/**
 * Same-origin PostHog relay (posthog-js api_host "/ingest"). It forwards no
 * cookies, auth or IP headers upstream (src/lib/analytics/posthog-proxy.ts,
 * a copy of the platform's). posthog-js only loads after a visitor accepts
 * the analytics banner. src/proxy.ts skips /ingest/ so PostHog's trailing
 * slashes survive.
 */
export const dynamic = "force-dynamic";

export const GET = (request: Request) => relayToPostHog(request);
export const POST = (request: Request) => relayToPostHog(request);
export const HEAD = (request: Request) => relayToPostHog(request);
