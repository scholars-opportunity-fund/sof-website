# 06 — Performance

## Where we are

The site is fast. Static rendering, no third-party scripts, self-hosted fonts, no analytics, a small bundle. That is not the result of optimisation work, it is the result of not having added anything yet.

The entire performance job for the rebuild is **not to lose this.** Rebuilds lose performance far more often than they gain it, because every addition is individually reasonable and collectively fatal.

## The budget

Set these before the rebuild starts and enforce them in CI. Numbers are the "good" thresholds Google publishes for Core Web Vitals, measured on a throttled mobile connection, because that is what field data is scored against.

| Metric | Target | What moves it |
|---|---|---|
| LCP (Largest Contentful Paint) | under 2.5s, aim for under 1.5s | hero image weight, font loading, render-blocking anything |
| INP (Interaction to Next Paint) | under 200ms | main-thread JavaScript, hydration cost, heavy event handlers |
| CLS (Cumulative Layout Shift) | under 0.1, aim for 0 | images without dimensions, late-loading fonts, injected banners |
| Total JavaScript (gzipped, first load) | under 150KB | every dependency, every client component |
| Lighthouse Performance (mobile) | 95+ | all of the above |
| Lighthouse SEO and Accessibility | 100, no exceptions | link text, alt text, contrast, heading order |

The Lighthouse 100s are not aspirational. They are achievable on a six-page static site and the failures that drop them (vague link text, redundant alt text, empty links) are the same failures that hurt crawlability. Treat any drop below 100 as a build failure.

## What actually costs performance, in order

**1. Third-party scripts.** Tag managers, analytics, chat widgets, embedded social feeds, A/B tools. Each one is a network request to another origin, a parse, an execute, and usually a cascade of further requests it triggers. A single tag manager container routinely doubles time-to-interactive on a site like this. If measurement is needed, read document 08 first, and prefer server-side or edge-side collection that ships zero client JavaScript.

**2. Images.** The hero image is almost always the LCP element. Rules: serve modern formats, size to the rendered dimensions, set explicit width and height on every image so the layout reserves space, preload the LCP image and nothing else, lazy-load everything below the fold. Team headshots on `/team` are twelve images; they must be sized for the grid they render in, not uploaded at camera resolution.

**3. Fonts.** Already correct: `next/font` with `display: swap` self-hosts and inlines the CSS. Do not replace with a `<link>` to Google Fonts; it adds a render-blocking cross-origin round trip and breaks the CSP. Limit weights to the ones actually used. Each weight is a file.

**4. Client components.** Every `"use client"` boundary ships JavaScript and hydrates. A rebuild that reaches for client components for animation, hover states, and layout produces a site that is technically static and practically slow. Default to server components. Reach for the client only where there is real interactivity, and keep those islands small and leaf-level.

**5. Below-the-fold weight.** Anything heavy that is not visible on load, a map, a carousel, an interactive chart, should be dynamically imported and mounted only when it scrolls into view with an `IntersectionObserver`. This pattern removes the component's entire bundle from the initial load.

**6. Cache headers.** Static assets under `/images` should carry `Cache-Control: public, max-age=31536000, immutable` and be served from content-hashed paths so they can be. The framework handles this for its own build output. Check it for anything in `public/`.

## Content Security Policy

`next.config.ts` ships a strict CSP: `default-src 'self'`, scripts from self only, fonts from self, no frames, `connect-src 'self'`.

This is a performance feature as much as a security one. It makes it structurally impossible to add a third-party script by accident, and it forces anyone adding one to open the config and explain themselves in a code review.

The rebuild will hit this the first time someone tries to add a library from a CDN. The correct response is to bundle the library, not to loosen the policy. Adding `'unsafe-eval'`, wildcarding a script source, or adding a domain to get something working is a change that needs a reason in the commit message and Joel's sign-off.

## Measuring it

Lab data and field data disagree, and field data is what ranks.

- **Lab:** Lighthouse in CI on every pull request, mobile preset, throttled. Catches regressions before they ship.
- **Field:** Chrome UX Report via Search Console's Core Web Vitals report, or PageSpeed Insights' field section. This is real-user data. It lags by about a month and needs a minimum traffic threshold to populate. A site this size may never reach that threshold, in which case lab data is all there is and the budget above should be treated as a hard ceiling rather than a target.

Run Lighthouse against the deployed URL, not localhost. Localhost has no network, no CDN, and no edge proxy, and it will lie to you.

## Rules for the rebuild

- Every image has explicit dimensions. No exceptions.
- No `"use client"` above the leaf level without a stated reason.
- No third-party script without a CSP change, and no CSP change without review.
- Lighthouse runs in CI on the preview deployment; a drop below budget blocks merge.
- The hero image is the only preloaded resource.
