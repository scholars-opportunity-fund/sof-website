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
      <section className="bg-ink py-36 sm:py-44">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Careers
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            Apply now
          </h1>
          <p className="mt-8 max-w-xl text-[17px] text-foreground-on-dark-muted leading-[1.8]">
            Join the next cohort of student analysts at Scholars Opportunity
            Fund.
          </p>
        </Container>
      </section>

      {/* Positions */}
      <section className="py-32 sm:py-40">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-5xl">Open positions</h2>
            <div className="mt-16 border-t border-border/60 pt-12">
              <p className="text-[17px] text-foreground-muted leading-[1.8]">
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
