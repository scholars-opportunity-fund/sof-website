/**
 * The optional PostHog layer is on only in builds with NEXT_PUBLIC_POSTHOG_KEY.
 * Next inlines the key at build time on the server and in the browser, so the
 * consent banner, the Cookie settings links, the privacy notice and the
 * /ingest relay always agree for a given deploy.
 *
 * Without a key the site runs only the cookieless first-party analytics. There
 * is no banner, no consent cookie, no persistent visitor id, and /ingest
 * answers 404. Setting the key (and redeploying) turns all of it back on.
 */
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || undefined;
export const POSTHOG_ENABLED = POSTHOG_KEY !== undefined;
