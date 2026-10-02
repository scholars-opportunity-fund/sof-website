import { relayToPostHog } from "@/lib/analytics/posthog-proxy";
import { POSTHOG_ENABLED } from "@/lib/posthog";

/**
 * Same-origin PostHog relay (posthog-js api_host "/ingest"). It forwards no
 * cookies, auth or IP headers upstream (src/lib/analytics/posthog-proxy.ts,
 * a copy of the platform's). posthog-js only loads after a visitor accepts
 * the analytics banner. src/proxy.ts skips /ingest/ so PostHog's trailing
 * slashes survive. In builds without a PostHog key (src/lib/posthog.ts) the
 * relay is off and every request gets a 404.
 */
export const dynamic = "force-dynamic";

const relay = (request: Request) =>
  POSTHOG_ENABLED ? relayToPostHog(request) : new Response(null, { status: 404 });

export const GET = relay;
export const POST = relay;
export const HEAD = relay;
