import Container from "@/components/ui/Container";
import CookieSettingsLink from "@/components/consent/CookieSettingsLink";
import { generatePageMetadata } from "@/lib/seo";

// Draft — pending counsel review. Mirrors the analytics disclosures in the SOF
// Scholars platform notice (app/privacy/page.tsx at the repo root); keep the two
// in step when either changes.
const PRIVACY_CONTACT = "ronan@scholarsoppfund.com";

export const metadata = generatePageMetadata({
  title: "Privacy",
  description:
    "How the Scholars Opportunity Fund website measures visits: cookieless analytics for everyone, Global Privacy Control honored, and optional PostHog analytics only with your permission.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-ink py-24 sm:py-32">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Privacy
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl text-cloud sm:text-5xl lg:text-6xl">
            How this site measures visits
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-on-dark-muted">
            We measure how scholarsoppfund.com is used so we can see which pages
            help and which outreach works. We do not sell data. Updated
            September 30, 2026.
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl space-y-12 text-[17px] leading-[1.8]">
            <div>
              <h2 className="text-2xl text-ink sm:text-3xl">Basic measurement, without cookies</h2>
              <p className="mt-4">
                For every visitor, this site records visits without cookies. Your
                browser keeps a random session identifier only for the current tab,
                and it is gone when the tab closes.
              </p>
              <p className="mt-4">
                For each visit we record the pages you view (with email addresses
                and similar identifiers removed from the address), the site that
                referred you, campaign tags such as a QR code&apos;s source, how long
                a page was actively in view, how far you scrolled, and clicks on
                buttons, outbound links, and downloads. We also record your general
                device type, browser and operating system families, and your
                approximate country, region, and city as reported by our hosting
                provider. We do not store your IP address or anything you type into
                forms. Automated crawlers are ignored.
              </p>
              <p className="mt-4">
                These records are stored by the Scholars Opportunity Fund on its SOF
                Scholars platform. Raw visit records are kept for 13 months and then
                reduced to daily totals that identify no one.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-ink sm:text-3xl">Global Privacy Control</h2>
              <p className="mt-4">
                If your browser sends Global Privacy Control or Do Not Track, we
                record nothing at all, and we will not ask you about optional
                analytics.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-ink sm:text-3xl">Optional analytics, only if you agree</h2>
              <p className="mt-4">
                A banner lets you allow more. If you accept, your browser keeps a
                persistent random identifier (in local storage, not a cookie) so
                repeat visits can be counted together, and PostHog analytics runs,
                including click heatmaps and session replay. Session replay records
                how the page looked and moved as you used it; every form field and
                typed input is masked before anything leaves your browser. PostHog
                requests pass through this site&apos;s own address.
              </p>
              <p className="mt-4">
                We remember your answer in a small first-party cookie named
                sof_consent for up to 12 months. It holds only your choice and when
                you made it, never an identifier. Declining keeps only the basic
                measurement above. You can change your choice at any time.
              </p>
              <p className="mt-6">
                <CookieSettingsLink className="inline-flex items-center justify-center border border-ink/20 px-6 py-3 text-[14px] font-medium tracking-wide text-ink transition-colors duration-200 hover:border-ink/40" />
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-ink sm:text-3xl">Service providers</h2>
              <p className="mt-4">
                Vercel hosts this site, supplies approximate location, and provides
                Vercel Web Analytics, which counts page views without cookies.
                Supabase stores our first-party analytics. PostHog processes
                optional analytics, heatmaps, and masked session replay only for
                visitors who accept the banner.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-ink sm:text-3xl">SOF Scholars</h2>
              <p className="mt-4">
                The SOF Scholars platform, where students sign in, has its own
                privacy notice covering accounts and member tools. Visits to this
                public site are never linked to a platform account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-ink sm:text-3xl">Contact</h2>
              <p className="mt-4">
                Questions or requests about your data:{" "}
                <a href={`mailto:${PRIVACY_CONTACT}`} className="text-ink underline underline-offset-4 hover:text-copper">
                  {PRIVACY_CONTACT}
                </a>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
