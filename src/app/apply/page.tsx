import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/seo";
import { FUND } from "@/lib/constants";

export const metadata = generatePageMetadata({
  title: "Apply",
  description:
    "Apply to the Scholar Opportunity Fund Student Analyst Program. Review requirements, timeline, and submit your application.",
  path: "/apply",
});

export default function ApplyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink py-36 sm:py-44">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-copper/10 blur-3xl" />
        </div>
        <Container className="relative">
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Careers
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            Apply to join the fund
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-on-dark-muted">
            Join the next cohort of student analysts at Scholar Opportunity
            Fund. Review the application process below and reach out when
            you&apos;re ready.
          </p>
        </Container>
      </section>

      {/* Status banner */}
      <section className="border-b border-border/60 bg-cloud py-10">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-2.5 w-2.5 rounded-full bg-signal"
              />
              <p className="text-[14px] font-medium tracking-wide text-foreground-secondary">
                Applications open for the Fall 2026 cohort
              </p>
            </div>
            <p className="text-[13px] text-foreground-muted">
              Rolling review. Priority deadline: August 15, 2026.
            </p>
          </div>
        </Container>
      </section>

      {/* How to apply */}
      <section className="py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                How to Apply
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">Application process</h2>
              <p className="mt-8 text-[17px] leading-[1.8] text-foreground-muted">
                A streamlined intake. Submit materials to our inbox;
                we&apos;ll confirm receipt and route qualified candidates into
                the three-stage interview flow.
              </p>
              <div className="mt-10">
                <Button href={`mailto:${FUND.contactEmail}?subject=SOF%20Student%20Analyst%20Application`}>
                  Start Your Application
                </Button>
                <p className="mt-4 text-[13px] text-foreground-muted">
                  Email{" "}
                  <a
                    href={`mailto:${FUND.contactEmail}`}
                    className="text-ink underline decoration-copper/60 underline-offset-4 hover:decoration-copper"
                  >
                    {FUND.contactEmail}
                  </a>
                </p>
              </div>
            </div>
            <div className="space-y-10">
              {[
                {
                  step: "01",
                  title: "Submit materials",
                  text: "Send a current resume, a one-page statement of interest, and an unofficial transcript. Include any relevant projects, investment memos, or code samples you'd like us to review.",
                },
                {
                  step: "02",
                  title: "Behavioral interview",
                  text: "A 15-minute conversation with a current analyst assessing fit with the team and intellectual curiosity. We'll confirm the next stage within a week.",
                },
                {
                  step: "03",
                  title: "Quantitative case study",
                  text: "A one-week written memo and model on a pre-selected public equity situation. We provide the brief; you deliver the analysis.",
                },
                {
                  step: "04",
                  title: "Thesis defense",
                  text: "Present your analysis to the fund and defend it under direct questioning. Dr. Brogaard makes the final selection.",
                },
              ].map((step) => (
                <div
                  key={step.step}
                  className="grid grid-cols-[80px_1fr] gap-6 border-l-2 border-copper/30 pb-2 pl-8"
                >
                  <span className="font-heading text-3xl text-copper/70">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-heading text-xl text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Requirements / profile */}
      <section className="border-t border-border/60 bg-cloud py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                What We Look For
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">
                A serious analyst profile
              </h2>
              <ul className="mt-10 space-y-5">
                {[
                  "Strong quantitative foundation — calculus, statistics, linear algebra.",
                  "Demonstrated comfort with Python, R, or equivalent — enough to load data, test a hypothesis, and produce an output.",
                  "Fluency with a company's financials; ability to read a 10-K and surface what matters.",
                  "Intellectual honesty. Willingness to be wrong publicly in front of the team so the work gets better.",
                  "Sustained interest in markets — an investing track record, a written thesis, or something you built.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 text-[15px] leading-relaxed text-foreground-secondary"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 inline-block h-[3px] w-5 shrink-0 bg-copper"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Commitment
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">What to expect</h2>
              <div className="mt-10 grid gap-px bg-border/60">
                {[
                  {
                    label: "Time Commitment",
                    value: "8–12 hours/week during term",
                  },
                  { label: "Minimum Term", value: "Two consecutive semesters" },
                  {
                    label: "Compensation",
                    value: "Unpaid; eligible for academic credit",
                  },
                  {
                    label: "Location",
                    value: "In-person, Salt Lake City — hybrid as work permits",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-1 bg-background p-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                  >
                    <p className="text-[12px] font-medium tracking-[0.15em] text-copper uppercase">
                      {row.label}
                    </p>
                    <p className="text-[15px] text-foreground-secondary">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                FAQ
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">Common questions</h2>
            </div>
            <div className="divide-y divide-border/60">
              {[
                {
                  q: "Do I need to be a finance major?",
                  a: "No. Current analysts come from quantitative analysis, finance, mathematics, and applied math. What matters is demonstrated quantitative and analytical capability — not degree name.",
                },
                {
                  q: "Can I apply as a freshman?",
                  a: "Yes. First-year students are welcome to apply, though the analytical case is evaluated on the same standard as any other candidate.",
                },
                {
                  q: "Is the work remote-friendly?",
                  a: "We're headquartered in Salt Lake City and prefer in-person collaboration for candidate review sessions. Individual research work is flexible.",
                },
                {
                  q: "How is this different from a university-backed fund?",
                  a: "SOF is independently operated. All investment decisions are made by the CIO. Students contribute analytical throughput within defined process boundaries — closer to how a real analyst pod operates.",
                },
              ].map((item) => (
                <div key={item.q} className="py-8">
                  <h3 className="font-heading text-xl text-ink">{item.q}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-foreground-secondary">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-ink py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <h2 className="text-4xl text-cloud sm:text-5xl">
                Ready to apply?
              </h2>
              <p className="mt-6 max-w-xl text-[17px] leading-[1.8] text-foreground-on-dark-muted">
                We review applications on a rolling basis. Send your materials
                to{" "}
                <a
                  href={`mailto:${FUND.contactEmail}`}
                  className="text-cloud underline decoration-copper/70 underline-offset-4 hover:decoration-copper"
                >
                  {FUND.contactEmail}
                </a>
                . Expect confirmation within a business day.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5 lg:justify-end">
              <Button
                href={`mailto:${FUND.contactEmail}?subject=SOF%20Student%20Analyst%20Application`}
              >
                Email Application
              </Button>
              <Button href="/program" variant="outline">
                <span className="text-cloud">Back to Program</span>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
