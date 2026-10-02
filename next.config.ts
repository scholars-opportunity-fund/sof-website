import type { NextConfig } from "next";

// The first-party analytics collector lives on the SOF Scholars platform, so
// the Tracker's beacons need its origin in connect-src. Keep in sync with
// src/components/analytics/Tracker.tsx.
const analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT
  ?? (process.env.NODE_ENV === "production"
    ? "https://scholars.scholarsoppfund.com/api/analytics/collect"
    : "http://localhost:3100/api/analytics/collect");
const analyticsOrigin = new URL(analyticsEndpoint).origin;

const nextConfig: NextConfig = {
  trailingSlash: false,
  // PostHog (optional, consent-gated) is reached through our own origin via the
  // src/app/ingest/[...path] relay, so the CSP stays 'self'. Not a rewrite: a
  // rewrite would forward the visitor's cookies and IP to PostHog. PostHog's
  // API paths end in "/", which Next would otherwise redirect away.
  skipTrailingSlashRedirect: true,

  // /about is retired: its approach, process, leadership, and fund-structure
  // content all live on the landing page now, so old links land there.
  async redirects() {
    return [{ source: "/about", destination: "/", permanent: true }];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            // React's development build calls eval() for its debugging features, so the dev server
            // cannot hydrate under a policy without 'unsafe-eval'. Production keeps the strict policy.
            // worker-src blob: lets PostHog's session replay compress off the main thread.
            value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; frame-src 'none'; connect-src 'self' ${analyticsOrigin}; worker-src 'self' blob:`,
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
