// Same-origin relay for posthog-js (api_host "/ingest"), behind each app's
// app/ingest/[...path] route handler. A plain next.config rewrite forwards the
// browser's request as-is, so the Clerk session cookie, every other
// first-party cookie and the visitor's IP address would reach PostHog. This
// relay builds the upstream request from an allowlist instead: the PostHog
// path and query, the body, and a few content headers. No Cookie,
// Authorization or forwarding headers ever leave, and no Set-Cookie comes
// back. The sof-website repo keeps a byte-identical copy.

const API_HOST = "https://us.i.posthog.com";
const ASSET_HOST = "https://us-assets.i.posthog.com";
/** Session replay batches are the largest PostHog uploads (about 1 MB each). */
export const MAX_INGEST_BODY_BYTES = 5 * 1024 * 1024;
const REQUEST_HEADERS = ["accept", "content-type", "content-encoding", "user-agent"] as const;
// fetch() already decoded the body, so content-encoding and content-length are not passed back.
const RESPONSE_HEADERS = ["content-type", "cache-control", "etag", "last-modified"] as const;

/** The upstream URL for a request to /ingest/..., or null when the path is not PostHog's. */
export function posthogUpstream(requestUrl: string): string | null {
  const url = new URL(requestUrl);
  if (!url.pathname.startsWith("/ingest/")) return null;
  const rest = url.pathname.slice("/ingest".length);
  // Keep the relay on PostHog's own hosts and paths.
  if (rest.split("/").some((segment) => segment === ".." || segment === ".") || rest.includes("\\") || rest.includes("//")) return null;
  const host = rest.startsWith("/static/") || rest.startsWith("/array/") ? ASSET_HOST : API_HOST;
  return host + rest + url.search;
}

export async function relayToPostHog(request: Request, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const upstream = posthogUpstream(request.url);
  if (!upstream) return new Response(null, { status: 404 });
  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  let body: ArrayBuffer | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    if (Number(request.headers.get("content-length") ?? "0") > MAX_INGEST_BODY_BYTES) return new Response(null, { status: 413 });
    body = await request.arrayBuffer();
    if (body.byteLength > MAX_INGEST_BODY_BYTES) return new Response(null, { status: 413 });
  }
  let response: Response;
  try {
    response = await fetchImpl(upstream, { method: request.method, headers, body, redirect: "manual", cache: "no-store" });
  } catch {
    // PostHog unreachable: the SDK retries later; the page is never affected.
    return new Response(null, { status: 502 });
  }
  const out = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) out.set(name, value);
  }
  const bodiless = request.method === "HEAD" || [204, 205, 304].includes(response.status);
  return new Response(bodiless ? null : response.body, { status: response.status, headers: out });
}
