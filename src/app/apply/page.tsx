import Container from "@/components/ui/Container";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Apply",
  description:
    "Apply to the Scholars Opportunity Fund Student Analyst Program. View open positions and submit your application.",
  path: "/apply",
});

export default function ApplyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-20 sm:py-28">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper">
            Careers
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-cloud sm:text-5xl font-heading">
            Apply Now
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-on-dark-muted leading-relaxed">
            Join the next cohort of student analysts at Scholars Opportunity
            Fund.
          </p>
        </Container>
      </section>

      {/* Positions */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-lg border border-border bg-background-alt py-20 px-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-cloud flex items-center justify-center mb-6">
                <svg
                  className="h-8 w-8 text-slate"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-heading text-ink">
                Positions Coming Soon
              </h2>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                We are preparing our next round of openings. Check back soon
                for available positions in the Student Analyst Program.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
